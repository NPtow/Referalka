import { NextResponse } from "next/server";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveTelegramBotUsername } from "@/lib/telegram";

const LOGIN_TTL_SECONDS = 60 * 10;
const CODE_MAX = 1_000_000;

function generateSixDigitCode(): string {
  return crypto.randomInt(0, CODE_MAX).toString().padStart(6, "0");
}

async function createPendingAuthWithUniqueCode(expiresAt: Date) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const token = generateSixDigitCode();
    try {
      return await prisma.pendingAuth.create({
        data: { token, expiresAt },
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

export async function POST() {
  const botUsername = await resolveTelegramBotUsername();

  if (!botUsername) {
    return NextResponse.json(
      { error: "Не удалось определить username бота. Укажи TELEGRAM_BOT_USERNAME в .env" },
      { status: 500 }
    );
  }

  const expiresAt = new Date(Date.now() + LOGIN_TTL_SECONDS * 1000);
  const pending = await createPendingAuthWithUniqueCode(expiresAt);
  const startParam = `login_${pending.token}`;

  const response = NextResponse.json({
    botUrl: `https://t.me/${botUsername}?start=${startParam}`,
    botDeepLink: `tg://resolve?domain=${botUsername}&start=${startParam}`,
    expiresAt: expiresAt.toISOString(),
  });

  response.cookies.set("tg_login_token", pending.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: LOGIN_TTL_SECONDS,
    path: "/",
  });

  return response;
}
