import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";

export async function POST(req: NextRequest) {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { companies, role, experience, resumeUrl, linkedinUrl, githubUrl, siteUrl } = body;

  if (!companies?.length || !role || experience === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: { companies, role, experience, resumeUrl, linkedinUrl, githubUrl, siteUrl },
    create: { userId: user.id, companies, role, experience, resumeUrl, linkedinUrl, githubUrl, siteUrl },
    include: { user: { select: { firstName: true, username: true, photoUrl: true } } },
  });

  return NextResponse.json({ profile });
}

export async function GET() {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      user: { select: { firstName: true, username: true, photoUrl: true } },
      _count: { select: { views: true } },
    },
  });

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ profile });
}

export async function DELETE() {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (profile) {
    await prisma.profileView.deleteMany({ where: { profileId: profile.id } });
    await prisma.profile.delete({ where: { userId: user.id } });
  }

  await prisma.referrer.deleteMany({ where: { userId: user.id } });
  await prisma.referralRequest.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bio, location, openToRelocation, isPublic, resumeText } = await req.json();

  const existing = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true, experience: true, companies: true, resumeUrl: true, linkedinUrl: true, githubUrl: true, siteUrl: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profile = await prisma.profile.update({
    where: { userId: user.id },
    data: { bio, location, openToRelocation, isPublic, resumeText },
  });

  const summary = [
    `Роль: ${existing.role}`,
    `Опыт: ${existing.experience} лет`,
    `Желаемые компании: ${existing.companies.join(", ")}`,
    profile.location && `Локация: ${profile.location}`,
    profile.openToRelocation ? "Готов к переезду" : null,
    profile.bio && `О себе: ${profile.bio}`,
    existing.resumeUrl && `Резюме: ${existing.resumeUrl}`,
    existing.linkedinUrl && `LinkedIn: ${existing.linkedinUrl}`,
    existing.githubUrl && `GitHub: ${existing.githubUrl}`,
    existing.siteUrl && `Сайт: ${existing.siteUrl}`,
    profile.resumeText && `\n--- Текст резюме ---\n${profile.resumeText}`,
  ]
    .filter(Boolean)
    .join("\n");

  await prisma.profile.update({ where: { userId: user.id }, data: { summary } });

  return NextResponse.json({ profile: { ...profile, summary } });
}
