import type { Profile } from "@prisma/client";

export type ProfileFormPayload = {
  roles: string[];
  companies: string[];
  experience: number;
  location: string | null;
  resumeUrl: string | null;
  resumeFileUrl: string | null;
  resumeFileName: string | null;
  resumeFileMime: string | null;
  resumeFileSize: number | null;
  resumeText: string | null;
  telegramContact: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  siteUrl: string | null;
  bio: string | null;
  openToRelocation: boolean;
  isPublic: boolean;
};

function normalizeString(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const list: string[] = [];
  for (const item of value) {
    const normalized = String(item ?? "").trim();
    if (!normalized) continue;
    if (seen.has(normalized.toLowerCase())) continue;
    seen.add(normalized.toLowerCase());
    list.push(normalized);
  }
  return list;
}

function normalizeExperience(value: unknown): number {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), 50);
}

function normalizeFileSize(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export function normalizeProfilePayload(raw: unknown): ProfileFormPayload {
  const body = (raw ?? {}) as Record<string, unknown>;
  return {
    roles: normalizeStringArray(body.roles),
    companies: normalizeStringArray(body.companies),
    experience: normalizeExperience(body.experience),
    location: normalizeString(body.location),
    resumeUrl: normalizeString(body.resumeUrl),
    resumeFileUrl: normalizeString(body.resumeFileUrl),
    resumeFileName: normalizeString(body.resumeFileName),
    resumeFileMime: normalizeString(body.resumeFileMime),
    resumeFileSize: normalizeFileSize(body.resumeFileSize),
    resumeText: normalizeString(body.resumeText),
    telegramContact: normalizeString(body.telegramContact),
    linkedinUrl: normalizeString(body.linkedinUrl),
    githubUrl: normalizeString(body.githubUrl),
    siteUrl: normalizeString(body.siteUrl),
    bio: normalizeString(body.bio),
    openToRelocation: Boolean(body.openToRelocation),
    isPublic: Boolean(body.isPublic),
  };
}

export function validateProfilePayload(payload: ProfileFormPayload): string | null {
  if (!payload.roles.length) return "Выбери хотя бы одну роль.";
  if (!payload.companies.length) return "Выбери хотя бы одну компанию.";
  if (
    !payload.resumeUrl &&
    !payload.resumeText &&
    !payload.resumeFileUrl
  ) {
    return "Добавь резюме файлом, ссылкой или текстом.";
  }
  return null;
}

export function payloadToProfileCreateUpdate(payload: ProfileFormPayload) {
  const primaryRole = payload.roles[0] ?? "Specialist";
  return {
    role: primaryRole,
    roles: payload.roles,
    companies: payload.companies,
    experience: payload.experience,
    location: payload.location,
    resumeUrl: payload.resumeUrl,
    resumeFileUrl: payload.resumeFileUrl,
    resumeFileName: payload.resumeFileName,
    resumeFileMime: payload.resumeFileMime,
    resumeFileSize: payload.resumeFileSize,
    resumeText: payload.resumeText,
    telegramContact: payload.telegramContact,
    linkedinUrl: payload.linkedinUrl,
    githubUrl: payload.githubUrl,
    siteUrl: payload.siteUrl,
    bio: payload.bio,
    openToRelocation: payload.openToRelocation,
    isPublic: payload.isPublic,
    summary: buildProfileSummary(payload),
  };
}

export function profileToPayload(profile: Pick<Profile,
  | "role"
  | "roles"
  | "companies"
  | "experience"
  | "location"
  | "resumeUrl"
  | "resumeFileUrl"
  | "resumeFileName"
  | "resumeFileMime"
  | "resumeFileSize"
  | "resumeText"
  | "telegramContact"
  | "linkedinUrl"
  | "githubUrl"
  | "siteUrl"
  | "bio"
  | "openToRelocation"
  | "isPublic"
>): ProfileFormPayload {
  return {
    roles: profile.roles?.length ? profile.roles : [profile.role],
    companies: profile.companies ?? [],
    experience: profile.experience ?? 0,
    location: profile.location,
    resumeUrl: profile.resumeUrl,
    resumeFileUrl: profile.resumeFileUrl,
    resumeFileName: profile.resumeFileName,
    resumeFileMime: profile.resumeFileMime,
    resumeFileSize: profile.resumeFileSize,
    resumeText: profile.resumeText,
    telegramContact: profile.telegramContact,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    siteUrl: profile.siteUrl,
    bio: profile.bio,
    openToRelocation: profile.openToRelocation,
    isPublic: profile.isPublic,
  };
}

export function buildProfileSummary(payload: ProfileFormPayload): string {
  return [
    `Роли: ${payload.roles.join(", ")}`,
    `Опыт: ${payload.experience} лет`,
    `Желаемые компании: ${payload.companies.join(", ")}`,
    payload.location && `Локация: ${payload.location}`,
    payload.openToRelocation ? "Готов к переезду" : null,
    payload.bio && `О себе: ${payload.bio}`,
    payload.telegramContact && `Telegram: ${payload.telegramContact}`,
    payload.resumeFileUrl && `Резюме (файл): ${payload.resumeFileUrl}`,
    payload.resumeUrl && `Резюме (ссылка): ${payload.resumeUrl}`,
    payload.linkedinUrl && `LinkedIn: ${payload.linkedinUrl}`,
    payload.githubUrl && `GitHub: ${payload.githubUrl}`,
    payload.siteUrl && `Сайт: ${payload.siteUrl}`,
    payload.resumeText && `\n--- Текст резюме ---\n${payload.resumeText}`,
  ]
    .filter(Boolean)
    .join("\n");
}
