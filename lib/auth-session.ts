import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const readBetterAuthSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export async function getBetterAuthSession() {
  try {
    return await readBetterAuthSession();
  } catch (error) {
    if (
      typeof error === "object"
      && error !== null
      && "digest" in error
      && error.digest === "DYNAMIC_SERVER_USAGE"
    ) {
      return null;
    }

    console.error("Better Auth session read failed", error);
    return null;
  }
}

export async function requireBetterAuthSession() {
  const session = await getBetterAuthSession();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}
