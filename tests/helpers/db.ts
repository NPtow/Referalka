import { prisma } from "@/lib/prisma";

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "ReferralConnection",
      "ProfileView",
      "Profile",
      "Referrer",
      "ReferralRequest",
      "User",
      "AuthSession",
      "AuthAccount",
      "AuthVerification",
      "AuthUser"
    CASCADE;
  `);
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
