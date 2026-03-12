"use client";

import { createAuthClient } from "better-auth/react";

const serverBaseURL = process.env.BETTER_AUTH_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const clientBaseURL =
  typeof window === "undefined"
    ? serverBaseURL
    : window.location.origin;

const baseURL = new URL("/api/auth", clientBaseURL).toString();

export const authClient = createAuthClient({
  baseURL,
});
