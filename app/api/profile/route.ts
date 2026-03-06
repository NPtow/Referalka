import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";
import {
  normalizeProfilePayload,
  payloadToProfileCreateUpdate,
  profileToPayload,
  validateProfilePayload,
} from "@/lib/profile-form";

export async function POST(req: NextRequest) {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = normalizeProfilePayload(await req.json());
  const validationError = validateProfilePayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: payloadToProfileCreateUpdate(payload),
    create: {
      userId: user.id,
      ...payloadToProfileCreateUpdate(payload),
    },
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
      roles: true,
      role: true,
      experience: true,
      resumeUrl: true,
      resumeFileUrl: true,
      resumeFileName: true,
      resumeFileMime: true,
      resumeFileSize: true,
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

  const incoming = normalizeProfilePayload({
    ...profileToPayload(existing),
    ...(await req.json()),
  });
  const validationError = validateProfilePayload(incoming);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const profile = await prisma.profile.update({
    where: { userId: user.id },
    data: payloadToProfileCreateUpdate(incoming),
    include: {
      user: { select: { firstName: true, username: true, photoUrl: true } },
      _count: { select: { views: true } },
    },
  });

  return NextResponse.json({ profile });
}
