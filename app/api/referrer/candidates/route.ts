import { NextResponse } from "next/server";
import { normalizeVacancyLinks } from "@/lib/profile-form";
import { prisma } from "@/lib/prisma";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";
import {
  intersectByNormalizedValue,
  normalizeMatchingValue,
  resolveCompanyList,
  resolveRoleList,
} from "@/lib/referral-matching";

export async function GET() {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.referrer) return NextResponse.json({ error: "Referrer profile not found" }, { status: 404 });

  const referrerCompanies = resolveCompanyList(user.referrer);
  const referrerRoles = resolveRoleList(user.referrer);

  if (!referrerCompanies.length || !referrerRoles.length) {
    return NextResponse.json({ error: "Заполни профиль реферала, чтобы увидеть подходящих кандидатов." }, { status: 400 });
  }

  const candidates = await prisma.profile.findMany({
    where: {
      userId: { not: user.id },
      applicationSubmittedAt: { not: null },
      companies: { hasSome: referrerCompanies },
    },
    include: {
      user: { select: { firstName: true, username: true, photoUrl: true } },
    },
    orderBy: { applicationSubmittedAt: "desc" },
  });

  const candidateIds = candidates.map((candidate) => candidate.userId);
  const existingConnections = candidateIds.length
    ? await prisma.referralConnection.findMany({
      where: {
        referrerUserId: user.id,
        candidateUserId: { in: candidateIds },
      },
      select: {
        candidateUserId: true,
        companyName: true,
        status: true,
      },
    })
    : [];

  const connectionsByCandidate = new Map<number, { companyName: string; status: string }[]>();
  for (const connection of existingConnections) {
    const list = connectionsByCandidate.get(connection.candidateUserId) ?? [];
    list.push(connection);
    connectionsByCandidate.set(connection.candidateUserId, list);
  }

  const matchedCandidates = candidates
    .map((candidate) => {
      const sharedCompanies = intersectByNormalizedValue(candidate.companies, referrerCompanies);
      const vacancyLinks = normalizeVacancyLinks(candidate.vacancyLinks, candidate.companies);
      const candidateConnections = connectionsByCandidate.get(candidate.userId) ?? [];
      const pendingCompanies = candidateConnections
        .filter((connection) =>
          connection.status === "PENDING_PAYMENT"
          && sharedCompanies.some((item) => normalizeMatchingValue(item) === normalizeMatchingValue(connection.companyName))
        )
        .map((connection) => connection.companyName);
      const connectedCompanies = candidateConnections
        .filter((connection) =>
          connection.status === "APPROVED"
          && sharedCompanies.some((item) => normalizeMatchingValue(item) === normalizeMatchingValue(connection.companyName))
        )
        .map((connection) => connection.companyName);
      const availableCompanies = sharedCompanies.filter((companyName) =>
        ![...pendingCompanies, ...connectedCompanies].some((item) => normalizeMatchingValue(item) === normalizeMatchingValue(companyName))
      );
      const sharedCompaniesMissingVacancyLinks = sharedCompanies.filter((companyName) => !vacancyLinks[companyName]);

      return {
        id: candidate.id,
        role: candidate.role,
        roles: candidate.roles,
        experience: candidate.experience,
        companies: candidate.companies,
        vacancyLinks,
        sharedCompanies,
        sharedCompaniesMissingVacancyLinks,
        availableCompanies,
        pendingCompanies,
        connectedCompanies,
        location: candidate.location,
        openToRelocation: candidate.openToRelocation,
        bio: candidate.bio,
        resumeUrl: candidate.resumeUrl,
        resumeFileUrl: candidate.resumeFileUrl,
        linkedinUrl: candidate.linkedinUrl,
        githubUrl: candidate.githubUrl,
        siteUrl: candidate.siteUrl,
        applicationSubmittedAt: candidate.applicationSubmittedAt?.toISOString() ?? null,
        user: candidate.user,
      };
    })
    .filter((candidate) => candidate.sharedCompanies.length > 0)
    .sort((a, b) => {
      if (b.availableCompanies.length !== a.availableCompanies.length) {
        return b.availableCompanies.length - a.availableCompanies.length;
      }
      return (b.applicationSubmittedAt ?? "").localeCompare(a.applicationSubmittedAt ?? "");
    });

  return NextResponse.json({ candidates: matchedCandidates });
}
