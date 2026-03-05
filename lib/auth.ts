const COOKIE_NAME = "tg_user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface StoredUser {
  id: number;
  firstName: string;
  profile: unknown | null;
}

function parseCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getUser(): StoredUser | null {
  try {
    const raw = parseCookie(COOKIE_NAME);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: StoredUser): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function clearUser(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}
