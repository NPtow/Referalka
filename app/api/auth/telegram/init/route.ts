import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pending = await prisma.pendingAuth.create({
    data: {
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  });
  return NextResponse.json({ token: pending.token });
}
