"use client";

import { createAuthClient } from "better-auth/react";

const serverBaseURL = process.env.BETTER_AUTH_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const baseURL =
  typeof window === "undefined"
    ? new URL("/api/auth", serverBaseURL).toString()
    : "/api/auth";

export const authClient = createAuthClient({
  baseURL,
});
