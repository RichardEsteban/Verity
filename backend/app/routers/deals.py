import json
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.models import Deal, DealCreate
from app.services import deal_service
from app.services.image_service import upload_to_pinata
from app.utils.decorators import get_current_user_id

router = APIRouter(prefix="/api/deals", tags=["deals"])


@router.post("/create")
def create_deal(payload: DealCreate, user_id: str = Depends(get_current_user_id)) -> dict:
    deal = deal_service.create_deal(user_id, payload)
    return {
        "deal_id": deal.id,
        "status": deal.status.value,
        "share_link": f"verify.app/deals/{deal.id}",
    }


@router.get("/my-deals")
def my_deals(
    status: Optional[str] = None,
    limit: int = 10,
    user_id: str = Depends(get_current_user_id),
) -> list[Deal]:
    return deal_service.list_my_deals(user_id, status=status, limit=limit)


@router.get("/{deal_id}")
def get_deal(deal_id: str) -> dict:
    detail = deal_service.get_deal_detail(deal_id)
    if detail is None:
        raise HTTPException(404, "Deal not found")
    return detail


@router.post("/{deal_id}/upload-photo")
async def upload_photo(
    deal_id: str,
    photo: UploadFile = File(...),
    metadata: str = Form("{}"),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    if deal_service.get_deal(deal_id) is None:
        raise HTTPException(404, "Deal not found")

    content = await photo.read()
    ipfs_hash = upload_to_pinata(content)

    try:
        parsed_metadata = json.loads(metadata) if metadata else {}
    except json.JSONDecodeError:
        raise HTTPException(400, "metadata debe ser JSON valido")

    deal_service.add_photo(deal_id, user_id, ipfs_hash, parsed_metadata)
    return {"ipfs_hash": ipfs_hash, "metadata_saved": True}
