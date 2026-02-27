import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const profile = await prisma.profile.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.profileView.create({ data: { profileId: id } });

  // Fire-and-forget Telegram notification
  sendTelegramMessage(
    profile.userId,
    "👀 Твой профиль только что просмотрел реферер в маркетплейсе!"
  );

  return NextResponse.json({ ok: true });
}
