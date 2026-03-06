import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";
import {
  normalizeProfilePayload,
  payloadToProfileCreateUpdate,
  validateProfilePayload,
} from "@/lib/profile-form";
import { sendApplicationEmail } from "@/lib/application-mail";

export async function POST(req: NextRequest) {
  const appUser = await resolveCurrentAppUser();
  if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = normalizeProfilePayload(await req.json());
  const validationError = validateProfilePayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const profile = await prisma.profile.upsert({
    where: { userId: appUser.id },
    update: {
      ...payloadToProfileCreateUpdate(payload),
    },
    create: {
      userId: appUser.id,
      ...payloadToProfileCreateUpdate(payload),
    },
    include: {
      user: { select: { firstName: true, username: true, photoUrl: true } },
      _count: { select: { views: true } },
    },
  });

  const submittedAt = new Date();
  const sendResult = await sendApplicationEmail({
    candidateName: profile.user.firstName,
    candidateEmail: profile.user.username,
    payload,
    submittedAt,
  });

  if (!sendResult.ok) {
    return NextResponse.json(
      {
        error: "Профиль сохранен, но заявку не удалось отправить на почту.",
        details: sendResult.error,
      },
      { status: 500 }
    );
  }

  const profileWithSubmittedAt = await prisma.profile.update({
    where: { userId: appUser.id },
    data: { applicationSubmittedAt: submittedAt },
    include: {
      user: { select: { firstName: true, username: true, photoUrl: true } },
      _count: { select: { views: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    submittedAt: submittedAt.toISOString(),
    profile: profileWithSubmittedAt,
  });
}
