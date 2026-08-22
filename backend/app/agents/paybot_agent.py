import uuid
from datetime import datetime, timezone

from app.agents.wdk_cli_wrapper import send_usdt
from app.db import store
from app.services.websocket_service import manager

DAILY_LIMIT_USDT = 5000.0


class GuardrailError(RuntimeError):
    pass


def _check_daily_limit(recipient_wallet: str, additional_amount_usdt: float) -> None:
    start_of_day = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    already_paid = store.sum_confirmed_payouts_today(recipient_wallet, start_of_day)
    if already_paid + additional_amount_usdt > DAILY_LIMIT_USDT:
        raise GuardrailError(
            f"Daily limit excedido: ya pagado {already_paid} USDT hoy, "
            f"+{additional_amount_usdt} supera el limite de {DAILY_LIMIT_USDT} USDT"
        )


async def execute_payout(deal_id: str, recipient_wallet: str, amount_usdt: float) -> dict:
    _check_daily_limit(recipient_wallet, amount_usdt)

    now = datetime.now(timezone.utc).isoformat()
    row_id = str(uuid.uuid4())
    row = {
        "id": row_id,
        "deal_id": deal_id,
        "amount_usdt": amount_usdt,
        "recipient_wallet": recipient_wallet,
        "status": "pending",
        "created_at": now,
        "tx_hash": None,
        "confirmed_at": None,
    }
    store.payout_logs[row_id] = row

    tx_hash = await send_usdt(recipient_wallet, amount_usdt)
    row["tx_hash"] = tx_hash
    row["status"] = "confirmed"
    row["confirmed_at"] = datetime.now(timezone.utc).isoformat()

    await manager.broadcast(
        deal_id,
        {"type": "payout_complete", "tx_hash": tx_hash, "amount_usdt": amount_usdt, "recipient_wallet": recipient_wallet},
    )
    return row
