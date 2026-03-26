import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReferralIntroEmails } from "@/lib/referral-mail";
import { resolveCompanyList, resolveRoleList } from "@/lib/referral-matching";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  const connection = await prisma.referralConnection.findUnique({
    where: { adminApprovalToken: token },
    include: {
      candidateUser: true,
      candidateProfile: true,
      referrerUser: true,
      referrer: true,
    },
  });

  if (!connection) {
    return NextResponse.json({ error: "Мэтч не найден." }, { status: 404 });
  }

  if (connection.status === "APPROVED" || connection.introEmailSentAt) {
    return NextResponse.json({
      ok: true,
      alreadyApproved: true,
      connection,
    });
  }

  if (!connection.candidateUser.username || !connection.referrerUser.username) {
    return NextResponse.json({ error: "У одной из сторон не найден email для финального интро." }, { status: 400 });
  }

  const sendResult = await sendReferralIntroEmails({
    companyName: connection.companyName,
    candidate: {
      name: connection.candidateUser.firstName,
      email: connection.candidateUser.username,
      telegramContact: connection.candidateProfile.telegramContact,
      linkedinUrl: connection.candidateProfile.linkedinUrl,
      githubUrl: connection.candidateProfile.githubUrl,
      siteUrl: connection.candidateProfile.siteUrl,
      experience: connection.candidateProfile.experience,
      roles: connection.candidateProfile.roles.length
        ? connection.candidateProfile.roles
        : [connection.candidateProfile.role],
      companies: connection.candidateProfile.companies,
      bio: connection.candidateProfile.bio,
      resumeUrl: connection.candidateProfile.resumeUrl,
      resumeFileUrl: connection.candidateProfile.resumeFileUrl,
    },
    referrer: {
      name: connection.referrerUser.firstName,
      email: connection.referrerUser.username,
      telegramContact: connection.referrer.telegramContact,
      linkedinUrl: connection.referrer.linkedinUrl,
      roles: resolveRoleList(connection.referrer),
      companies: resolveCompanyList(connection.referrer),
    },
  });

  if (!sendResult.ok) {
    return NextResponse.json({ error: sendResult.error }, { status: 502 });
  }

  const updatedConnection = await prisma.referralConnection.update({
    where: { id: connection.id },
    data: {
      status: "APPROVED",
      adminApprovedAt: new Date(),
      introEmailSentAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    alreadyApproved: false,
    connection: updatedConnection,
  });
}
