import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTelegramHash, OAuthTelegramUser } from "@/lib/telegram";
import { signJWT } from "@/lib/jwt";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appUrl = process.env.APP_URL!;

  const tgUser: OAuthTelegramUser = {
    id: Number(searchParams.get("id")),
    first_name: searchParams.get("first_name") ?? "",
    ...(searchParams.get("last_name") && { last_name: searchParams.get("last_name")! }),
    ...(searchParams.get("username") && { username: searchParams.get("username")! }),
    ...(searchParams.get("photo_url") && { photo_url: searchParams.get("photo_url")! }),
    auth_date: Number(searchParams.get("auth_date")),
    hash: searchParams.get("hash") ?? "",
  };

  if (!verifyTelegramHash(tgUser)) {
    console.error("[TG OAuth] HMAC failed for id:", tgUser.id);
    return NextResponse.redirect(`${appUrl}/?auth_error=invalid`);
  }

  try {
    const user = await prisma.user.upsert({
      where: { id: tgUser.id },
      update: {
        firstName: tgUser.first_name,
        username: tgUser.username ?? null,
        photoUrl: tgUser.photo_url ?? null,
      },
      create: {
        id: tgUser.id,
        firstName: tgUser.first_name,
        username: tgUser.username ?? null,
        photoUrl: tgUser.photo_url ?? null,
      },
      include: { profile: true },
    });

    console.log("[TG OAuth] Success. User id:", user.id);

    const token = await signJWT({ userId: user.id });
    const userInfo = { id: user.id, firstName: user.firstName, profile: user.profile ?? null };

    const response = NextResponse.redirect(`${appUrl}/profile`);

    // Secure JWT for server-side auth checks and middleware
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    // Non-httpOnly cookie for client-side user info display
    response.cookies.set("tg_user", encodeURIComponent(JSON.stringify(userInfo)), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[TG OAuth] DB error:", err);
    return NextResponse.redirect(`${appUrl}/?auth_error=db`);
  }
}
