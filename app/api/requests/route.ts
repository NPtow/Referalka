import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";

export async function GET() {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.referralRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companySlug, companyName } = await req.json();
  if (!companySlug || !companyName) {
    return NextResponse.json({ error: "companySlug and companyName required" }, { status: 400 });
  }

  // Check profile exists
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Profile not complete" }, { status: 400 });
  }

  // Check for existing pending request to same company
  const existing = await prisma.referralRequest.findFirst({
    where: { userId: user.id, companySlug, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "Already requested", request: existing }, { status: 409 });
  }

  const request = await prisma.referralRequest.create({
    data: {
      userId: user.id,
      companySlug,
      companyName,
    },
  });

  return NextResponse.json({ request }, { status: 201 });
}
