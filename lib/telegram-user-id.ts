import crypto from "crypto";

const MAX_INT_32 = 2_147_483_647;

export function toAppUserId(telegramUserId: number): number {
  if (Number.isInteger(telegramUserId) && telegramUserId > 0 && telegramUserId <= MAX_INT_32) {
    return telegramUserId;
  }

  const digest = crypto.createHash("sha256").update(String(telegramUserId)).digest();
  const hashed = digest.readUInt32BE(0) % MAX_INT_32;
  return hashed === 0 ? 1 : hashed;
}
