import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";
import {
  normalizeProfilePayload,
  payloadToProfileCreateUpdate,
  validateProfilePayload,
} from "@/lib/profile-form";
import { sendApplicationEmail } from "@/lib/application-mail";
import { sendMatchingCandidateEmailToReferrer } from "@/lib/referral-mail";
import { getAppBaseUrl } from "@/lib/app-url";
import { intersectByNormalizedValue, resolveCompanyList, resolveRoleList } from "@/lib/referral-matching";

export async function POST(req: NextRequest) {
  const appUser = await resolveCurrentAppUser();
  if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = normalizeProfilePayload(await req.json());
  const validationError = validateProfilePayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { userId: appUser.id },
    select: {
      applicationSubmittedAt: true,
      shareWithMatchingReferrers: true,
    },
  });

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

  let referrerNotificationsSent = 0;
  const shouldNotifyReferrers = payload.shareWithMatchingReferrers
    && (!existingProfile?.applicationSubmittedAt || !existingProfile.shareWithMatchingReferrers);

  if (shouldNotifyReferrers) {
    const poolUrl = `${getAppBaseUrl()}/referrer/candidates`;
    const matchingReferrers = await prisma.referrer.findMany({
      where: {
        userId: { not: appUser.id },
        OR: [
          { companies: { hasSome: payload.companies } },
          { company: { in: payload.companies } },
        ],
      },
      include: {
        user: { select: { firstName: true, username: true } },
      },
    });

    const results = await Promise.allSettled(
      matchingReferrers
        .filter((referrer) => resolveRoleList(referrer).length > 0)
        .map(async (referrer) => {
          const referrerCompanies = resolveCompanyList(referrer);
          const sharedCompanies = intersectByNormalizedValue(payload.companies, referrerCompanies);

          if (!sharedCompanies.length || !referrer.user.username) return false;

          const result = await sendMatchingCandidateEmailToReferrer({
            referrerName: referrer.user.firstName,
            referrerEmail: referrer.user.username,
            candidateName: profile.user.firstName,
            candidateProfileUrl: poolUrl,
            sharedCompanies,
            payload,
          });

          return result.ok;
        })
    );

    referrerNotificationsSent = results.filter((result) => result.status === "fulfilled" && result.value).length;
  }

  return NextResponse.json({
    ok: true,
    submittedAt: submittedAt.toISOString(),
    profile: profileWithSubmittedAt,
    referrerNotificationsSent,
  });
}
