"use client";
import { useState } from "react";
import { COMPANIES } from "@/lib/constants";
import Button from "@/components/ui/Button";

interface Props {
  selected: string[];
  onChange: (companies: string[]) => void;
  onNext: () => void;
}

export default function Step1Companies({ selected, onChange, onNext }: Props) {
  const [query, setQuery] = useState("");

  const filtered = COMPANIES.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (c: string) => {
    onChange(selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c]);
  };

  return (
    <div>
      <h3 className="text-xl font-black text-[#171923] mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        В какие компании хочешь попасть?
      </h3>
      <p className="text-sm text-[#718096] mb-4">Выбери одну или несколько</p>

      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск компании..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1863e5] transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <p className="text-xs text-[#1863e5] font-medium mb-2">
          Выбрано: {selected.length}
        </p>
      )}

      {/* Scrollable list */}
      <div className="overflow-y-auto max-h-52 pr-1 mb-5 flex flex-wrap gap-2 content-start scrollbar-thin">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 w-full text-center">Ничего не найдено</p>
        ) : (
          filtered.map((c) => (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex-shrink-0 ${
                selected.includes(c)
                  ? "bg-[#1863e5] text-white border-[#1863e5]"
                  : "bg-white text-[#4A5568] border-gray-200 hover:border-[#1863e5]"
              }`}
            >
              {c}
            </button>
          ))
        )}
      </div>

      <Button className="w-full" disabled={selected.length === 0} onClick={onNext}>
        Далее →
      </Button>
    </div>
  );
}
