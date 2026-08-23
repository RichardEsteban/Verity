import type { CategorySlice, EarningsPoint } from "@/app/lib/verify/types";

export function StatsCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function IncomeChart({ data }: { data: EarningsPoint[] }) {
  const max = Math.max(...data.map((d) => d.earnings), 1);
  const w = 560;
  const h = 180;
  const pad = 24;
  const pts = data
    .map((d, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(data.length - 1, 1);
      const y = h - pad - (d.earnings / max) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 font-semibold">Ingresos / mes (USDT)</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-48 w-full">
        <polyline fill="none" stroke="currentColor" className="text-primary" strokeWidth="3" points={pts} />
        {data.map((d, i) => {
          const x = pad + (i * (w - pad * 2)) / Math.max(data.length - 1, 1);
          return (
            <text key={d.month} x={x} y={h - 6} textAnchor="middle" className="fill-muted text-[10px]">
              {d.month}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function CategoryPie({ data }: { data: CategorySlice[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0) || 1;
  let acc = 0;
  const colors = ["#34d399", "#38bdf8", "#a78bfa"];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 font-semibold">Ingresos por categoría</h3>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 32 32" className="h-28 w-28 -rotate-90">
          {data.map((d, i) => {
            const dash = (d.amount / total) * 100;
            const gap = 100 - dash;
            const offset = acc;
            acc += dash;
            return (
              <circle
                key={d.category}
                r="10"
                cx="16"
                cy="16"
                fill="transparent"
                stroke={colors[i % colors.length]}
                strokeWidth="6"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
              />
            );
          })}
        </svg>
        <ul className="space-y-1 text-sm">
          {data.map((d, i) => (
            <li key={d.category} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: colors[i % colors.length] }} />
              {d.category} · {d.amount} USDT
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs text-muted">Montos en USDT (mock)</p>
    </div>
  );
}
