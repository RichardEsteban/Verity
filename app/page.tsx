import { Header, Footer } from "@/app/components/common/Header";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <p className="mb-3 text-sm font-medium text-emerald-400">Aleph Hackathon · WDK Track</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Garantía P2P para el mercado informal. Sin wallet. Con arbitraje por IA.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          El plomero, el taxista o la constructora pagan y cobran por WhatsApp + Kapso. El dashboard muestra en vivo a
          Gemini, Claude y PayBot resolviendo el escrow.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Entrar al dashboard
          </Link>
          <Link href="/deals/deal_xyz789" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold">
            Ver deal de hitos
          </Link>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            { t: "Kapso", d: "QR y transferencia bancaria. El usuario nunca ve blockchain." },
            { t: "GenLayer", d: "Gemini + Claude votan. Consensus visible en la web." },
            { t: "PayBot + WDK", d: "USDT automático, hitos o split de depósito estilo Airbnb." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold">{c.t}</h2>
              <p className="mt-2 text-sm text-muted">{c.d}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
