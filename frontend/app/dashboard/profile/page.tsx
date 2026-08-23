"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/app/lib/verify/auth";
import type { User } from "@/app/lib/verify/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setName(u?.display_name ?? "");
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Perfil</h1>
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <p className="text-sm text-muted">WhatsApp {user.whatsapp_number}</p>
        <p className="text-sm text-muted">Wallet custodial {user.wallet_address || "—"}</p>
        <p className="text-sm text-muted">
          Rating {user.rating} · {user.deal_count} deals
        </p>
        <label className="block text-sm">
          Nombre para mostrar
          <input
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          onClick={() => {
            const next = { ...user, display_name: name };
            localStorage.setItem("verify_user", JSON.stringify(next));
            setUser(next);
            setSaved(true);
          }}
        >
          Guardar
        </button>
        {saved && <p className="text-sm text-emerald-400">Guardado en este navegador.</p>}
      </div>
    </div>
  );
}
