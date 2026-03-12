import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getBetterAuthSession } from "@/lib/auth-session";

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
  betterAuthUserId,
}: {
  email: string;
  firstName: string;
  photoUrl: string | null;
  betterAuthUserId: string;
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
          betterAuthUserId,
        },
        create: {
          id: candidateId,
          firstName,
          username: email,
          photoUrl,
          betterAuthUserId,
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

  throw new Error("Could not allocate user id for Better Auth user");
}

export async function resolveCurrentAppUser(): Promise<AppUser | null> {
  const session = await getBetterAuthSession();
  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  const email = normalizeEmail(session.user.email);
  const betterAuthUserId = session.user.id;
  const firstName = session.user.name?.trim() || buildNameFromEmail(email);
  const photoUrl = session.user.image ?? null;

  const existingByAuthId = await prisma.user.findUnique({
    where: { betterAuthUserId },
    include: { profile: true, referrer: true },
  });

  if (existingByAuthId) {
    if (
      existingByAuthId.firstName !== firstName ||
      existingByAuthId.username !== email ||
      existingByAuthId.photoUrl !== photoUrl
    ) {
      return prisma.user.update({
        where: { id: existingByAuthId.id },
        data: {
          firstName,
          username: email,
          photoUrl,
        },
        include: { profile: true, referrer: true },
      });
    }

    return existingByAuthId;
  }

  const existingByEmail = await prisma.user.findFirst({
    where: { username: email },
    include: { profile: true, referrer: true },
  });

  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        betterAuthUserId,
        firstName,
        username: email,
        photoUrl,
      },
      include: { profile: true, referrer: true },
    });
  }

  return createUserWithStableId({ email, firstName, photoUrl, betterAuthUserId });
}
