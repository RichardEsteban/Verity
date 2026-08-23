"use client";

import type { ArbitrationLiveState } from "./types";

type Listener = (state: ArbitrationLiveState) => void;

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function baseState(kind: "milestone" | "deposit"): ArbitrationLiveState {
  if (kind === "deposit") {
    return {
      gemini: { progress: 8, status: "Comparando fotos antes/después…", decision: null, confidence: null, eta: 14 },
      claude: { progress: 4, status: "Leyendo reclamo de S/300…", decision: null, confidence: null, eta: 16 },
      consensus: { votes_received: 0, votes_needed: 2, verdict: null, claimed: 300, approved: undefined },
      paybot: { status: "Esperando consenso", ready: false, tx_hash: null, amount_usdt: null },
    };
  }
  return {
    gemini: { progress: 12, status: "Analizando fotos del hito…", decision: null, confidence: null, eta: 10 },
    claude: { progress: 6, status: "Procesando metadata EXIF…", decision: null, confidence: null, eta: 12 },
    consensus: { votes_received: 0, votes_needed: 2, verdict: null },
    paybot: { status: "Esperando consenso", ready: false, tx_hash: null, amount_usdt: null },
  };
}

export function subscribeArbitration(dealId: string, onUpdate: Listener) {
  const kind: "milestone" | "deposit" = dealId.includes("deposit") ? "deposit" : "milestone";
  const state = baseState(kind);
  onUpdate(clone(state));

  const tick = 380;
  let step = 0;
  const id = window.setInterval(() => {
    step += 1;
    state.gemini.progress = Math.min(100, state.gemini.progress + (kind === "deposit" ? 9 : 11));
    state.claude.progress = Math.min(100, state.claude.progress + (kind === "deposit" ? 7 : 9));
    if (state.gemini.eta) state.gemini.eta = Math.max(0, state.gemini.eta - 1);
    if (state.claude.eta) state.claude.eta = Math.max(0, state.claude.eta - 1);

    if (state.gemini.progress >= 55 && state.gemini.progress < 100) {
      state.gemini.status = kind === "deposit" ? "Estimando monto de daño…" : "Cruzando acuerdo vs evidencia…";
    }
    if (state.claude.progress >= 50 && state.claude.progress < 100) {
      state.claude.status = kind === "deposit" ? "Validando costo de reparación…" : "Verificando alcance del hito…";
    }

    if (state.gemini.progress >= 100 && !state.gemini.decision) {
      state.gemini.status = "Listo";
      state.gemini.eta = 0;
      if (kind === "deposit") {
        state.gemini.decision = "PARTIAL";
        state.gemini.confidence = 92;
      } else {
        state.gemini.decision = "CUMPLIDO";
        state.gemini.confidence = 97;
      }
      state.consensus.votes_received = Math.max(state.consensus.votes_received, 1);
    }
    if (state.claude.progress >= 100 && !state.claude.decision) {
      state.claude.status = "Listo";
      state.claude.eta = 0;
      if (kind === "deposit") {
        state.claude.decision = "PARTIAL";
        state.claude.confidence = 90;
      } else {
        state.claude.decision = "CUMPLIDO";
        state.claude.confidence = 96;
      }
      state.consensus.votes_received = 2;
    }

    if (state.consensus.votes_received === 2 && !state.consensus.verdict) {
      if (kind === "deposit") {
        state.consensus.verdict = "SPLIT";
        state.consensus.approved = 220;
        state.consensus.split = { host: 220, guest: 580 };
        state.paybot.status = "Ejecutando splitRelease…";
        state.paybot.ready = true;
      } else {
        state.consensus.verdict = "CUMPLIDO";
        state.paybot.status = "Enviando payout del hito…";
        state.paybot.ready = true;
        state.paybot.amount_usdt = 1625;
      }
    }

    if (state.paybot.ready && step > 16 && !state.paybot.tx_hash) {
      state.paybot.tx_hash = kind === "deposit" ? "0xsplit7a91" : "0x9f8e7d6c";
      state.paybot.status = "CONFIRMED";
      if (kind === "deposit") state.paybot.amount_usdt = 59;
    }

    onUpdate(clone(state));
    if (state.paybot.tx_hash) window.clearInterval(id);
  }, tick);

  return () => window.clearInterval(id);
}
