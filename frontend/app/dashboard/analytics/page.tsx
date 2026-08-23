"use client";

import { CategoryPie, IncomeChart } from "@/app/components/charts/IncomeChart";
import { StatsCard } from "@/app/components/charts/StatsCard";
import { Loading } from "@/app/components/common/Loading";
import { fetchEarnings, fetchStats, fetchTimeline } from "@/app/lib/verify/api";
import type { AnalyticsStats, CategorySlice, EarningsPoint, TimelineEvent } from "@/app/lib/verify/types";
import { formatDate, formatUsdt } from "@/app/lib/verify/utils";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [points, setPoints] = useState<EarningsPoint[]>([]);
  const [cats, setCats] = useState<CategorySlice[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetchStats().then(setStats);
    fetchEarnings().then((r) => {
      setPoints(r.data);
      setCats(r.categories);
    });
    fetchTimeline().then(setTimeline);
  }, []);

  if (!stats) return <Loading />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total" value={formatUsdt(stats.total_earned)} />
        <StatsCard label="Deals" value={String(stats.deals_completed)} />
        <StatsCard label="Éxito" value={`${stats.success_rate}%`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <IncomeChart data={points} />
        <CategoryPie data={cats} />
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Timeline</h2>
        <ul className="space-y-2">
          {timeline.map((t) => (
            <li key={t.date + t.event} className="flex justify-between rounded-xl border border-border px-4 py-3 text-sm">
              <span>
                {t.event}
                <span className="ml-2 text-xs text-muted">{formatDate(t.date)}</span>
              </span>
              <span className="tabular-nums text-muted">{t.amount != null ? `S/${t.amount}` : t.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
