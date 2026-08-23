import { request } from "./backend";
import { getToken, getUser } from "./auth";
import type { Deal, User } from "./types";

/**
 * El backend de la demo devuelve deals "planos" (sin hitos ni depositos: ver
 * README seccion "Casos de Uso"). Este adaptador rellena el resto del tipo
 * `Deal` -- que si soporta ese modelo mas rico -- con valores vacios, para
 * no tener que tocar los componentes de UI.
 */

function placeholderBuyer(): User {
  return {
    id: "",
    whatsapp_number: "",
    wallet_address: "",
    display_name: "Cliente",
    profile_photo_url: "",
    rating: 0,
    deal_count: 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptDeal(raw: any, fallbackSeller?: User | null): Deal {
  const seller: User = raw.seller
    ? {
        id: raw.seller.id,
        whatsapp_number: raw.seller.whatsapp_number,
        wallet_address: raw.seller.wallet_address ?? "",
        display_name: raw.seller.display_name || raw.seller.whatsapp_number,
        profile_photo_url: "",
        rating: raw.seller.rating ?? 0,
        deal_count: raw.seller.deal_count ?? 0,
      }
    : fallbackSeller ?? placeholderBuyer();

  return {
    id: raw.id,
    seller,
    buyer: placeholderBuyer(),
    service: raw.service_description,
    description: raw.service_description,
    amount_pen: raw.amount_pen,
    amount_usdt: raw.amount_usdt ?? 0,
    status: raw.status,
    deal_type: "service",
    is_milestone_based: false,
    high_value: Boolean(raw.high_value),
    created_at: raw.created_at,
    completed_at: raw.completed_at ?? null,
    smart_contract_address: null,
    checkin_at: null,
    checkout_at: null,
    repair_amount_pen: null,
    refund_amount_pen: null,
    claimed_damage_pen: null,
    milestones: [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    photos: (raw.photos ?? []).map((p: any) => ({
      id: p.id,
      deal_id: p.deal_id,
      uploaded_by: p.uploaded_by,
      ipfs_hash: p.ipfs_hash,
      caption: "Evidencia",
      metadata: p.metadata ?? {},
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payments: (raw.payments ?? []).map((p: any) => ({
      id: p.id,
      deal_id: p.deal_id,
      kapso_payment_id: p.kapso_payment_id,
      amount_pen: p.amount_pen,
      currency: "PEN" as const,
      status: p.status,
      confirmed_at: p.confirmed_at ?? null,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arbitration: (raw.arbitration ?? []).map((a: any) => ({
      id: a.id,
      deal_id: a.deal_id,
      agent_name: a.agent_name,
      status: a.status,
      progress: a.progress,
      decision: a.decision,
      confidence: a.confidence,
      reasoning: a.reasoning,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payouts: (raw.payouts ?? []).map((p: any) => ({
      id: p.id,
      deal_id: p.deal_id,
      milestone_id: null,
      role: p.role ?? "payment",
      tx_hash: p.tx_hash ?? "",
      amount_usdt: p.amount_usdt,
      recipient: p.recipient_wallet,
      status: p.status,
      confirmed_at: p.confirmed_at ?? null,
    })),
    ratings: [],
  };
}

export async function fetchMyDeals(params?: { status?: string; q?: string }) {
  const token = getToken();
  const query = params?.status && params.status !== "all" ? `?status=${encodeURIComponent(params.status)}` : "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await request<any[]>(`/api/deals/my-deals${query}`, { token });

  const me = getUser();
  let deals = rows.map((row) => adaptDeal(row, me));

  if (params?.q) {
    const q = params.q.toLowerCase();
    deals = deals.filter((d) => d.service.toLowerCase().includes(q) || d.id.toLowerCase().includes(q));
  }
  return deals;
}

export async function fetchDeal(id: string): Promise<Deal | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await request<any>(`/api/deals/${id}`);
    return adaptDeal(raw);
  } catch {
    return null;
  }
}

export async function fetchStats() {
  const token = getToken();
  const stats = await request<{ total_earned: number; deals_completed: number; rating: number | null }>(
    "/api/analytics/stats",
    { token },
  );
  return {
    total_earned: stats.total_earned,
    deals_completed: stats.deals_completed,
    rating: stats.rating ?? 0,
    // el backend simplificado no calcula estas dos todavia
    success_rate: stats.deals_completed > 0 ? 100 : 0,
    avg_time_to_payout: 0,
  };
}

export async function fetchEarnings() {
  const token = getToken();
  const data = await request<{
    total: number;
    deals_count: number;
    avg_per_deal: number;
    data: { month: string; earnings: number }[];
  }>("/api/analytics/earnings", { token });
  return { total: data.total, data: data.data, categories: [] as { category: string; amount: number }[] };
}

export function fetchTimeline() {
  const token = getToken();
  return request<{ date: string; event: string; amount: number | null; status: string }[]>("/api/analytics/timeline", {
    token,
  });
}

export function prepareWithdraw(amount: number, method: "kapso" | "internal", account_info: string) {
  const token = getToken();
  return request<{ withdraw_id: string; amount: number; method: string }>("/api/withdraw/prepare", {
    method: "POST",
    token,
    body: { amount, method, account_info },
  });
}

export function confirmWithdraw(withdraw_id: string, code: string) {
  const token = getToken();
  return request<{ status: string; tx_hash: string }>("/api/withdraw/confirm", {
    method: "POST",
    token,
    body: { withdraw_id, code },
  });
}
