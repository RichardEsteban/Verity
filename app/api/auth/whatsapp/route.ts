import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const whatsapp_number = String(body.whatsapp_number ?? "");
  const display_name = String(body.display_name ?? "Usuario");
  if (!whatsapp_number || whatsapp_number.length < 8) {
    return NextResponse.json({ error: "Invalid whatsapp_number" }, { status: 400 });
  }
  return NextResponse.json({
    token: `mock.${Buffer.from(whatsapp_number).toString("base64")}.jwt`,
    user_id: "user_constructora",
    created: false,
    display_name,
  });
}
