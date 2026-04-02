"use client";

import { createAuthClient } from "better-auth/react";

export type AuthViewer = {
  name?: string | null;
  email?: string | null;
} | null;

const serverBaseURL = process.env.NEXT_PUBLIC_APP_URL
  || process.env.BETTER_AUTH_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const clientBaseURL =
  typeof window === "undefined"
    ? serverBaseURL
    : window.location.origin;

const baseURL = new URL("/api/auth", clientBaseURL).toString();

export const authClient = createAuthClient({
  baseURL,
});

export function useAuthViewer(): {
  isPending: boolean;
  isSignedIn: boolean;
  viewer: AuthViewer;
} {
  const { data, isPending } = authClient.useSession();
  const viewer = data?.user
    ? {
        name: data.user.name ?? null,
        email: data.user.email ?? null,
      }
    : null;

  return {
    isPending,
    isSignedIn: Boolean(viewer?.email),
    viewer,
  };
}
