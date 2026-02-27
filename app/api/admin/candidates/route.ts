import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      role: true,
      experience: true,
      companies: true,
      location: true,
      bio: true,
      isPublic: true,
      summary: true,
      resumeText: true,
      linkedinUrl: true,
      resumeUrl: true,
      createdAt: true,
      _count: { select: { views: true } },
      user: { select: { id: true, firstName: true, username: true } },
    },
  });

  return NextResponse.json({ profiles });
}
