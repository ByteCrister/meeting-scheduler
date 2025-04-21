// app/api/debug-cookies/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookies = req.cookies.getAll();
  console.log("🧁 Cookies on server:", cookies);
  return NextResponse.json({ cookies });
}