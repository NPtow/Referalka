import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";
import { toAppUserId } from "@/lib/telegram-user-id";

const LOGIN_TTL_SECONDS = 60 * 10;
const CODE_MAX = 1_000_000;

function generateSixDigitCode(): string {
  return crypto.randomInt(0, CODE_MAX).toString().padStart(6, "0");
}

async function createPendingAuthWithUniqueCode(userId: number, expiresAt: Date) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const token = generateSixDigitCode();
    try {
      return await prisma.pendingAuth.create({
        data: { token, userId, expiresAt },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not generate unique login code");
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update.message;

    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const text: string = message.text;

    const startMatch = text.match(/^\/start(?:@\w+)?(?:\s+(.+))?$/);
    if (!startMatch) {
      return NextResponse.json({ ok: true });
    }

    const from = message.from;
    const tgId = Number(from.id);
    const normalizedUsername = from.username?.trim() || null;

    if (!normalizedUsername) {
      await sendTelegramMessage(
        tgId,
        "Для входа нужен Telegram username. Установи username в настройках Telegram и нажми /start снова."
      );
      return NextResponse.json({ ok: true });
    }

    console.log("[Bot Webhook] Start auth. tgId:", tgId, "username:", normalizedUsername);

    let user = await prisma.user.findFirst({ where: { username: normalizedUsername } });

    if (!user) {
      const preferredId = toAppUserId(tgId);
      const existingById = await prisma.user.findUnique({
        where: { id: preferredId },
        select: { id: true, username: true },
      });

      if (existingById && existingById.username && existingById.username !== normalizedUsername) {
        await sendTelegramMessage(
          tgId,
          "Не удалось связать аккаунт. Попробуй снова или напиши в поддержку."
        );
        return NextResponse.json({ ok: true });
      }

      user = await prisma.user.upsert({
        where: { id: preferredId },
        update: {
          firstName: from.first_name,
          username: normalizedUsername,
          photoUrl: null,
        },
        create: {
          id: preferredId,
          firstName: from.first_name,
          username: normalizedUsername,
          photoUrl: null,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: from.first_name,
          username: normalizedUsername,
          photoUrl: null,
        },
      });
    }

    await prisma.pendingAuth.deleteMany({
      where: { userId: user.id },
    });
    const expiresAt = new Date(Date.now() + LOGIN_TTL_SECONDS * 1000);
    const pending = await createPendingAuthWithUniqueCode(user.id, expiresAt);

    const messageSent = await sendTelegramMessage(
      tgId,
      `Код для входа в Рефералку: <b>${pending.token}</b>\n\nВведи его на сайте в течение 10 минут.`
    );

    if (!messageSent) {
      console.error("[Bot Webhook] Failed to send login code to chat:", tgId);
    }

    console.log("[Bot Webhook] Success. userId:", user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Bot Webhook] Error:", err);
    return NextResponse.json({ ok: true });
  }
}
