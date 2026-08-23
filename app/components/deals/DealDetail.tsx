"use client";

import Link from "next/link";
import type { Deal } from "@/app/lib/verify/types";
import { formatDate, formatPen, formatUsdt, MILESTONE_STATUS_LABEL, shortHash } from "@/app/lib/verify/utils";
import { ArbitrationTimeline } from "@/app/components/agents/ArbitrationTimeline";
import { AgentAnimation } from "@/app/components/agents/AgentAnimation";

function PhotoTile({ caption, hash }: { caption: string; hash: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-accent">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-emerald-900/40 to-sky-900/30 text-xs text-muted">
        IPFS {hash.slice(0, 10)}
      </div>
      <p className="px-3 py-2 text-xs">{caption}</p>
    </div>
  );
}

export function DealDetail({ deal }: { deal: Deal }) {
  const live = deal.status === "arbitrating" || deal.status === "disputed" || deal.milestones.some((m) => m.status === "arbitrating");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted">{deal.id}</p>
          <h1 className="text-2xl font-semibold">{deal.service}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{deal.description}</p>
        </div>
        <Link
          href={`/dashboard/deals/${deal.id}/live`}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Ver agents en vivo
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Monto" value={formatPen(deal.amount_pen)} hint={formatUsdt(deal.amount_usdt)} />
        <Stat label="Vendedor" value={deal.seller.display_name} hint={deal.seller.whatsapp_number} />
        <Stat label="Comprador" value={deal.buyer.display_name} hint={deal.buyer.whatsapp_number} />
        <Stat
          label="Contrato"
          value={deal.smart_contract_address ? shortHash(deal.smart_contract_address) : "—"}
          hint={deal.high_value ? "High value · guardrails extra" : deal.deal_type}
        />
      </div>

      {deal.deal_type === "deposit" && (
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm">
          🔒 Depósito {formatUsdt(deal.amount_usdt)} en contrato {deal.smart_contract_address}. Check-in{" "}
          {deal.checkin_at ? formatDate(deal.checkin_at) : "—"} · check-out{" "}
          {deal.checkout_at ? formatDate(deal.checkout_at) : "—"}.
          {deal.claimed_damage_pen != null && (
            <span className="mt-1 block">
              Reclamo {formatPen(deal.claimed_damage_pen)} · propuesto split {formatPen(deal.repair_amount_pen ?? 0)} /{" "}
              {formatPen(deal.refund_amount_pen ?? 0)}.
            </span>
          )}
        </div>
      )}

      {deal.is_milestone_based && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Hitos</h2>
          <div className="space-y-3">
            {deal.milestones.map((m) => {
              const filled = m.status === "completed" ? 100 : m.status === "arbitrating" || m.status === "escrowed" ? 55 : 0;
              return (
                <div key={m.id} className="rounded-xl border border-border p-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>
                      Hito {m.order_index}/{deal.milestones.length}: {m.description}
                    </span>
                    <span className="text-muted">
                      {formatPen(m.amount_pen)} · {MILESTONE_STATUS_LABEL[m.status]}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-accent">
                    <div className="h-full bg-emerald-400" style={{ width: `${filled}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Evidencia</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {deal.photos.map((p) => (
            <PhotoTile key={p.id} caption={p.caption} hash={p.ipfs_hash} />
          ))}
        </div>
      </section>

      {live && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Arbitraje en vivo</h2>
          <AgentAnimation dealId={deal.id} />
        </section>
      )}

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Timeline</h2>
          <ArbitrationTimeline deal={deal} />
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Pagos y payouts</h2>
          <ul className="space-y-2 text-sm">
            {deal.payments.map((p) => (
              <li key={p.id} className="rounded-lg border border-border px-3 py-2">
                Kapso {p.kapso_payment_id} · {formatPen(p.amount_pen)} · {p.status}
              </li>
            ))}
            {deal.payouts.map((p) => (
              <li key={p.id} className="rounded-lg border border-border px-3 py-2">
                WDK {p.role} · {p.amount_usdt} USDT · {shortHash(p.tx_hash)}
              </li>
            ))}
          </ul>
          {deal.ratings.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 font-semibold">Ratings</h3>
              {deal.ratings.map((r) => (
                <p key={r.comment} className="text-sm text-muted">
                  {"★".repeat(r.score)} {r.from}: “{r.comment}”
                </p>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
