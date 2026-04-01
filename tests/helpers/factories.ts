import type { Profile, Referrer, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

let userSequence = 1000;

type UserOverrides = Partial<Pick<User, "id" | "firstName" | "username" | "photoUrl" | "betterAuthUserId">>;

export async function createUser(overrides: UserOverrides = {}) {
  const id = overrides.id ?? userSequence++;

  return prisma.user.create({
    data: {
      id,
      firstName: overrides.firstName ?? `User ${id}`,
      username: overrides.username ?? `user-${id}@example.com`,
      photoUrl: overrides.photoUrl ?? null,
      betterAuthUserId: overrides.betterAuthUserId ?? `auth-${id}`,
    },
  });
}

type ProfileOverrides = Partial<Profile> & {
  userId: number;
  companies?: string[];
  roles?: string[];
};

export async function createCandidateProfile(overrides: ProfileOverrides) {
  const roles = overrides.roles?.length ? overrides.roles : [overrides.role ?? "Product Manager"];
  const companies = overrides.companies?.length ? overrides.companies : ["Т-Банк"];
  const vacancyLinks = overrides.vacancyLinks && typeof overrides.vacancyLinks === "object" && !Array.isArray(overrides.vacancyLinks)
    ? overrides.vacancyLinks
    : Object.fromEntries(companies.map((company) => [company, `https://example.com/vacancies/${encodeURIComponent(company)}`]));

  return prisma.profile.create({
    data: {
      userId: overrides.userId,
      role: roles[0],
      roles,
      companies,
      vacancyLinks,
      experience: overrides.experience ?? 3,
      resumeUrl: overrides.resumeUrl ?? "https://example.com/resume.pdf",
      resumeFileUrl: overrides.resumeFileUrl ?? null,
      resumeFileName: overrides.resumeFileName ?? null,
      resumeFileMime: overrides.resumeFileMime ?? null,
      resumeFileSize: overrides.resumeFileSize ?? null,
      resumeText: overrides.resumeText ?? "Опытный кандидат",
      telegramContact: overrides.telegramContact ?? "@candidate",
      linkedinUrl: overrides.linkedinUrl ?? "https://linkedin.com/in/candidate",
      githubUrl: overrides.githubUrl ?? "https://github.com/candidate",
      siteUrl: overrides.siteUrl ?? null,
      isPro: overrides.isPro ?? false,
      referrals: overrides.referrals ?? 0,
      bio: overrides.bio ?? "Сильный кандидат",
      isPublic: overrides.isPublic ?? false,
      shareWithMatchingReferrers: overrides.shareWithMatchingReferrers ?? false,
      openToRelocation: overrides.openToRelocation ?? false,
      location: overrides.location ?? "Москва",
      applicationSubmittedAt: overrides.applicationSubmittedAt ?? new Date(),
      summary: overrides.summary ?? "Profile summary",
    },
  });
}

type ReferrerOverrides = Partial<Referrer> & {
  userId: number;
  companies?: string[];
  roles?: string[];
};

export async function createReferrerProfile(overrides: ReferrerOverrides) {
  const companies = overrides.companies
    ? overrides.companies
    : overrides.company
      ? [overrides.company]
      : ["Т-Банк"];
  const roles = overrides.roles?.length ? overrides.roles : overrides.role ? [overrides.role] : ["Product Manager"];

  return prisma.referrer.create({
    data: {
      userId: overrides.userId,
      company: companies[0] ?? null,
      companies,
      role: roles[0] ?? null,
      roles,
      telegramContact: overrides.telegramContact ?? "@referrer",
      linkedinUrl: overrides.linkedinUrl ?? "https://linkedin.com/in/referrer",
    },
  });
}

export async function loadAppUser(userId: number) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      profile: true,
      referrer: true,
    },
  });
}
