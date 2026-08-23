import pytest
from fastapi.testclient import TestClient

from app.agents import paybot_agent
from app.db import store
from main import app


@pytest.fixture()
def client(monkeypatch):
    store.reset()

    # send_usdt ahora llama de verdad a WDK (backend/wdk_bridge/send.mjs) y hace
    # una transaccion real en testnet. Los tests no deben depender de red ni de
    # una wallet fondeada, asi que se mockea solo esta llamada puntual.
    async def fake_send_usdt(recipient_wallet: str, amount_usdt: float) -> str:
        return f"0xtest{abs(hash((recipient_wallet, amount_usdt))):060x}"[:66]

    monkeypatch.setattr(paybot_agent, "send_usdt", fake_send_usdt)

    yield TestClient(app)
    store.reset()
