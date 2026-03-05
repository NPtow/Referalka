import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
  const { code } = await request.json();
  const token = String(code ?? "").replace(/\D/g, "").slice(0, 6);
  if (token.length !== 6) {
    return NextResponse.json({ error: "Введите 6-значный код." }, { status: 400 });
  }

  const pending = await prisma.pendingAuth.findUnique({ where: { token } });
  if (!pending || pending.expiresAt < new Date()) {
    return NextResponse.json({ error: "Код не найден или устарел. Получи новый в боте." }, { status: 400 });
  }

  if (!pending.userId) {
    return NextResponse.json({ error: "Код не привязан к пользователю." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: pending.userId },
    include: { profile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден." }, { status: 404 });
  }

  const jwt = await signJWT({ userId: user.id });
  const userInfo = { id: user.id, firstName: user.firstName, profile: user.profile ?? null };
  const redirectPath = user.profile ? "/dashboard" : "/profile";

  await prisma.pendingAuth.delete({ where: { token } });

  const response = NextResponse.json({ redirect: redirectPath });
  response.cookies.set("auth_token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  response.cookies.set("tg_user", encodeURIComponent(JSON.stringify(userInfo)), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
