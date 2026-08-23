import Link from "next/link";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">V</span>
        Verify
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/login" className="text-muted hover:text-foreground">
          Entrar
        </Link>
        <Link href="/dashboard" className="rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-foreground">
          Dashboard
        </Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted">
      Verify · garantía P2P con arbitraje por IA · Kapso + WDK
    </footer>
  );
}
