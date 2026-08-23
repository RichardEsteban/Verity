import { shortHash } from "@/app/lib/verify/utils";

type Props = {
  status: string;
  ready: boolean;
  tx_hash: string | null;
  amount_usdt: number | null;
};

export function PayBotAgent({ status, ready, tx_hash, amount_usdt }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted">PayBot + WDK</p>
      <h3 className="mb-3 text-lg font-semibold">Payout</h3>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-accent">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all"
          style={{ width: tx_hash ? "100%" : ready ? "70%" : "18%" }}
        />
      </div>
      <p className="text-sm">{status}</p>
      {amount_usdt != null && <p className="mt-1 text-sm text-muted">{amount_usdt} USDT</p>}
      {tx_hash && (
        <p className="mt-2 font-mono text-xs text-emerald-400">TX {shortHash(tx_hash)}</p>
      )}
    </div>
  );
}
