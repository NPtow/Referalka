import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  searchParams.forEach((v, k) => { params[k] = v; });
  return NextResponse.json({ received_params: params, total: Object.keys(params).length });
}
