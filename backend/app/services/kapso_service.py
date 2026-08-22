"""Cliente Kapso simulado: genera links de pago y confirma pagos sin llamar a
ninguna API externa, para que la demo corra sin credenciales."""

import uuid
from datetime import datetime, timezone

from app.db import store

PEN_PER_USDT = 3.7


def convert_pen_to_usdt(amount_pen: float) -> float:
    return round(amount_pen / PEN_PER_USDT, 2)


def create_payment_link(deal_id: str, amount_pen: float, user_phone: str) -> dict:
    payment_id = f"kapso_{uuid.uuid4().hex[:10]}"
    return {
        "kapso_payment_id": payment_id,
        "payment_url": f"https://pay.kapso.pe/mock/{payment_id}",
    }


def record_payment(deal_id: str, kapso_payment_id: str, amount_pen: float) -> None:
    now = datetime.now(timezone.utc).isoformat()
    row_id = str(uuid.uuid4())
    store.payments[row_id] = {
        "id": row_id,
        "deal_id": deal_id,
        "kapso_payment_id": kapso_payment_id,
        "amount_pen": amount_pen,
        "status": "confirmed",
        "confirmed_at": now,
        "created_at": now,
    }


def get_payment_by_kapso_id(kapso_payment_id: str) -> dict | None:
    return next((p for p in store.payments.values() if p["kapso_payment_id"] == kapso_payment_id), None)
