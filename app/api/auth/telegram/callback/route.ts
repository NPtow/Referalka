import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTelegramAuth, TelegramUser } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const authData: TelegramUser = {
    id: Number(params.get("id")),
    first_name: params.get("first_name") ?? "",
    ...(params.get("username") && { username: params.get("username")! }),
    ...(params.get("photo_url") && { photo_url: params.get("photo_url")! }),
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

export async function POST(req: NextRequest) {
  const body = await req.json();

  const authData: TelegramUser = {
    id: Number(body.id),
    first_name: body.first_name ?? "",
    ...(body.username && { username: body.username }),
    ...(body.photo_url && { photo_url: body.photo_url }),
    auth_date: Number(body.auth_date),
    hash: body.hash ?? "",
  };

  if (!verifyTelegramAuth(authData)) {
    console.error("[TG Auth Widget] HMAC failed for id:", authData.id);
    return NextResponse.json({ error: "Invalid auth" }, { status: 401 });
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

    console.log("[TG Auth Widget] Success. User id:", user.id);
    return NextResponse.json({
      user: { id: user.id, firstName: user.firstName, profile: user.profile ?? null },
    });
  } catch (err) {
    console.error("[TG Auth Widget] DB error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
