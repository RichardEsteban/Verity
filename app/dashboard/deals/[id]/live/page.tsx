"use client";

import { use } from "react";
import Link from "next/link";
import { AgentAnimation } from "@/app/components/agents/AgentAnimation";

export default function LivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">{id}</p>
          <h1 className="text-2xl font-semibold">Agents en vivo</h1>
          <p className="text-sm text-muted">Simulación de WebSocket /ws/arbitrage/{id}</p>
        </div>
        <Link href={`/dashboard/deals/${id}`} className="text-sm text-primary">
          Volver al deal
        </Link>
      </div>
      <AgentAnimation dealId={id} />
    </div>
  );
}
