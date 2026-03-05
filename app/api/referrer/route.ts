import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";

export async function POST(req: NextRequest) {
  try {
    const user = await resolveCurrentAppUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { company, linkedinUrl } = await req.json();

    if (!company) {
      return NextResponse.json({ error: "company required" }, { status: 400 });
    }

    const referrer = await prisma.referrer.upsert({
      where: { userId: user.id },
      update: { company, linkedinUrl: linkedinUrl || null },
      create: { userId: user.id, company, linkedinUrl: linkedinUrl || null },
      include: { user: { select: { firstName: true, username: true } } },
    });

    return NextResponse.json({ referrer });
  } catch (e) {
    console.error("[referrer POST]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const referrer = await prisma.referrer.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ referrer });
}
