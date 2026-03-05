import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();
  const normalizedEmail = normalizeEmail(String(email ?? ""));
  const token = String(code ?? "").replace(/\D/g, "").slice(0, 6);

  if (!isValidEmail(normalizedEmail)) {
    return NextResponse.json({ error: "Введите корректный email." }, { status: 400 });
  }
  if (token.length !== 6) {
    return NextResponse.json({ error: "Введите 6-значный код." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { username: normalizedEmail },
    include: { profile: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Пользователь с таким email не найден." }, { status: 404 });
  }

  const pending = await prisma.pendingAuth.findUnique({ where: { token } });
  if (!pending || pending.expiresAt < new Date() || pending.userId !== user.id) {
    return NextResponse.json({ error: "Код не найден или устарел." }, { status: 400 });
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
