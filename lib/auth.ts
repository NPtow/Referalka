import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

function getFallbackBaseURL(): string {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function unique(values: Array<string | undefined | null>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)).map((value) => value.trim()))];
}

function getAllowedHosts(): string[] {
  const fallback = getFallbackBaseURL();
  const fallbackHost = fallback ? new URL(fallback).host : undefined;
  const apexHost = fallbackHost?.startsWith("www.") ? fallbackHost.slice(4) : fallbackHost;
  const wwwHost = apexHost ? `www.${apexHost}` : undefined;

  return unique([
    "localhost:3000",
    "127.0.0.1:3000",
    "*.vercel.app",
    fallbackHost,
    apexHost,
    wwwHost,
  ]);
}

const baseURL = getFallbackBaseURL();
const secret =
  process.env.BETTER_AUTH_SECRET
  || (process.env.VERCEL ? undefined : "local-dev-better-auth-secret-3c0d8f4a2e7b9c1d5f6a7e8c9b0d1f2a");

export const auth = betterAuth({
  secret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  baseURL: {
    allowedHosts: getAllowedHosts(),
    fallback: baseURL,
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
  },
  user: {
    modelName: "AuthUser",
  },
  session: {
    modelName: "AuthSession",
  },
  account: {
    modelName: "AuthAccount",
  },
  verification: {
    modelName: "AuthVerification",
  },
});
