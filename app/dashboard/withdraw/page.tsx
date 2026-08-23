"use client";

import { useState } from "react";
import { confirmWithdraw, prepareWithdraw } from "@/app/lib/verify/api";
import { toast } from "sonner";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("200");
  const [method, setMethod] = useState<"kapso" | "internal">("kapso");
  const [account, setAccount] = useState("CCI 002-...-321");
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function prepare() {
    setBusy(true);
    try {
      const res = await prepareWithdraw(Number(amount), method, account);
      setWithdrawId(res.withdraw_id);
      toast.success("Retiro preparado. Ingresa el código 2FA mock (cualquier 6 dígitos).");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!withdrawId) return;
    setBusy(true);
    try {
      const res = await confirmWithdraw(withdrawId, code);
      toast.success(`Procesando · ${res.tx_hash}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Retirar</h1>
      <p className="text-sm text-muted">Kapso envía soles a tu cuenta. Internal deja USDT en wallet custodial WDK.</p>
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <label className="block text-sm">
          Monto (USDT)
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Método
          <select
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2"
            value={method}
            onChange={(e) => setMethod(e.target.value as "kapso" | "internal")}
          >
            <option value="kapso">Kapso (PEN a banco)</option>
            <option value="internal">Wallet interna USDT</option>
          </select>
        </label>
        <label className="block text-sm">
          Cuenta / destino
          <input
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={prepare}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Preparar retiro
        </button>
        {withdrawId && (
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-xs text-muted">ID {withdrawId}</p>
            <label className="block text-sm">
              Código 2FA
              <input
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </label>
            <button
              type="button"
              disabled={busy || code.length < 4}
              onClick={confirm}
              className="w-full rounded-xl border border-border py-2.5 text-sm font-semibold"
            >
              Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
