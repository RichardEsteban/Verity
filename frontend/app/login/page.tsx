"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header, Footer } from "@/app/components/common/Header";
import { login } from "@/app/lib/verify/auth";

export default function LoginPage() {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState("+51 987 654 321");
  const [name, setName] = useState("Constructora Andes");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!whatsapp.trim()) {
      setError("Número de WhatsApp inválido");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await login(whatsapp.trim(), name.trim());
      router.push("/dashboard");
    } catch {
      setError("No se pudo conectar con el backend. ¿Está corriendo en " + (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-2xl font-semibold">Entrar con WhatsApp</h1>
        <p className="mt-2 text-sm text-muted">
          Mismo número que usarías en el bot: si ya creaste un deal por WhatsApp con este número, lo vas a ver acá.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            Número
            <input
              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Nombre
            <input
              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Entrando..." : "Continuar"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
