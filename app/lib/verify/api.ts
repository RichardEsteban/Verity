import { MOCK_CATEGORIES, MOCK_DEALS, MOCK_EARNINGS, MOCK_STATS, MOCK_TIMELINE } from "./mock-data";
import type { Deal } from "./types";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

export async function fetchMyDeals(params?: { status?: string; q?: string }) {
  await delay();
  let deals = [...MOCK_DEALS];
  if (params?.status && params.status !== "all") {
    deals = deals.filter((d) => d.status === params.status);
  }
  if (params?.q) {
    const q = params.q.toLowerCase();
    deals = deals.filter(
      (d) =>
        d.service.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.buyer.display_name.toLowerCase().includes(q),
    );
  }
  return deals;
}

export async function fetchDeal(id: string): Promise<Deal | null> {
  await delay();
  return MOCK_DEALS.find((d) => d.id === id) ?? null;
}

export async function fetchStats() {
  await delay(120);
  return MOCK_STATS;
}

export async function fetchEarnings() {
  await delay(120);
  return { total: MOCK_STATS.total_earned, data: MOCK_EARNINGS, categories: MOCK_CATEGORIES };
}

export async function fetchTimeline() {
  await delay(120);
  return MOCK_TIMELINE;
}

export async function prepareWithdraw(amount: number, method: "kapso" | "internal", account_info: string) {
  await delay(400);
  return {
    withdraw_id: `wd_${Date.now()}`,
    amount,
    method,
    account_info,
    two_fa_required: true,
  };
}

export async function confirmWithdraw(withdraw_id: string, _code: string) {
  await delay(500);
  return {
    withdraw_id,
    status: "processing" as const,
    tx_hash: `0x${Math.random().toString(16).slice(2, 12)}`,
  };
}
