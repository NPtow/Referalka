import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";
import { toAppUserId } from "@/lib/telegram-user-id";

const MAX_INT_32 = 2_147_483_647;

function canUseIntDirectly(id: number): boolean {
  return Number.isInteger(id) && id > 0 && id <= MAX_INT_32;
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update.message;

    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const text: string = message.text;

    const startMatch = text.match(/^\/start(?:@\w+)?(?:\s+(.+))?$/);
    if (!startMatch) {
      return NextResponse.json({ ok: true });
    }

    const payload = startMatch[1]?.trim();
    if (!payload) {
      await sendTelegramMessage(
        message.from.id,
        "Чтобы войти, нажми на кнопку входа на сайте и перейди в бота по ссылке из сайта."
      );
      return NextResponse.json({ ok: true });
    }

    if (!payload.startsWith("login_")) {
      await sendTelegramMessage(message.from.id, "Неизвестная команда. Запусти вход заново с сайта.");
      return NextResponse.json({ ok: true });
    }

    const token = payload.replace("login_", "").trim();
    if (!/^\d{6}$/.test(token)) {
      await sendTelegramMessage(message.from.id, "Код входа некорректный. Запусти вход заново с сайта.");
      return NextResponse.json({ ok: true });
    }
    const from = message.from;
    const tgId = Number(from.id);
    const normalizedUsername = from.username?.trim() || null;

    console.log("[Bot Webhook] Auth attempt. token:", token, "userId:", tgId);

    const pending = await prisma.pendingAuth.findUnique({ where: { token } });

    if (!pending || pending.expiresAt < new Date()) {
      console.log("[Bot Webhook] Token not found or expired:", token);
      await sendTelegramMessage(from.id, "Ссылка устарела. Попробуй войти заново на сайте.");
      return NextResponse.json({ ok: true });
    }

    let user = normalizedUsername
      ? await prisma.user.findFirst({ where: { username: normalizedUsername } })
      : null;

    if (!user) {
      const preferredId = toAppUserId(tgId);
      const existingById = await prisma.user.findUnique({
        where: { id: preferredId },
        select: { id: true, username: true },
      });

      if (existingById && !normalizedUsername) {
        await sendTelegramMessage(
          from.id,
          "Для входа нужен Telegram username. Установи username в настройках Telegram и попробуй снова."
        );
        return NextResponse.json({ ok: true });
      }

      if (existingById && normalizedUsername && existingById.username !== normalizedUsername) {
        await sendTelegramMessage(
          from.id,
          "Не удалось связать аккаунт. Попробуй снова или напиши в поддержку."
        );
        return NextResponse.json({ ok: true });
      }

      user = await prisma.user.upsert({
        where: { id: preferredId },
        update: {
          firstName: from.first_name,
          username: normalizedUsername,
          photoUrl: null,
        },
        create: {
          id: preferredId,
          firstName: from.first_name,
          username: normalizedUsername,
          photoUrl: null,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: from.first_name,
          username: normalizedUsername,
        },
      });
    }

    await prisma.pendingAuth.update({
      where: { token },
      data: { userId: user.id },
    });

    const messageSent = await sendTelegramMessage(
      canUseIntDirectly(tgId) ? tgId : from.id,
      `Код для входа в Рефералку: <b>${token}</b>\n\nВведи его на сайте в течение 10 минут.`
    );

    if (!messageSent) {
      console.error("[Bot Webhook] Failed to send login code to chat:", tgId);
    }

    console.log("[Bot Webhook] Success. userId:", user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Bot Webhook] Error:", err);
    return NextResponse.json({ ok: true });
  }
}
