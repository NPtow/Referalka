function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return trimTrailingSlash(process.env.NEXT_PUBLIC_APP_URL);
  if (process.env.BETTER_AUTH_URL) return trimTrailingSlash(process.env.BETTER_AUTH_URL);
  if (process.env.VERCEL_URL) return `https://${trimTrailingSlash(process.env.VERCEL_URL)}`;
  return "http://localhost:3000";
}
