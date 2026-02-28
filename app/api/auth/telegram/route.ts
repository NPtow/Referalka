import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTelegramAuth, TelegramUser } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body: TelegramUser = await req.json();

    if (!verifyTelegramAuth(body)) {
      console.error("[TG Auth] HMAC verification failed. User id:", body.id, "auth_date:", body.auth_date);
      return NextResponse.json({ error: "Invalid auth" }, { status: 401 });
    }

    const user = await prisma.user.upsert({
      where: { id: body.id },
      update: {
        firstName: body.first_name,
        username: body.username ?? null,
        photoUrl: body.photo_url ?? null,
      },
      create: {
        id: body.id,
        firstName: body.first_name,
        username: body.username ?? null,
        photoUrl: body.photo_url ?? null,
      },
      include: { profile: true },
    });

    console.log("[TG Auth] Success. User id:", user.id);
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[TG Auth] Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
