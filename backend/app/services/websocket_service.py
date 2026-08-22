from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, deal_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[deal_id].append(websocket)

    def disconnect(self, deal_id: str, websocket: WebSocket) -> None:
        if websocket in self._connections[deal_id]:
            self._connections[deal_id].remove(websocket)
        if not self._connections[deal_id]:
            del self._connections[deal_id]

    async def broadcast(self, deal_id: str, message: dict) -> None:
        for websocket in list(self._connections.get(deal_id, [])):
            await websocket.send_json(message)


manager = ConnectionManager()
