from fastapi import APIRouter, HTTPException

from app.agents import genlayer_agent, paybot_agent
from app.db import store
from app.models import ArbitrationDecision, DealStatus
from app.services import deal_service

router = APIRouter(prefix="/api/arbitrage", tags=["arbitrage"])


@router.post("/{deal_id}/start")
async def start_arbitration(deal_id: str) -> dict:
    deal = deal_service.get_deal(deal_id)
    if deal is None:
        raise HTTPException(404, "Deal not found")
    if deal.status != DealStatus.escrowed:
        raise HTTPException(400, f"Deal debe estar 'escrowed' para arbitrar (actual: {deal.status.value})")

    deal_service.update_deal_status(deal_id, DealStatus.arbitrating)

    photo = deal_service.get_latest_photo(deal_id)
    result = await genlayer_agent.run_consensus(deal_id, deal.service_description, has_photo=photo is not None)

    payout = None
    if result["decision"] == ArbitrationDecision.cumplido:
        seller = store.users.get(deal.seller_id)
        if seller and seller.get("wallet_address"):
            try:
                payout = await paybot_agent.execute_payout(deal_id, seller["wallet_address"], deal.amount_usdt)
            except paybot_agent.GuardrailError as exc:
                deal_service.update_deal_status(deal_id, DealStatus.disputed)
                raise HTTPException(422, str(exc))
        deal_service.update_deal_status(deal_id, DealStatus.completed)
    else:
        deal_service.update_deal_status(deal_id, DealStatus.disputed)

    return {
        "deal_id": deal_id,
        "decision": result["decision"].value,
        "confidence": result["confidence"],
        "status": deal_service.get_deal(deal_id).status.value,
        "payout": payout,
    }


@router.get("/{deal_id}/status")
def arbitration_status(deal_id: str) -> dict:
    logs = store.list_arbitration_logs(deal_id)
    agents = {log["agent_name"]: log for log in logs if log["agent_name"] in ("gemini", "claude")}
    consensus = next((log for log in logs if log["agent_name"] == "consensus"), None)
    return {"deal_id": deal_id, "agents": agents, "consensus": consensus}
