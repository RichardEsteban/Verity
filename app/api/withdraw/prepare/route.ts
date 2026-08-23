import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    withdraw_id: `wd_${Date.now()}`,
    amount: body.amount ?? 0,
    method: body.method ?? "kapso",
    two_fa_required: true,
  });
}
