type CompanySource = {
  company?: string | null;
  companies?: string[];
};

type RoleSource = {
  role?: string | null;
  roles?: string[];
};

export function normalizeMatchingValue(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveCompanyList(source: CompanySource): string[] {
  const list = source.companies?.length
    ? source.companies
    : source.company
      ? [source.company]
      : [];

  const seen = new Set<string>();
  const resolved: string[] = [];

  for (const item of list) {
    const trimmed = String(item ?? "").trim();
    if (!trimmed) continue;

    const key = normalizeMatchingValue(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    resolved.push(trimmed);
  }

  return resolved;
}

export function resolveRoleList(source: RoleSource): string[] {
  const list = source.roles?.length
    ? source.roles
    : source.role
      ? [source.role]
      : [];

  const seen = new Set<string>();
  const resolved: string[] = [];

  for (const item of list) {
    const trimmed = String(item ?? "").trim();
    if (!trimmed) continue;

    const key = normalizeMatchingValue(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    resolved.push(trimmed);
  }

  return resolved;
}

export function intersectByNormalizedValue(left: string[], right: string[]): string[] {
  const rightKeys = new Set(right.map((item) => normalizeMatchingValue(item)));
  return left.filter((item) => rightKeys.has(normalizeMatchingValue(item)));
}

export function includesNormalizedValue(list: string[], value: string): boolean {
  const target = normalizeMatchingValue(value);
  return list.some((item) => normalizeMatchingValue(item) === target);
}
