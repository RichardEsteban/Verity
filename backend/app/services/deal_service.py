import uuid
from datetime import datetime, timezone
from typing import Optional

from app.db import store
from app.models import Deal, DealCreate, DealStatus, Photo

HIGH_VALUE_THRESHOLD_USDT = 1000.0
PEN_PER_USDT = 3.7


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_deal(seller_id: str, payload: DealCreate) -> Deal:
    amount_usdt = round(payload.amount_pen / PEN_PER_USDT, 2)
    row = {
        "id": str(uuid.uuid4()),
        "seller_id": seller_id,
        "buyer_id": None,
        "service_description": payload.service_description,
        "amount_pen": payload.amount_pen,
        "amount_usdt": amount_usdt,
        "status": DealStatus.pending_buyer.value,
        "high_value": amount_usdt > HIGH_VALUE_THRESHOLD_USDT,
        "created_at": _now(),
        "updated_at": _now(),
        "completed_at": None,
    }
    store.deals[row["id"]] = row
    return Deal(**row)


def get_deal(deal_id: str) -> Optional[Deal]:
    row = store.deals.get(deal_id)
    return Deal(**row) if row else None


def list_my_deals(user_id: str, status: Optional[str] = None, limit: int = 10) -> list[Deal]:
    return [Deal(**row) for row in store.list_deals_by_seller(user_id, status=status, limit=limit)]


def update_deal_status(deal_id: str, status: DealStatus) -> None:
    row = store.deals[deal_id]
    row["status"] = status.value
    row["updated_at"] = _now()
    if status == DealStatus.completed:
        row["completed_at"] = _now()


def add_photo(deal_id: str, uploaded_by: str, ipfs_hash: str, metadata: dict) -> Photo:
    row = {
        "id": str(uuid.uuid4()),
        "deal_id": deal_id,
        "uploaded_by": uploaded_by,
        "ipfs_hash": ipfs_hash,
        "metadata": metadata,
        "uploaded_at": _now(),
    }
    store.photos[row["id"]] = row
    return Photo(**row)


def get_latest_photo(deal_id: str) -> Optional[Photo]:
    rows = store.list_photos_for_deal(deal_id)
    return Photo(**rows[0]) if rows else None


def get_deal_detail(deal_id: str) -> Optional[dict]:
    """Deal + lo que la pantalla de detalle del frontend necesita: vendedor,
    fotos, pagos, payouts y el log de arbitraje. Todo en un solo round-trip."""
    row = store.deals.get(deal_id)
    if row is None:
        return None

    seller = store.users.get(row["seller_id"])
    return {
        **row,
        "seller": seller,
        "photos": store.list_photos_for_deal(deal_id),
        "payments": store.list_payments_for_deal(deal_id),
        "payouts": store.list_payouts_for_deal(deal_id),
        "arbitration": store.list_arbitration_logs(deal_id),
    }
