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

  // Calculate profile completeness
  const profile = user.profile;
  const profileComplete = profile
    ? [!!profile.role, !!profile.companies?.length, !!profile.resumeUrl, !!profile.experience, !!profile.bio].filter(Boolean).length >= 4
    : false;

  return NextResponse.json({
    user: {
      id: user.id,
      firstName: user.firstName,
      username: user.username,
      photoUrl: user.photoUrl,
    },
    role: user.referrer ? "REFERRER" : "CANDIDATE",
    referrerCompany: user.referrer?.company ?? null,
    profileComplete,
    profileProgress: profile
      ? Math.round(([!!profile.role, !!profile.companies?.length, !!profile.resumeUrl, !!profile.experience, !!profile.bio].filter(Boolean).length / 5) * 100)
      : 0,
    activeRequests,
    hasReferrerFound: !!referrerFoundRequest,
    referrerFoundRequest,
  });
}
