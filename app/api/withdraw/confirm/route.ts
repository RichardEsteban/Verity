import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "processing",
    tx_hash: `0x${Math.random().toString(16).slice(2, 10)}`,
  });
}
