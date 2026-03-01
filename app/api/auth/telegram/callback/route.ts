import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTelegramAuth } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const authData = {
    id: Number(params.get("id")),
    first_name: params.get("first_name") ?? "",
    username: params.get("username") ?? undefined,
    photo_url: params.get("photo_url") ?? undefined,
    auth_date: Number(params.get("auth_date")),
    hash: params.get("hash") ?? "",
  };

  if (!verifyTelegramAuth(authData)) {
    console.error("[TG Auth Callback] HMAC failed for id:", authData.id);
    return NextResponse.redirect(new URL("/?auth_error=1", req.url));
  }

  try {
    const user = await prisma.user.upsert({
      where: { id: authData.id },
      update: {
        firstName: authData.first_name,
        username: authData.username ?? null,
        photoUrl: authData.photo_url ?? null,
      },
      create: {
        id: authData.id,
        firstName: authData.first_name,
        username: authData.username ?? null,
        photoUrl: authData.photo_url ?? null,
      },
      include: { profile: true },
    });

    console.log("[TG Auth Callback] Success. User id:", user.id);

    const response = NextResponse.redirect(new URL("/?auth_success=1", req.url));
    response.cookies.set(
      "tg_auth",
      JSON.stringify({ id: user.id, firstName: user.firstName, profile: user.profile ?? null }),
      { path: "/", maxAge: 60, httpOnly: false, sameSite: "lax" }
    );
    return response;
  } catch (err) {
    console.error("[TG Auth Callback] DB error:", err);
    return NextResponse.redirect(new URL("/?auth_error=1", req.url));
  }
}
