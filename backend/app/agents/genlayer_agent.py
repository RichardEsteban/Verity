"""Agente de arbitraje. En la demo simula el veredicto de Gemini + Claude
(sin llamar a ninguna API real) para que el flujo completo funcione sin
API keys. La firma de `run_consensus` es la que un backend real usaria,
para poder enchufar las llamadas reales despues sin tocar los routers."""

import asyncio
import uuid
from datetime import datetime, timezone

from app.db import store
from app.models import ArbitrationDecision
from app.services.websocket_service import manager

SIMULATED_STEP_DELAY_SECONDS = 0.3


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _log_agent_verdict(deal_id: str, agent_name: str, decision: ArbitrationDecision, confidence: int, reasoning: str) -> None:
    now = _now()
    row_id = str(uuid.uuid4())
    store.arbitration_logs[row_id] = {
        "id": row_id,
        "deal_id": deal_id,
        "agent_name": agent_name,
        "status": "complete",
        "progress": 100,
        "decision": decision.value,
        "confidence": confidence,
        "reasoning": reasoning,
        "started_at": now,
        "completed_at": now,
    }
    await manager.broadcast(
        deal_id,
        {"type": "arbitration_progress", "agent": agent_name, "decision": decision.value, "confidence": confidence},
    )


async def run_consensus(deal_id: str, service_description: str, has_photo: bool) -> dict:
    if not has_photo:
        decision, gemini_conf, claude_conf = ArbitrationDecision.incumplido, 40, 35
    else:
        decision, gemini_conf, claude_conf = ArbitrationDecision.cumplido, 98, 95

    await asyncio.sleep(SIMULATED_STEP_DELAY_SECONDS)
    await _log_agent_verdict(
        deal_id, "gemini", decision, gemini_conf, f"Evidencia para '{service_description}' analizada (simulado)"
    )

    await asyncio.sleep(SIMULATED_STEP_DELAY_SECONDS)
    await _log_agent_verdict(
        deal_id, "claude", decision, claude_conf, f"Calidad de '{service_description}' verificada (simulado)"
    )

    consensus_confidence = min(gemini_conf, claude_conf)
    now = _now()
    row_id = str(uuid.uuid4())
    store.arbitration_logs[row_id] = {
        "id": row_id,
        "deal_id": deal_id,
        "agent_name": "consensus",
        "status": "complete",
        "progress": 100,
        "decision": decision.value,
        "confidence": consensus_confidence,
        "reasoning": f"Gemini {gemini_conf}% + Claude {claude_conf}% -> {decision.value}",
        "started_at": now,
        "completed_at": now,
    }
    await manager.broadcast(
        deal_id, {"type": "arbitration_complete", "decision": decision.value, "confidence": consensus_confidence}
    )

    return {"decision": decision, "confidence": consensus_confidence}
