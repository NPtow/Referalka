import { cookies } from "next/headers";
import { verifyJWT } from "./jwt";

export async function getSessionUser(): Promise<{ userId: number } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return await verifyJWT(token);
  } catch {
    return null;
  }
}
