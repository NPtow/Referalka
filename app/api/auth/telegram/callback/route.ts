import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import { jwtVerify, createRemoteJWKSet } from "jose";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const TELEGRAM_JWKS = createRemoteJWKSet(
  new URL("https://oauth.telegram.org/.well-known/jwks.json")
);

export async function POST(request: NextRequest) {
  const appUrl = process.env.APP_URL!;

  try {
    const { id_token } = await request.json();
    if (!id_token) {
      return NextResponse.json({ redirect: `${appUrl}/?auth_error=invalid` }, { status: 400 });
    }

    // Verify id_token signature via Telegram JWKS and validate claims
    const { payload } = await jwtVerify(id_token, TELEGRAM_JWKS, {
      issuer: "https://oauth.telegram.org",
      audience: process.env.NEXT_PUBLIC_TELEGRAM_CLIENT_ID!,
    });

    const tgId = payload.id as number;
    const firstName = (payload.name as string) ?? "User";
    const username = (payload.preferred_username as string) ?? null;
    const photoUrl = (payload.picture as string) ?? null;

    if (!tgId) {
      console.error("[TG OIDC] No id in token payload");
      return NextResponse.json({ redirect: `${appUrl}/?auth_error=invalid` });
    }

    const user = await prisma.user.upsert({
      where: { id: tgId },
      update: { firstName, username, photoUrl },
      create: { id: tgId, firstName, username, photoUrl },
      include: { profile: true },
    });

    console.log("[TG OIDC] Success. User id:", user.id);

    const token = await signJWT({ userId: user.id });
    const userInfo = { id: user.id, firstName: user.firstName, profile: user.profile ?? null };

    const redirectPath = user.profile ? "/dashboard" : "/profile";

    // Set cookies via headers since this is a JSON response
    const response = NextResponse.json({ redirect: redirectPath });

    response.cookies.set("auth_token", token, {
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
  } catch (err) {
    console.error("[TG OIDC] Error:", err);
    return NextResponse.json({ redirect: `/?auth_error=invalid` }, { status: 401 });
  }
}
