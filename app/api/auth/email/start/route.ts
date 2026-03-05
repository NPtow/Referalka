import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendAuthCodeEmail } from "@/lib/email";

const LOGIN_TTL_SECONDS = 60 * 10;
const CODE_MAX = 1_000_000;
const MAX_INT_32 = 2_147_483_647;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "User";
  return local.slice(0, 40) || "User";
}

function generateSixDigitCode(): string {
  return crypto.randomInt(0, CODE_MAX).toString().padStart(6, "0");
}

function hashEmailToId(email: string): number {
  const hash = crypto.createHash("sha256").update(email).digest();
  const value = hash.readUInt32BE(0) % MAX_INT_32;
  return value === 0 ? 1 : value;
}

async function ensureUserByEmail(email: string) {
  const existing = await prisma.user.findFirst({ where: { username: email } });
  if (existing) return existing;

  let candidateId = hashEmailToId(email);
  const firstName = buildNameFromEmail(email);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const existingById = await prisma.user.findUnique({
      where: { id: candidateId },
      select: { id: true, username: true },
    });

    if (existingById && existingById.username !== email) {
      candidateId = candidateId >= MAX_INT_32 - 1 ? 1 : candidateId + 1;
      continue;
    }

    try {
      return await prisma.user.upsert({
        where: { id: candidateId },
        update: { firstName, username: email },
        create: { id: candidateId, firstName, username: email, photoUrl: null },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        candidateId = candidateId >= MAX_INT_32 - 1 ? 1 : candidateId + 1;
        continue;
      }
      throw err;
    }
  }

  throw new Error("Could not allocate user id for email auth");
}

async function createPendingCode(userId: number, expiresAt: Date) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const token = generateSixDigitCode();
    try {
      return await prisma.pendingAuth.create({
        data: { token, userId, expiresAt },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not generate unique email auth code");
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = normalizeEmail(String(email ?? ""));

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Введите корректный email." }, { status: 400 });
    }

    const user = await ensureUserByEmail(normalizedEmail);
    const expiresAt = new Date(Date.now() + LOGIN_TTL_SECONDS * 1000);

    await prisma.pendingAuth.deleteMany({ where: { userId: user.id } });
    const pending = await createPendingCode(user.id, expiresAt);

    const sent = await sendAuthCodeEmail(normalizedEmail, pending.token);
    if (!sent) {
      return NextResponse.json(
        { error: "Не удалось отправить письмо. Проверь настройки EMAIL_FROM и RESEND_API_KEY." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, expiresAt: expiresAt.toISOString() });
  } catch (err) {
    console.error("[Email Auth] Start error:", err);
    return NextResponse.json({ error: "Ошибка сервера. Попробуйте позже." }, { status: 500 });
  }
}
