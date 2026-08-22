from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import analytics, arbitrage, auth, deals, kapso, websocket, withdraw

settings = get_settings()

app = FastAPI(title="Verify API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(deals.router)
app.include_router(kapso.router)
app.include_router(arbitrage.router)
app.include_router(analytics.router)
app.include_router(withdraw.router)
app.include_router(websocket.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
