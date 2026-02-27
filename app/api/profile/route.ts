import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, companies, role, experience, resumeUrl, linkedinUrl, githubUrl, siteUrl } = body;

  if (!userId || !companies?.length || !role || experience === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const profile = await prisma.profile.upsert({
    where: { userId: Number(userId) },
    update: { companies, role, experience, resumeUrl, linkedinUrl, githubUrl, siteUrl },
    create: { userId: Number(userId), companies, role, experience, resumeUrl, linkedinUrl, githubUrl, siteUrl },
    include: { user: { select: { firstName: true, username: true, photoUrl: true } } },
  });

  return NextResponse.json({ profile });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const profile = await prisma.profile.findUnique({
    where: { userId: Number(userId) },
    include: { user: { select: { firstName: true, username: true, photoUrl: true } } },
  });

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ profile });
}
