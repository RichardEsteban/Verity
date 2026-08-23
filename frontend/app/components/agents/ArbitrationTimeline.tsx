"use client";

import type { Deal } from "@/app/lib/verify/types";
import { formatDate, formatPen } from "@/app/lib/verify/utils";

export function ArbitrationTimeline({ deal }: { deal: Deal }) {
  const events: { label: string; at: string | null; done: boolean }[] = [];

  if (deal.deal_type === "deposit") {
    events.push(
      { label: "Depósito creado (contrato)", at: deal.created_at, done: true },
      { label: "Depósito bloqueado on-chain", at: deal.payments[0]?.confirmed_at ?? null, done: Boolean(deal.payments[0]?.confirmed_at) },
      { label: "Check-in", at: deal.checkin_at, done: Boolean(deal.checkin_at) },
      { label: "Check-out", at: deal.checkout_at, done: Boolean(deal.checkout_at) },
      { label: "Daño reportado", at: deal.photos.find((p) => p.caption.includes("Después"))?.metadata.timestamp ?? null, done: deal.status === "disputed" || Boolean(deal.repair_amount_pen) },
      {
        label: deal.repair_amount_pen
          ? `Arbitraje split ${formatPen(deal.repair_amount_pen)} / ${formatPen(deal.refund_amount_pen ?? 0)}`
          : "Arbitraje de daño",
        at: null,
        done: Boolean(deal.payouts.length),
      },
    );
    for (const p of deal.payouts) {
      events.push({
        label: `${p.role === "host_repair" ? "Anfitrión" : p.role === "guest_refund" ? "Huésped" : "Payout"} · ${p.amount_usdt} USDT`,
        at: p.confirmed_at,
        done: p.status === "confirmed",
      });
    }
  } else if (deal.is_milestone_based) {
    for (const m of deal.milestones) {
      events.push({
        label: `Hito ${m.order_index}: ${m.description} · ${formatPen(m.amount_pen)}`,
        at: m.completed_at,
        done: m.status === "completed",
      });
    }
  } else {
    events.push(
      { label: "Deal creado", at: deal.created_at, done: true },
      { label: "Pago Kapso", at: deal.payments[0]?.confirmed_at ?? null, done: Boolean(deal.payments[0]) },
      { label: "Payout", at: deal.payouts[0]?.confirmed_at ?? null, done: Boolean(deal.payouts[0]) },
    );
  }

  return (
    <ol className="space-y-3">
      {events.map((e, i) => (
        <li key={`${e.label}-${i}`} className="flex gap-3">
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${e.done ? "bg-emerald-400" : "bg-border"}`} />
          <div>
            <p className="text-sm font-medium">{e.label}</p>
            <p className="text-xs text-muted">{e.at ? formatDate(e.at) : "Pendiente"}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
