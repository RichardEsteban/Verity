import hashlib
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.db import store
from app.models import AuthResponse, WhatsAppAuthRequest
from app.utils.decorators import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _mock_custodial_wallet(user_id: str) -> str:
    """Simula la wallet custodial que WDK crearia para un usuario nuevo."""
    return "0x" + hashlib.sha256(user_id.encode()).hexdigest()[:40]


@router.post("/whatsapp", response_model=AuthResponse)
def authenticate_whatsapp(payload: WhatsAppAuthRequest) -> AuthResponse:
    if not payload.whatsapp_number.strip():
        raise HTTPException(400, "Invalid whatsapp_number")

    existing = store.find_user_by_whatsapp(payload.whatsapp_number)
    if existing:
        user, created = existing, False
    else:
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "whatsapp_number": payload.whatsapp_number,
            "wallet_address": _mock_custodial_wallet(user_id),
            "display_name": payload.display_name,
            "rating": None,
            "deal_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        store.users[user["id"]] = user
        created = True

    token = create_access_token(user["id"])
    return AuthResponse(token=token, user_id=user["id"], created=created)
