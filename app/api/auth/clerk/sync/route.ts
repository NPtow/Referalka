import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const MAX_INT_32 = 2_147_483_647;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function buildNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "User";
  return local.slice(0, 40) || "User";
}

function hashEmailToId(email: string): number {
  const hash = crypto.createHash("sha256").update(email).digest();
  const value = hash.readUInt32BE(0) % MAX_INT_32;
  return value === 0 ? 1 : value;
}

async function ensureUserByEmail(email: string, firstName: string) {
  const existing = await prisma.user.findFirst({
    where: { username: email },
    include: { profile: true },
  });

  if (existing) {
    if (existing.firstName !== firstName) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { firstName },
        include: { profile: true },
      });
    }
    return existing;
  }

  let candidateId = hashEmailToId(email);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const existingById = await prisma.user.findUnique({
      where: { id: candidateId },
      select: { id: true, username: true },
    });

    if (existingById && existingById.username !== email) {
      candidateId = candidateId >= MAX_INT_32 - 1 ? 1 : candidateId + 1;
      continue;
    }

    try {
      return await prisma.user.upsert({
        where: { id: candidateId },
        update: { firstName, username: email },
        create: { id: candidateId, firstName, username: email, photoUrl: null },
        include: { profile: true },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        candidateId = candidateId >= MAX_INT_32 - 1 ? 1 : candidateId + 1;
        continue;
      }
      throw err;
    }
  }

  throw new Error("Could not allocate user id for Clerk user");
}

export async function POST() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    return NextResponse.json({ error: "No email in Clerk profile" }, { status: 400 });
  }

  const email = normalizeEmail(primaryEmail);
  const firstName =
    clerkUser.firstName?.trim() ||
    clerkUser.username?.trim() ||
    buildNameFromEmail(email);

  const user = await ensureUserByEmail(email, firstName);
  const token = await signJWT({ userId: user.id });
  const userInfo = { id: user.id, firstName: user.firstName, profile: user.profile ?? null };
  const redirectPath = user.profile ? "/dashboard" : "/profile";

  const response = NextResponse.json({ redirect: redirectPath });
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  response.cookies.set("tg_user", encodeURIComponent(JSON.stringify(userInfo)), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
