import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.agents.wdk_cli_wrapper import send_usdt
from app.db import store
from app.utils.decorators import get_current_user_id

router = APIRouter(prefix="/api/withdraw", tags=["withdraw"])

_pending_withdrawals: dict[str, dict] = {}


@router.post("/prepare")
def prepare_withdraw(payload: dict, user_id: str = Depends(get_current_user_id)) -> dict:
    withdraw_id = str(uuid.uuid4())
    _pending_withdrawals[withdraw_id] = {
        "user_id": user_id,
        "amount": payload["amount"],
        "method": payload.get("method", "kapso"),
        "status": "pending",
    }
    return {"withdraw_id": withdraw_id, "amount": payload["amount"], "method": payload.get("method", "kapso"), "2fa_required": True}


@router.post("/confirm")
async def confirm_withdraw(payload: dict, user_id: str = Depends(get_current_user_id)) -> dict:
    withdraw_id = payload["withdraw_id"]
    pending = _pending_withdrawals.get(withdraw_id)
    if pending is None or pending["user_id"] != user_id:
        raise HTTPException(404, "Withdraw not found")

    user = store.users.get(user_id)
    if not user or not user.get("wallet_address"):
        raise HTTPException(400, "Usuario sin wallet asociada")

    tx_hash = await send_usdt(user["wallet_address"], pending["amount"])
    pending["status"] = "processing"
    pending["tx_hash"] = tx_hash
    pending["confirmed_at"] = datetime.now(timezone.utc).isoformat()
    return {"status": "processing", "tx_hash": tx_hash}


@router.get("/status/{withdraw_id}")
def withdraw_status(withdraw_id: str) -> dict:
    pending = _pending_withdrawals.get(withdraw_id)
    if pending is None:
        raise HTTPException(404, "Withdraw not found")
    return {
        "status": pending["status"],
        "amount": pending["amount"],
        "confirmed_at": pending.get("confirmed_at"),
    }
