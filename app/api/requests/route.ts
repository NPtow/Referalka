import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.referralRequest.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companySlug, companyName } = await req.json();
  if (!companySlug || !companyName) {
    return NextResponse.json({ error: "companySlug and companyName required" }, { status: 400 });
  }

  // Check profile exists
  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (!profile) {
    return NextResponse.json({ error: "Profile not complete" }, { status: 400 });
  }

  // Check for existing pending request to same company
  const existing = await prisma.referralRequest.findFirst({
    where: { userId: session.userId, companySlug, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "Already requested", request: existing }, { status: 409 });
  }

  const request = await prisma.referralRequest.create({
    data: {
      userId: session.userId,
      companySlug,
      companyName,
    },
  });

  return NextResponse.json({ request }, { status: 201 });
}
