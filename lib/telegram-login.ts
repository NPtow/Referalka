import crypto from "crypto";

export function buildTelegramLoginCode(token: string): string {
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const numeric = Number.parseInt(hash.slice(0, 12), 16) % 1000000;
  return numeric.toString().padStart(6, "0");
}

export function normalizeLoginCode(code: string): string {
  return code.replace(/\D/g, "").slice(0, 6);
}
