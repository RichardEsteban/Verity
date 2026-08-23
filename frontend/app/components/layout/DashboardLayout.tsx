"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, isAuthenticated, logout } from "@/app/lib/verify/auth";
import { cn } from "@/app/lib/verify/utils";
import type { User } from "@/app/lib/verify/types";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/deals", label: "Deals" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/withdraw", label: "Retirar" },
  { href: "/dashboard/profile", label: "Perfil" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setUser(getUser());
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Cargando dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-border bg-card px-4 py-6 md:flex md:flex-col">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            V
          </span>
          <span className="text-lg font-semibold tracking-tight">Verify</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:bg-accent/60 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border pt-4">
          <p className="px-2 text-xs text-muted">{user?.display_name}</p>
          <p className="px-2 text-xs text-muted-foreground">{user?.whatsapp_number}</p>
          <button
            type="button"
            className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-accent"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="md:pl-60">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-8">
          <p className="text-sm text-muted">Garantía P2P · Kapso · GenLayer</p>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
            Conectado al backend
          </span>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full bg-accent px-3 py-1 text-xs">
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
