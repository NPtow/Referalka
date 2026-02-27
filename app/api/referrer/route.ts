import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, company, linkedinUrl } = await req.json();

    if (!userId || !company) {
      return NextResponse.json({ error: "userId and company required" }, { status: 400 });
    }

    const referrer = await prisma.referrer.upsert({
      where: { userId: Number(userId) },
      update: { company, linkedinUrl: linkedinUrl || null },
      create: { userId: Number(userId), company, linkedinUrl: linkedinUrl || null },
      include: { user: { select: { firstName: true, username: true } } },
    });

    return NextResponse.json({ referrer });
  } catch (e) {
    console.error("[referrer POST]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const referrer = await prisma.referrer.findUnique({
    where: { userId: Number(userId) },
  });

  return NextResponse.json({ referrer });
}
