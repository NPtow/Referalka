import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId } = await req.json();
  if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

  const request = await prisma.referralRequest.findFirst({
    where: { id: requestId, userId: session.userId, status: "REFERRER_FOUND" },
  });

  if (!request) {
    return NextResponse.json({ error: "Request not found or not payable" }, { status: 404 });
  }

  const updated = await prisma.referralRequest.update({
    where: { id: requestId },
    data: { status: "PAID" },
  });

  return NextResponse.json({ request: updated });
}
