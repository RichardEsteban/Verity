"use client";

import { useEffect, useMemo, useState } from "react";
import { DealTable } from "@/app/components/deals/DealTable";
import { fetchMyDeals } from "@/app/lib/verify/api";
import type { Deal, DealStatus } from "@/app/lib/verify/types";
import { Loading } from "@/app/components/common/Loading";

const FILTERS: Array<{ id: "all" | DealStatus; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "escrowed", label: "Escrow" },
  { id: "arbitrating", label: "Arbitrando" },
  { id: "disputed", label: "Disputa" },
  { id: "completed", label: "Completados" },
];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [status, setStatus] = useState<"all" | DealStatus>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setDeals(null);
    fetchMyDeals({ status, q }).then(setDeals);
  }, [status, q]);

  const pages = useMemo(() => {
    if (!deals) return 1;
    return Math.max(1, Math.ceil(deals.length / pageSize));
  }, [deals]);

  const slice = deals?.slice((page - 1) * pageSize, page * pageSize) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Deals</h1>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          placeholder="Buscar servicio, id o cliente"
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm md:max-w-sm"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setPage(1);
                setStatus(f.id);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium ${status === f.id ? "bg-primary text-primary-foreground" : "bg-accent text-muted"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {!deals ? <Loading /> : <DealTable deals={slice} />}
      <div className="flex items-center justify-end gap-2 text-sm">
        <button type="button" disabled={page <= 1} className="rounded-lg border border-border px-3 py-1 disabled:opacity-40" onClick={() => setPage((p) => p - 1)}>
          Anterior
        </button>
        <span className="text-muted">
          {page}/{pages}
        </span>
        <button type="button" disabled={page >= pages} className="rounded-lg border border-border px-3 py-1 disabled:opacity-40" onClick={() => setPage((p) => p + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
