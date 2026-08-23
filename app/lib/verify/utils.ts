import type { DealStatus, MilestoneStatus } from "./types";

export function formatPen(amount: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsdt(amount: number) {
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT`;
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function shortHash(hash: string) {
  if (hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  pending_buyer: "Esperando comprador",
  escrowed: "En escrow",
  arbitrating: "Arbitrando",
  completed: "Completado",
  disputed: "En disputa",
  awaiting_deposit: "Esperando depósito",
  deposit_locked: "Depósito bloqueado",
  in_stay: "En estadía",
  review_window: "Ventana de reporte",
  completed_no_damage: "Sin daños",
};

export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  locked: "Bloqueado",
  pending: "Activo",
  escrowed: "Pagado",
  arbitrating: "Arbitrando",
  completed: "Completado",
};

export function statusTone(status: string) {
  if (status.includes("complet") || status === "escrowed" || status === "deposit_locked") {
    return "ok";
  }
  if (status.includes("arbitrat") || status === "disputed" || status === "review_window") {
    return "warn";
  }
  if (status === "pending_buyer" || status === "awaiting_deposit" || status === "locked") {
    return "muted";
  }
  return "info";
}
