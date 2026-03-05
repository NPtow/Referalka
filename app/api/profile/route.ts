import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";

type ProfilePayload = {
  companies: string[];
  role: string;
  experience: number;
  resumeUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  siteUrl: string | null;
  bio: string | null;
  location: string | null;
  openToRelocation: boolean;
  isPublic: boolean;
  resumeText: string | null;
};

function normalizePayload(raw: unknown): ProfilePayload {
  const body = (raw ?? {}) as Record<string, unknown>;
  return {
    companies: Array.isArray(body.companies)
      ? body.companies.map((v) => String(v).trim()).filter(Boolean)
      : [],
    role: String(body.role ?? "").trim(),
    experience: Number(body.experience ?? 0),
    resumeUrl: body.resumeUrl ? String(body.resumeUrl).trim() : null,
    linkedinUrl: body.linkedinUrl ? String(body.linkedinUrl).trim() : null,
    githubUrl: body.githubUrl ? String(body.githubUrl).trim() : null,
    siteUrl: body.siteUrl ? String(body.siteUrl).trim() : null,
    bio: body.bio ? String(body.bio).trim() : null,
    location: body.location ? String(body.location).trim() : null,
    openToRelocation: Boolean(body.openToRelocation),
    isPublic: Boolean(body.isPublic),
    resumeText: body.resumeText ? String(body.resumeText) : null,
  };
}

function buildSummary(payload: ProfilePayload): string {
  return [
    `Роль: ${payload.role}`,
    `Опыт: ${payload.experience} лет`,
    `Желаемые компании: ${payload.companies.join(", ")}`,
    payload.location && `Локация: ${payload.location}`,
    payload.openToRelocation ? "Готов к переезду" : null,
    payload.bio && `О себе: ${payload.bio}`,
    payload.resumeUrl && `Резюме: ${payload.resumeUrl}`,
    payload.linkedinUrl && `LinkedIn: ${payload.linkedinUrl}`,
    payload.githubUrl && `GitHub: ${payload.githubUrl}`,
    payload.siteUrl && `Сайт: ${payload.siteUrl}`,
    payload.resumeText && `\n--- Текст резюме ---\n${payload.resumeText}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function validatePayload(payload: ProfilePayload): string | null {
  if (!payload.role) return "Role is required";
  if (!payload.companies.length) return "At least one company is required";
  if (!Number.isFinite(payload.experience) || payload.experience < 0) {
    return "Experience must be a non-negative number";
  }
  return null;
}

export async function POST(req: NextRequest) {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = normalizePayload(await req.json());
  const validationError = validatePayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const summary = buildSummary(payload);

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: { ...payload, summary },
    create: { userId: user.id, ...payload, summary },
    include: {
      user: { select: { firstName: true, username: true, photoUrl: true } },
      _count: { select: { views: true } },
    },
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

  const existing = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      companies: true,
      role: true,
      experience: true,
      resumeUrl: true,
      linkedinUrl: true,
      githubUrl: true,
      siteUrl: true,
      bio: true,
      location: true,
      openToRelocation: true,
      isPublic: true,
      resumeText: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const incoming = normalizePayload({ ...existing, ...(await req.json()) });
  const validationError = validatePayload(incoming);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const summary = buildSummary(incoming);

  const profile = await prisma.profile.update({
    where: { userId: user.id },
    data: { ...incoming, summary },
    include: {
      user: { select: { firstName: true, username: true, photoUrl: true } },
      _count: { select: { views: true } },
    },
  });

  return NextResponse.json({ profile });
}
