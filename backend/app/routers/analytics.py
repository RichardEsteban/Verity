from fastapi import APIRouter, Depends

from app.services import analytics_service
from app.utils.decorators import get_current_user_id

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/earnings")
def earnings(user_id: str = Depends(get_current_user_id)) -> dict:
    return analytics_service.get_earnings(user_id)


@router.get("/stats")
def stats(user_id: str = Depends(get_current_user_id)) -> dict:
    return analytics_service.get_stats(user_id)


@router.get("/timeline")
def timeline(user_id: str = Depends(get_current_user_id)) -> list[dict]:
    return analytics_service.get_timeline(user_id)
