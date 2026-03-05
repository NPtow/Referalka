import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LOGIN_TTL_SECONDS = 60 * 10;

export async function POST() {
  const botUsername =
    process.env.TELEGRAM_BOT_USERNAME ?? process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  if (!botUsername) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_USERNAME is not configured" },
      { status: 500 }
    );
  }

  const expiresAt = new Date(Date.now() + LOGIN_TTL_SECONDS * 1000);
  const pending = await prisma.pendingAuth.create({
    data: { expiresAt },
  });

  const response = NextResponse.json({
    botUrl: `https://t.me/${botUsername}?start=login_${pending.token}`,
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
