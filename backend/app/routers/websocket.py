from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.websocket_service import manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/arbitrage/{deal_id}")
async def arbitrage_socket(websocket: WebSocket, deal_id: str) -> None:
    await manager.connect(deal_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(deal_id, websocket)
