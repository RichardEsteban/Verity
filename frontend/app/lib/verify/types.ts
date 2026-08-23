export type DealType = "service" | "deposit";

export type DealStatus =
  | "pending_buyer"
  | "escrowed"
  | "arbitrating"
  | "completed"
  | "disputed"
  | "awaiting_deposit"
  | "deposit_locked"
  | "in_stay"
  | "review_window"
  | "completed_no_damage";

export type MilestoneStatus =
  | "locked"
  | "pending"
  | "escrowed"
  | "arbitrating"
  | "completed";

export type PaymentStatus = "pending" | "confirmed" | "failed";
export type PayoutRole = "payment" | "host_repair" | "guest_refund";
export type AgentName = "gemini" | "claude" | "consensus" | "paybot";
export type AgentDecision = "CUMPLIDO" | "INCUMPLIDO" | "PARTIAL" | null;

export type User = {
  id: string;
  whatsapp_number: string;
  wallet_address: string;
  display_name: string;
  profile_photo_url: string;
  rating: number;
  deal_count: number;
};

export type Milestone = {
  id: string;
  deal_id: string;
  order_index: number;
  description: string;
  amount_pen: number;
  amount_usdt: number;
  status: MilestoneStatus;
  unlocked_at: string | null;
  completed_at: string | null;
};

export type Photo = {
  id: string;
  deal_id: string;
  uploaded_by: string;
  ipfs_hash: string;
  caption: string;
  metadata: {
    timestamp: string;
    gps?: { lat: number; lon: number };
    device?: string;
  };
};

export type Payment = {
  id: string;
  deal_id: string;
  kapso_payment_id: string;
  amount_pen: number;
  currency: "PEN";
  status: PaymentStatus;
  confirmed_at: string | null;
};

export type ArbitrationLog = {
  id: string;
  deal_id: string;
  agent_name: AgentName;
  status: "processing" | "complete";
  progress: number;
  decision: AgentDecision;
  confidence: number | null;
  reasoning: string;
};

export type PayoutLog = {
  id: string;
  deal_id: string;
  milestone_id: string | null;
  role: PayoutRole;
  tx_hash: string;
  amount_usdt: number;
  recipient: string;
  status: "pending" | "confirmed" | "failed";
  confirmed_at: string | null;
};

export type Rating = {
  from: string;
  to: string;
  score: number;
  comment: string;
};

export type Deal = {
  id: string;
  seller: User;
  buyer: User;
  service: string;
  description: string;
  amount_pen: number;
  amount_usdt: number;
  status: DealStatus;
  deal_type: DealType;
  is_milestone_based: boolean;
  high_value: boolean;
  created_at: string;
  completed_at: string | null;
  smart_contract_address: string | null;
  checkin_at: string | null;
  checkout_at: string | null;
  repair_amount_pen: number | null;
  refund_amount_pen: number | null;
  claimed_damage_pen: number | null;
  milestones: Milestone[];
  photos: Photo[];
  payments: Payment[];
  arbitration: ArbitrationLog[];
  payouts: PayoutLog[];
  ratings: Rating[];
};

export type AgentLiveState = {
  progress: number;
  status: string;
  decision: AgentDecision;
  confidence: number | null;
  eta: number | null;
};

export type ArbitrationLiveState = {
  gemini: AgentLiveState;
  claude: AgentLiveState;
  consensus: {
    votes_received: number;
    votes_needed: number;
    verdict: string | null;
    claimed?: number;
    approved?: number;
    split?: { host: number; guest: number };
  };
  paybot: {
    status: string;
    ready: boolean;
    tx_hash: string | null;
    amount_usdt: number | null;
  };
};

export type EarningsPoint = { month: string; earnings: number };
export type CategorySlice = { category: string; amount: number };

export type AnalyticsStats = {
  total_earned: number;
  deals_completed: number;
  rating: number;
  success_rate: number;
  avg_time_to_payout: number;
};

export type TimelineEvent = {
  date: string;
  event: string;
  amount: number | null;
  status: string;
};
