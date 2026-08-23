"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DealCard } from "@/app/components/deals/DealCard";
import { StatsCard } from "@/app/components/charts/StatsCard";
import { Loading } from "@/app/components/common/Loading";
import { fetchMyDeals, fetchStats } from "@/app/lib/verify/api";
import type { AnalyticsStats, Deal } from "@/app/lib/verify/types";
import { formatUsdt } from "@/app/lib/verify/utils";

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);

  useEffect(() => {
    fetchMyDeals().then(setDeals);
    fetchStats().then(setStats);
  }, []);

  if (!stats) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted">Transparencia en tiempo real de tus deals y payouts.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total ganado" value={formatUsdt(stats.total_earned)} />
        <StatsCard label="Deals completados" value={String(stats.deals_completed)} />
        <StatsCard label="Rating" value={stats.rating.toFixed(1)} hint="sobre 5" />
        <StatsCard label="Tiempo a payout" value={`${stats.avg_time_to_payout} min`} hint={`${stats.success_rate}% éxito`} />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Deals recientes</h2>
        <Link href="/dashboard/deals" className="text-sm text-primary">
          Ver todos
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </div>
  );
}
