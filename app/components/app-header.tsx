"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ThemeToggle } from "./theme-toggle";

type AppHeaderProps = {
  showProfile?: boolean;
  showDashboard?: boolean;
};

export function AppHeader({
  showProfile = false,
  showDashboard = false,
}: AppHeaderProps) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <Link
        href="/"
        className="text-xl font-black tracking-tighter hover:opacity-80"
      >
        DRIP MATCH
      </Link>
      <div className="flex items-center gap-3">
        {showProfile && (
          <Link
            href="/profile"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Profile
          </Link>
        )}
        {showDashboard && (
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
        )}
        <ThemeToggle />
        <ConnectButton chainStatus="icon" showBalance={false} />
      </div>
    </header>
  );
}
