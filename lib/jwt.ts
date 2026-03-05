import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signJWT(payload: { userId: number }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<{ userId: number }> {
  const { payload } = await jwtVerify(token, secret);
  return payload as { userId: number };
}
