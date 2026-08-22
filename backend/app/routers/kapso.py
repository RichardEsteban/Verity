from fastapi import APIRouter, HTTPException

from app.models import DealStatus
from app.services import deal_service, kapso_service
from app.services.websocket_service import manager

router = APIRouter(prefix="/api/kapso", tags=["kapso"])


@router.post("/create-payment")
def create_payment(payload: dict) -> dict:
    return kapso_service.create_payment_link(payload["deal_id"], payload["amount"], payload["user_phone"])


@router.post("/webhook")
async def kapso_webhook(payload: dict) -> dict:
    deal_id = payload["deal_id"]
    amount = payload["amount"]
    status = payload["status"]
    payment_id = payload["payment_id"]

    if status != "confirmed":
        return {"ok": True}

    deal = deal_service.get_deal(deal_id)
    if deal is None:
        raise HTTPException(404, "Deal not found")

    kapso_service.record_payment(deal_id, payment_id, amount)
    deal_service.update_deal_status(deal_id, DealStatus.escrowed)
    await manager.broadcast(deal_id, {"type": "payment_received", "amount": amount})
    return {"ok": True}


@router.get("/payment-status/{payment_id}")
def payment_status(payment_id: str) -> dict:
    payment = kapso_service.get_payment_by_kapso_id(payment_id)
    if payment is None:
        raise HTTPException(404, "Payment not found")
    return {"status": payment["status"], "amount": payment["amount_pen"], "confirmed_at": payment["confirmed_at"]}
