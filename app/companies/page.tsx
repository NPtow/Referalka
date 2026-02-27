"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import CompanyCard from "@/components/ui/CompanyCard";
import { COMPANIES_META } from "@/lib/constants";

const ALL_TAGS = ["Все", "IT", "Финтех", "E-commerce", "Медиа"];

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("Все");
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    COMPANIES_META.forEach(async (c) => {
      const res = await fetch(`/api/vacancies?company=${c.slug}&count=true`);
      const json = await res.json();
      setCounts((prev) => ({ ...prev, [c.slug]: json.count ?? 0 }));
    });
  }, []);

  const filtered = COMPANIES_META.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag === "Все" || c.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Navbar spacer */}
      <div className="h-16" />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-[#A0AEC0] mb-6">
          <Link href="/" className="hover:text-[#1863e5] transition-colors">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-[#718096]">Компании</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Найди реферала в топовую IT-компанию
          </h1>
          <p className="text-[#718096] text-lg">
            {COMPANIES_META.length} компаний · выбери нужную и запроси реферала прямо у сотрудника
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5] bg-white"
          />
          <div className="flex gap-2 flex-wrap">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTag === tag
                    ? "bg-[#1863e5] text-white"
                    : "bg-white border border-gray-200 text-[#718096] hover:border-[#1863e5] hover:text-[#1863e5]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((company) => (
              <CompanyCard key={company.slug} company={company} vacancyCount={counts[company.slug]} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[#A0AEC0]">
            Ничего не найдено
          </div>
        )}
      </div>
    </div>
  );
}
