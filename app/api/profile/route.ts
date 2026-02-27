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

export async function PATCH(req: NextRequest) {
  const { userId, bio, location, openToRelocation, isPublic, resumeText } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const profile = await prisma.profile.update({
    where: { userId: Number(userId) },
    data: { bio, location, openToRelocation, isPublic, resumeText },
  });

  const summary = [
    `Роль: ${profile.role}`,
    `Опыт: ${profile.experience} лет`,
    `Желаемые компании: ${profile.companies.join(", ")}`,
    profile.location && `Локация: ${profile.location}`,
    profile.openToRelocation ? "Готов к переезду" : null,
    profile.bio && `О себе: ${profile.bio}`,
    profile.resumeUrl && `Резюме: ${profile.resumeUrl}`,
    profile.linkedinUrl && `LinkedIn: ${profile.linkedinUrl}`,
    profile.githubUrl && `GitHub: ${profile.githubUrl}`,
    profile.siteUrl && `Сайт: ${profile.siteUrl}`,
    profile.resumeText && `\n--- Текст резюме ---\n${profile.resumeText}`,
  ].filter(Boolean).join("\n");

  await prisma.profile.update({ where: { userId: Number(userId) }, data: { summary } });

  return NextResponse.json({ profile: { ...profile, summary } });
}
