"use client";

import Link from "next/link";
import type { Deal } from "@/app/lib/verify/types";
import { DEAL_STATUS_LABEL, cn, formatPen, statusTone } from "@/app/lib/verify/utils";

function Badge({ status }: { status: string }) {
  const tone = statusTone(status);
  const cls =
    tone === "ok"
      ? "bg-emerald-500/15 text-emerald-400"
      : tone === "warn"
        ? "bg-amber-500/15 text-amber-400"
        : "bg-accent text-muted";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", cls)}>
      {DEAL_STATUS_LABEL[status as Deal["status"]] ?? status}
    </span>
  );
}

export function DealCard({ deal }: { deal: Deal }) {
  const done = deal.milestones.filter((m) => m.status === "completed").length;
  const total = deal.milestones.length || 1;
  const pct = deal.is_milestone_based ? Math.round((done / total) * 100) : deal.status === "completed" ? 100 : 40;

  return (
    <Link href={`/dashboard/deals/${deal.id}`} className="block rounded-2xl border border-border bg-card p-4 hover:border-primary/50">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{deal.service}</p>
          <p className="text-xs text-muted">{deal.id}</p>
        </div>
        <Badge status={deal.status} />
      </div>
      <p className="mb-3 text-sm text-muted">
        {deal.deal_type === "deposit" ? "Huésped" : "Cliente"}: {deal.buyer.display_name} · {formatPen(deal.amount_pen)}
      </p>
      {deal.is_milestone_based && (
        <>
          <p className="mb-1 text-xs text-muted">
            Hito {Math.min(done + 1, total)}/{total}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-accent">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </>
      )}
    </Link>
  );
}

export function DealTable({ deals }: { deals: Deal[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-accent/50 text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Deal</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Monto</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Contraparte</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id} className="border-b border-border last:border-0 hover:bg-accent/30">
              <td className="px-4 py-3">
                <Link href={`/dashboard/deals/${deal.id}`} className="font-medium hover:underline">
                  {deal.service}
                </Link>
                <p className="text-xs text-muted">{deal.id}</p>
              </td>
              <td className="px-4 py-3 text-muted">
                {deal.deal_type === "deposit" ? "Depósito" : deal.is_milestone_based ? "Hitos" : "Servicio"}
              </td>
              <td className="px-4 py-3 tabular-nums">{formatPen(deal.amount_pen)}</td>
              <td className="px-4 py-3">
                <Badge status={deal.status} />
              </td>
              <td className="px-4 py-3 text-muted">{deal.buyer.display_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {deals.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">No hay deals.</p>}
    </div>
  );
}
