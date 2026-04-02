import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

function getConfiguredBaseURLs(): string[] {
  return unique([
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ]);
}

function getFallbackBaseURL(): string {
  const configured = getConfiguredBaseURLs();
  if (configured.length > 0) return configured[0];
  return "http://localhost:3000";
}

function unique(values: Array<string | undefined | null>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)).map((value) => value.trim()))];
}

function getAllowedHosts(): string[] {
  const configuredHosts = getConfiguredBaseURLs().flatMap((value) => {
    const host = new URL(value).host;
    const apexHost = host.startsWith("www.") ? host.slice(4) : host;
    const wwwHost = `www.${apexHost}`;

    return [host, apexHost, wwwHost];
  });

  return unique([
    "localhost:3000",
    "127.0.0.1:3000",
    "*.vercel.app",
    ...configuredHosts,
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
