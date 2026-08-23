import { NextResponse } from "next/server";
import { MOCK_DEALS } from "@/app/lib/verify/mock-data";

export async function GET() {
  return NextResponse.json(
    MOCK_DEALS.map((d) => ({
      id: d.id,
      service: d.service,
      amount: d.amount_pen,
      status: d.status,
      created_at: d.created_at,
    })),
  );
}
