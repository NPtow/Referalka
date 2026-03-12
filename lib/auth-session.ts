import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getBetterAuthSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireBetterAuthSession() {
  const session = await getBetterAuthSession();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}
