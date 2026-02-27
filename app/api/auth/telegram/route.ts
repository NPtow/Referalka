import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTelegramAuth, TelegramUser } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const body: TelegramUser = await req.json();

  if (!verifyTelegramAuth(body)) {
    return NextResponse.json({ error: "Invalid auth" }, { status: 401 });
  }

  const user = await prisma.user.upsert({
    where: { id: body.id },
    update: {
      firstName: body.first_name,
      username: body.username ?? null,
      photoUrl: body.photo_url ?? null,
    },
    create: {
      id: body.id,
      firstName: body.first_name,
      username: body.username ?? null,
      photoUrl: body.photo_url ?? null,
    },
    include: { profile: true },
  });

  return NextResponse.json({ user });
}
