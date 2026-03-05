import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const MAX_INT_32 = 2_147_483_647;

type AppUser = Prisma.UserGetPayload<{
  include: { profile: true; referrer: true };
}>;

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

async function createUserWithStableId({
  email,
  firstName,
  photoUrl,
  clerkUserId,
}: {
  email: string;
  firstName: string;
  photoUrl: string | null;
  clerkUserId: string;
}): Promise<AppUser> {
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
        update: {
          firstName,
          username: email,
          photoUrl,
          clerkUserId,
        },
        create: {
          id: candidateId,
          firstName,
          username: email,
          photoUrl,
          clerkUserId,
        },
        include: { profile: true, referrer: true },
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

export async function resolveCurrentAppUser(): Promise<AppUser | null> {
  const session = await auth();
  if (!session.userId) {
    return null;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    throw new Error("No email in Clerk profile");
  }

  const email = normalizeEmail(primaryEmail);
  const clerkUserId = clerkUser.id;
  const firstName = clerkUser.firstName?.trim() || clerkUser.username?.trim() || buildNameFromEmail(email);
  const photoUrl = clerkUser.imageUrl ?? null;

  const existingByClerkId = await prisma.user.findUnique({
    where: { clerkUserId },
    include: { profile: true, referrer: true },
  });

  if (existingByClerkId) {
    if (
      existingByClerkId.firstName !== firstName ||
      existingByClerkId.username !== email ||
      existingByClerkId.photoUrl !== photoUrl
    ) {
      return prisma.user.update({
        where: { id: existingByClerkId.id },
        data: { firstName, username: email, photoUrl },
        include: { profile: true, referrer: true },
      });
    }
    return existingByClerkId;
  }

  const existingByEmail = await prisma.user.findFirst({
    where: { username: email },
    include: { profile: true, referrer: true },
  });

  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkUserId,
        firstName,
        username: email,
        photoUrl,
      },
      include: { profile: true, referrer: true },
    });
  }

  return createUserWithStableId({ email, firstName, photoUrl, clerkUserId });
}
