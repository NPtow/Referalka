import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type StatusGroup = { status: string; _count: { _all: number } };

function countFor(group: StatusGroup[], status: string): number {
  return group.find((g) => g.status === status)?._count._all ?? 0;
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    candidates,
    referrers,
    publicProfiles,
    submittedApplications,
    totalRequests,
    requestsGroup,
    totalConnections,
    connectionsGroup,
    newUsers7d,
    newRequests7d,
    requests,
    usersRaw,
    connections,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.profile.count(),
    prisma.referrer.count(),
    prisma.profile.count({ where: { isPublic: true } }),
    prisma.profile.count({ where: { applicationSubmittedAt: { not: null } } }),
    prisma.referralRequest.count(),
    prisma.referralRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.referralConnection.count(),
    prisma.referralConnection.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.count({ where: { createdAt: { gte: since7d } } }),
    prisma.referralRequest.count({ where: { createdAt: { gte: since7d } } }),
    prisma.referralRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
      include: {
        user: { select: { id: true, firstName: true, username: true, photoUrl: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
      include: {
        profile: {
          select: {
            role: true,
            roles: true,
            experience: true,
            companies: true,
            isPublic: true,
            applicationSubmittedAt: true,
            telegramContact: true,
            linkedinUrl: true,
            location: true,
          },
        },
        referrer: {
          select: { company: true, companies: true, role: true, roles: true, telegramContact: true },
        },
        _count: { select: { referralRequests: true } },
      },
    }),
    prisma.referralConnection.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        candidateUser: { select: { id: true, firstName: true, username: true } },
        referrerUser: { select: { id: true, firstName: true, username: true } },
      },
    }),
  ]);

  const users = usersRaw.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    username: u.username,
    photoUrl: u.photoUrl,
    createdAt: u.createdAt,
    role: u.referrer ? "REFERRER" : u.profile ? "CANDIDATE" : "LEAD",
    requestsCount: u._count.referralRequests,
    profile: u.profile,
    referrer: u.referrer,
  }));

  return NextResponse.json({
    stats: {
      totalUsers,
      candidates,
      referrers,
      leads: Math.max(totalUsers - candidates - referrers, 0),
      publicProfiles,
      submittedApplications,
      totalRequests,
      requestsPending: countFor(requestsGroup, "PENDING"),
      requestsReferrerFound: countFor(requestsGroup, "REFERRER_FOUND"),
      requestsPaid: countFor(requestsGroup, "PAID"),
      totalConnections,
      connectionsPendingPayment: countFor(connectionsGroup, "PENDING_PAYMENT"),
      connectionsApproved: countFor(connectionsGroup, "APPROVED"),
      newUsers7d,
      newRequests7d,
    },
    requests,
    users,
    connections,
  });
}
