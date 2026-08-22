"""Wrapper de WDK CLI. En la demo simula el envio y devuelve un tx_hash con la
forma real de una transaccion (0x + 64 hex), sin llamar al CLI de verdad."""

import hashlib
import uuid


async def send_usdt(recipient_wallet: str, amount_usdt: float) -> str:
    seed = f"{recipient_wallet}:{amount_usdt}:{uuid.uuid4()}"
    return "0x" + hashlib.sha256(seed.encode()).hexdigest()
