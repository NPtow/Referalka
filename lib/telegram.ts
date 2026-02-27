import crypto from "crypto";

export async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    // fire-and-forget: ignore network errors
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function verifyTelegramAuth(data: TelegramUser): boolean {
  const { hash, ...rest } = data;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  const secretKey = crypto.createHash("sha256").update(token).digest();
  const checkString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k as keyof typeof rest]}`)
    .join("\n");

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  const isValid = hmac === hash;
  const isRecent = Date.now() / 1000 - rest.auth_date < 86400;
  return isValid && isRecent;
}
