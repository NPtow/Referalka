import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveTelegramBotUsername } from "@/lib/telegram";

const LOGIN_TTL_SECONDS = 60 * 10;

export async function POST() {
  const botUsername = await resolveTelegramBotUsername();

  if (!botUsername) {
    return NextResponse.json(
      { error: "Не удалось определить username бота. Укажи TELEGRAM_BOT_USERNAME в .env" },
      { status: 500 }
    );
  }

  const expiresAt = new Date(Date.now() + LOGIN_TTL_SECONDS * 1000);
  const pending = await prisma.pendingAuth.create({
    data: { expiresAt },
  });
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
