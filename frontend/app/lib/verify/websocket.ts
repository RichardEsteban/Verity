"use client";

import type { AgentDecision, ArbitrationLiveState } from "./types";
import { API_URL, request } from "./backend";

type Listener = (state: ArbitrationLiveState) => void;

const WS_BASE = API_URL.replace(/^http/, "ws");

function emptyState(): ArbitrationLiveState {
  return {
    gemini: { progress: 0, status: "Esperando evidencia...", decision: null, confidence: null, eta: null },
    claude: { progress: 0, status: "Esperando evidencia...", decision: null, confidence: null, eta: null },
    consensus: { votes_received: 0, votes_needed: 2, verdict: null },
    paybot: { status: "Esperando consenso", ready: false, tx_hash: null, amount_usdt: null },
  };
}

function clone(state: ArbitrationLiveState): ArbitrationLiveState {
  return {
    gemini: { ...state.gemini },
    claude: { ...state.claude },
    consensus: { ...state.consensus },
    paybot: { ...state.paybot },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyMessage(state: ArbitrationLiveState, msg: any) {
  if (msg.type === "arbitration_progress" && (msg.agent === "gemini" || msg.agent === "claude")) {
    const agent = state[msg.agent as "gemini" | "claude"];
    agent.progress = 100;
    agent.status = "Listo";
    agent.decision = msg.decision as AgentDecision;
    agent.confidence = msg.confidence;
    agent.eta = 0;
    state.consensus.votes_received = Math.min(2, state.consensus.votes_received + 1);
  }
  if (msg.type === "arbitration_complete") {
    state.consensus.verdict = msg.decision;
    if (msg.decision === "CUMPLIDO") {
      state.paybot.status = "Enviando payout...";
      state.paybot.ready = true;
    }
  }
  if (msg.type === "payout_complete") {
    state.paybot.status = "CONFIRMED";
    state.paybot.ready = true;
    state.paybot.tx_hash = msg.tx_hash;
    state.paybot.amount_usdt = msg.amount_usdt;
  }
}

/**
 * Conecta al websocket real del backend (/ws/arbitrage/{dealId}) y, al abrir
 * la conexion, dispara POST /api/arbitrage/{dealId}/start -- asi los eventos
 * de Gemini/Claude/PayBot que emite el backend real llegan por este mismo
 * socket en vez de ser una animacion simulada con setInterval.
 */
export function subscribeArbitration(dealId: string, onUpdate: Listener) {
  const state = emptyState();
  onUpdate(clone(state));

  const ws = new WebSocket(`${WS_BASE}/ws/arbitrage/${dealId}`);

  ws.onopen = () => {
    request(`/api/arbitrage/${dealId}/start`, { method: "POST" }).catch(() => {
      // Puede fallar si el deal ya fue arbitrado o no esta escrowed todavia;
      // no es un error fatal para la vista en vivo.
    });
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      applyMessage(state, msg);
      onUpdate(clone(state));
    } catch {
      // ignorar mensajes que no sean JSON valido
    }
  };

  return () => ws.close();
}
