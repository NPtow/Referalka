"use client";

import { useMemo, useState } from "react";

type CompanyPickerProps = {
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
};

function uniqueStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const normalized = item.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
}

export default function CompanyPicker({
  options,
  values,
  onChange,
  multiple = true,
  placeholder = "Начни вводить название компании",
}: CompanyPickerProps) {
  const [query, setQuery] = useState("");

  const allOptions = useMemo(
    () => uniqueStrings([...options, ...values]),
    [options, values],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return allOptions.slice(0, 24);
    return allOptions.filter((option) => option.toLowerCase().includes(normalizedQuery)).slice(0, 24);
  }, [allOptions, query]);

  const canAddCustom = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return false;
    return !allOptions.some((option) => option.toLowerCase() === trimmed.toLowerCase());
  }, [allOptions, query]);

  const handleSelect = (company: string) => {
    if (multiple) {
      if (values.includes(company)) {
        onChange(values.filter((value) => value !== company));
      } else {
        onChange([...values, company]);
      }
      return;
    }

    onChange([company]);
    setQuery("");
  };

  const handleAddCustom = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (multiple) {
      onChange([...values, trimmed]);
    } else {
      onChange([trimmed]);
    }

    setQuery("");
  };

  const handleRemove = (company: string) => {
    onChange(values.filter((value) => value !== company));
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-3">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
      />

      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((company) => (
            <span
              key={company}
              className="inline-flex items-center gap-2 rounded-full bg-[#EBF4FF] px-3 py-1 text-xs font-medium text-[#1863e5]"
            >
              {company}
              <button
                type="button"
                onClick={() => handleRemove(company)}
                className="text-[#1550c0] transition-colors hover:text-[#0f3d92]"
                aria-label={`Убрать ${company}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 max-h-48 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {filteredOptions.map((company) => {
            const active = values.includes(company);
            return (
              <button
                key={company}
                type="button"
                onClick={() => handleSelect(company)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[#1863e5] text-white"
                    : "bg-[#F7FAFC] text-[#4A5568] hover:bg-[#EBF4FF]"
                }`}
              >
                {company}
              </button>
            );
          })}

          {canAddCustom && (
            <button
              type="button"
              onClick={handleAddCustom}
              className="rounded-full border border-dashed border-[#1863e5] px-3 py-1.5 text-xs font-semibold text-[#1863e5] transition-colors hover:bg-[#EBF4FF]"
            >
              Добавить "{query.trim()}"
            </button>
          )}
        </div>

        {!filteredOptions.length && !canAddCustom && (
          <p className="mt-2 text-xs text-[#718096]">Ничего не найдено. Попробуй другой запрос.</p>
        )}
      </div>
    </div>
  );
}
