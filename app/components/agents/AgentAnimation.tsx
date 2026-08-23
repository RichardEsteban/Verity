"use client";

import { useEffect, useState } from "react";
import type { ArbitrationLiveState } from "@/app/lib/verify/types";
import { subscribeArbitration } from "@/app/lib/verify/websocket";
import { ClaudeAgent, GeminiAgent } from "./GeminiAgent";
import { PayBotAgent } from "./PayBotAgent";

export function AgentAnimation({ dealId }: { dealId: string }) {
  const [state, setState] = useState<ArbitrationLiveState | null>(null);

  useEffect(() => {
    return subscribeArbitration(dealId, setState);
  }, [dealId]);

  if (!state) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <GeminiAgent
          progress={state.gemini.progress}
          status={state.gemini.status}
          eta={state.gemini.eta}
          decision={state.gemini.decision}
          confidence={state.gemini.confidence}
        />
        <ClaudeAgent
          progress={state.claude.progress}
          status={state.claude.status}
          eta={state.claude.eta}
          decision={state.claude.decision}
          confidence={state.claude.confidence}
        />
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-wide text-muted">Consensus</p>
        <h3 className="mb-2 text-lg font-semibold">
          {state.consensus.verdict ? `Veredicto: ${state.consensus.verdict}` : "Esperando votos"}
        </h3>
        <p className="text-sm text-muted">
          Votos {state.consensus.votes_received}/{state.consensus.votes_needed}
        </p>
        {state.consensus.claimed != null && (
          <p className="mt-2 text-sm">
            Reclamado: S/{state.consensus.claimed}
            {state.consensus.approved != null ? ` · Aprobado: S/${state.consensus.approved}` : ""}
          </p>
        )}
        {state.consensus.split && (
          <p className="mt-1 text-sm text-emerald-400">
            Split: anfitrión S/{state.consensus.split.host} / huésped S/{state.consensus.split.guest}
          </p>
        )}
      </div>
      <PayBotAgent
        status={state.paybot.status}
        ready={state.paybot.ready}
        tx_hash={state.paybot.tx_hash}
        amount_usdt={state.paybot.amount_usdt}
      />
    </div>
  );
}
