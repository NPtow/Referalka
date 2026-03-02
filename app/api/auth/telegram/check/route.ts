import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ ready: false });
  }

  const pending = await prisma.pendingAuth.findUnique({ where: { token } });

  if (!pending || !pending.userId || pending.expiresAt < new Date()) {
    return NextResponse.json({ ready: false });
  }

  const user = await prisma.user.findUnique({
    where: { id: pending.userId },
    include: { profile: true },
  });

  await prisma.pendingAuth.delete({ where: { token } });

  return NextResponse.json({ ready: true, user });
}
