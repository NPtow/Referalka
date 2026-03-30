import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { normalizeVacancyLinks } from "@/lib/profile-form";
import { prisma } from "@/lib/prisma";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";
import {
  includesNormalizedValue,
  intersectByNormalizedValue,
  normalizeMatchingValue,
  resolveCompanyList,
  resolveRoleList,
} from "@/lib/referral-matching";
import { sendReferralMatchPendingEmails } from "@/lib/referral-mail";

function normalizeCompanyName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function POST(req: NextRequest) {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.referrer) return NextResponse.json({ error: "Referrer profile not found" }, { status: 404 });

  const referrerCompanies = resolveCompanyList(user.referrer);
  const referrerRoles = resolveRoleList(user.referrer);
  if (!referrerCompanies.length || !referrerRoles.length) {
    return NextResponse.json({ error: "Сначала заполни профиль реферала." }, { status: 400 });
  }

  const body = await req.json().catch(() => null) as { candidateId?: unknown; companyName?: unknown } | null;
  const candidateId = typeof body?.candidateId === "string" ? body.candidateId : null;
  const requestedCompany = normalizeCompanyName(body?.companyName);

  if (!candidateId || !requestedCompany) {
    return NextResponse.json({ error: "candidateId and companyName are required" }, { status: 400 });
  }

  const candidate = await prisma.profile.findUnique({
    where: { id: candidateId },
    include: {
      user: { select: { id: true, firstName: true, username: true } },
    },
  });

  if (!candidate || !candidate.applicationSubmittedAt) {
    return NextResponse.json({ error: "Кандидат больше не доступен для соединения." }, { status: 404 });
  }

  if (candidate.userId === user.id) {
    return NextResponse.json({ error: "Нельзя соединить себя с собой." }, { status: 400 });
  }

  const sharedCompanies = intersectByNormalizedValue(candidate.companies, referrerCompanies);
  const matchedCompany = sharedCompanies.find((companyName) =>
    normalizeMatchingValue(companyName) === normalizeMatchingValue(requestedCompany)
  );

  if (!matchedCompany || !includesNormalizedValue(referrerCompanies, matchedCompany)) {
    return NextResponse.json({ error: "Эта компания не совпадает с профилем реферала." }, { status: 400 });
  }

  const candidateVacancyLinks = normalizeVacancyLinks(candidate.vacancyLinks, candidate.companies);

  let connection = await prisma.referralConnection.findUnique({
    where: {
      candidateUserId_referrerUserId_companyName: {
        candidateUserId: candidate.userId,
        referrerUserId: user.id,
        companyName: matchedCompany,
      },
    },
  });

  if (!connection) {
    try {
      connection = await prisma.referralConnection.create({
        data: {
          candidateUserId: candidate.userId,
          candidateProfileId: candidate.id,
          referrerUserId: user.id,
          referrerId: user.referrer.id,
          companyName: matchedCompany,
          adminApprovalToken: randomUUID(),
        },
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        throw error;
      }

      connection = await prisma.referralConnection.findUnique({
        where: {
          candidateUserId_referrerUserId_companyName: {
            candidateUserId: candidate.userId,
            referrerUserId: user.id,
            companyName: matchedCompany,
          },
        },
      });
    }
  }

  if (!connection) {
    return NextResponse.json({ error: "Не удалось создать соединение." }, { status: 500 });
  }

  if (!candidate.user.username || !user.username) {
    return NextResponse.json({ error: "У одной из сторон не найден email для интро." }, { status: 400 });
  }

  const alreadyExists = Boolean(
    connection.paymentRequestEmailSentAt
    || connection.introEmailSentAt
    || connection.status === "APPROVED"
  );

  if (connection.status === "PENDING_PAYMENT" && !connection.paymentRequestEmailSentAt) {
    const sendResult = await sendReferralMatchPendingEmails({
      approvalToken: connection.adminApprovalToken,
      companyName: matchedCompany,
      candidate: {
        name: candidate.user.firstName,
        email: candidate.user.username,
        telegramContact: candidate.telegramContact,
        linkedinUrl: candidate.linkedinUrl,
        githubUrl: candidate.githubUrl,
        siteUrl: candidate.siteUrl,
        experience: candidate.experience,
        roles: candidate.roles.length ? candidate.roles : [candidate.role],
        companies: candidate.companies,
        bio: candidate.bio,
        resumeUrl: candidate.resumeUrl,
        resumeFileUrl: candidate.resumeFileUrl,
        vacancyUrl: candidateVacancyLinks[matchedCompany] ?? null,
      },
      referrer: {
        name: user.firstName,
        email: user.username,
        telegramContact: user.referrer.telegramContact,
        linkedinUrl: user.referrer.linkedinUrl,
        roles: referrerRoles,
        companies: referrerCompanies,
      },
    });

    if (!sendResult.ok) {
      return NextResponse.json({ error: sendResult.error }, { status: 502 });
    }

    connection = await prisma.referralConnection.update({
      where: { id: connection.id },
      data: { paymentRequestEmailSentAt: new Date() },
    });
  }

  return NextResponse.json({
    ok: true,
    connection,
    status: connection.status,
    alreadyExists,
  });
}
