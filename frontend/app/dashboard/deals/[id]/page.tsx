"use client";

import { use, useEffect, useState } from "react";
import { DealDetail } from "@/app/components/deals/DealDetail";
import { Loading } from "@/app/components/common/Loading";
import { fetchDeal } from "@/app/lib/verify/api";
import type { Deal } from "@/app/lib/verify/types";

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deal, setDeal] = useState<Deal | null | undefined>(undefined);

  useEffect(() => {
    fetchDeal(id).then(setDeal);
  }, [id]);

  if (deal === undefined) return <Loading />;
  if (!deal) return <p className="text-sm text-muted">Deal no encontrado.</p>;
  return <DealDetail deal={deal} />;
}
