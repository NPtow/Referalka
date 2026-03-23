import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";

export async function GET() {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = user.id;

  const activeRequests = await prisma.referralRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const referrerFoundRequest = await prisma.referralRequest.findFirst({
    where: { userId, status: "REFERRER_FOUND" },
  });

  const referrerCompanies = user.referrer
    ? user.referrer.companies.length
      ? user.referrer.companies
      : [user.referrer.company]
    : [];
  const referrerRoles = user.referrer
    ? user.referrer.roles.length
      ? user.referrer.roles
      : user.referrer.role
        ? [user.referrer.role]
        : []
    : [];

  // Calculate profile completeness
  const profile = user.profile;
  const candidateProfileComplete = profile
    ? [!!profile.role, !!profile.companies?.length, !!profile.resumeUrl, !!profile.experience, !!profile.bio].filter(Boolean).length >= 4
    : false;
  const candidateProfileProgress = profile
    ? Math.round(([!!profile.role, !!profile.companies?.length, !!profile.resumeUrl, !!profile.experience, !!profile.bio].filter(Boolean).length / 5) * 100)
    : 0;
  const referrerProfileProgress = Math.round(([referrerCompanies.length > 0, referrerRoles.length > 0, !!user.referrer?.telegramContact, !!user.referrer?.linkedinUrl].filter(Boolean).length / 4) * 100);
  const profileComplete = user.referrer
    ? referrerCompanies.length > 0 && referrerRoles.length > 0
    : candidateProfileComplete;

  return NextResponse.json({
    user: {
      id: user.id,
      firstName: user.firstName,
      username: user.username,
      photoUrl: user.photoUrl,
    },
    role: user.referrer ? "REFERRER" : "CANDIDATE",
    referrerCompany: referrerCompanies.length ? referrerCompanies.join(", ") : null,
    profileComplete,
    profileProgress: user.referrer ? referrerProfileProgress : candidateProfileProgress,
    activeRequests,
    hasReferrerFound: !!referrerFoundRequest,
    referrerFoundRequest,
  });
}
