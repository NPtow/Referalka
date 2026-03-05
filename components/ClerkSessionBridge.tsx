"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function ClerkSessionBridge() {
  const { isLoaded, isSignedIn, user } = useUser();
  const syncedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      syncedForUser.current = null;
      return;
    }

    const clerkUserId = user?.id ?? "signed-in";
    if (syncedForUser.current === clerkUserId) return;
    syncedForUser.current = clerkUserId;

    fetch("/api/auth/clerk/sync", { method: "POST" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({} as { redirect?: string }));
        if (!res.ok) {
          console.error("[Clerk Bridge] Sync failed", data);
          return;
        }

        if (window.location.pathname === "/" && data.redirect) {
          window.location.replace(data.redirect);
        }
      })
      .catch((err) => {
        console.error("[Clerk Bridge] Network error", err);
      });
  }, [isLoaded, isSignedIn, user?.id]);

  return null;
}
