"""Almacenamiento en memoria para la demo. Nada persiste entre reinicios del server.

Cambiar esto por Supabase (u otra DB real) es cuestion de reemplazar las funciones
de este modulo -- el resto del backend solo importa de aca, nunca dicts sueltos.
"""

from typing import Optional

users: dict[str, dict] = {}
deals: dict[str, dict] = {}
photos: dict[str, dict] = {}
payments: dict[str, dict] = {}
arbitration_logs: dict[str, dict] = {}
payout_logs: dict[str, dict] = {}


def reset() -> None:
    """Solo para tests: vacia el store entre casos."""
    users.clear()
    deals.clear()
    photos.clear()
    payments.clear()
    arbitration_logs.clear()
    payout_logs.clear()


def find_user_by_whatsapp(whatsapp_number: str) -> Optional[dict]:
    return next((u for u in users.values() if u["whatsapp_number"] == whatsapp_number), None)


def list_deals_by_seller(seller_id: str, status: Optional[str] = None, limit: int = 10) -> list[dict]:
    rows = [d for d in deals.values() if d["seller_id"] == seller_id]
    if status:
        rows = [d for d in rows if d["status"] == status]
    rows.sort(key=lambda d: d["created_at"], reverse=True)
    return rows[:limit]


def list_photos_for_deal(deal_id: str) -> list[dict]:
    rows = [p for p in photos.values() if p["deal_id"] == deal_id]
    rows.sort(key=lambda p: p["uploaded_at"], reverse=True)
    return rows


def list_arbitration_logs(deal_id: str) -> list[dict]:
    return [a for a in arbitration_logs.values() if a["deal_id"] == deal_id]


def list_payments_for_deal(deal_id: str) -> list[dict]:
    return [p for p in payments.values() if p["deal_id"] == deal_id]


def list_payouts_for_deal(deal_id: str) -> list[dict]:
    return [p for p in payout_logs.values() if p["deal_id"] == deal_id]


def sum_confirmed_payouts_today(recipient_wallet: str, since_iso: str) -> float:
    return sum(
        p["amount_usdt"]
        for p in payout_logs.values()
        if p["recipient_wallet"] == recipient_wallet
        and p["status"] == "confirmed"
        and p.get("confirmed_at", "") >= since_iso
    )
