"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import MarketplaceCard, { Candidate } from "@/components/ui/MarketplaceCard";
import { ROLES, COMPANIES_META } from "@/lib/constants";

const RELOCATION_OPTS = [
  { value: "", label: "Все" },
  { value: "true", label: "Только к переезду" },
];

export default function MarketplacePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [relocationFilter, setRelocationFilter] = useState("");
  const [expMin, setExpMin] = useState(0);
  const [expMax, setExpMax] = useState(15);
  const [selected, setSelected] = useState<Candidate | null>(null);

  const handleViewCandidate = (c: Candidate) => {
    setSelected(c);
    fetch(`/api/profile/${c.id}/view`, { method: "POST" });
  };

  const fetchCandidates = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter) params.set("role", roleFilter);
    if (companyFilter) params.set("company", companyFilter);
    if (relocationFilter) params.set("relocation", relocationFilter);
    if (expMin > 0) params.set("minExp", String(expMin));
    if (expMax < 15) params.set("maxExp", String(expMax));

    fetch(`/api/marketplace?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { setCandidates(d.candidates ?? []); setLoading(false); });
  }, [roleFilter, companyFilter, relocationFilter, expMin, expMax]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-[#A0AEC0] mb-6">
          <Link href="/" className="hover:text-[#1863e5] transition-colors">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-[#718096]">Маркетплейс</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Зарефери крутого кандидата
          </h1>
          <p className="text-[#718096] text-lg">
            Специалисты, которые ищут реферал в топовые IT-компании
          </p>
        </div>

        {/* CTA banner for candidates */}
        <div className="bg-[#EBF4FF] border border-[#c3dafe] rounded-2xl p-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-[#1863e5]">Вы ищете реферал?</p>
            <p className="text-xs text-[#718096]">Добавьте себя в маркетплейс — рефереры найдут вас сами</p>
          </div>
          <Link
            href="/profile"
            className="flex-shrink-0 bg-[#1863e5] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1550c0] transition-colors"
          >
            Добавить себя →
          </Link>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">
          {/* Left sidebar: filters */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
              <p className="text-sm font-bold text-[#171923] mb-5">Фильтры</p>

              {/* Role */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-[#A0AEC0] mb-2">Роль</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#171923] outline-none focus:border-[#1863e5] bg-white"
                >
                  <option value="">Все роли</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Company */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-[#A0AEC0] mb-2">Желаемая компания</label>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#171923] outline-none focus:border-[#1863e5] bg-white"
                >
                  <option value="">Все компании</option>
                  {COMPANIES_META.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {/* Experience range */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-[#A0AEC0] mb-2">
                  Опыт: {expMin}–{expMax === 15 ? "15+" : expMax} лет
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="range" min={0} max={15} step={1}
                    value={expMin}
                    onChange={(e) => setExpMin(Math.min(Number(e.target.value), expMax))}
                    className="w-full accent-[#1863e5]"
                  />
                  <input
                    type="range" min={0} max={15} step={1}
                    value={expMax}
                    onChange={(e) => setExpMax(Math.max(Number(e.target.value), expMin))}
                    className="w-full accent-[#1863e5]"
                  />
                </div>
              </div>

              {/* Relocation */}
              <div>
                <label className="block text-xs font-medium text-[#A0AEC0] mb-2">Переезд</label>
                <div className="flex flex-col gap-1.5">
                  {RELOCATION_OPTS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setRelocationFilter(o.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                        relocationFilter === o.value
                          ? "bg-[#1863e5] text-white"
                          : "bg-white border border-gray-200 text-[#718096] hover:border-[#1863e5]"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content: cards grid */}
          <div className="flex-1 min-w-0">
            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {candidates.map((c) => (
                  <MarketplaceCard key={c.id} candidate={c} onView={handleViewCandidate} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-[#A0AEC0] hover:text-[#718096] text-xl leading-none"
            >
              ×
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              {selected.user.photoUrl ? (
                <Image
                  src={selected.user.photoUrl}
                  alt={selected.user.firstName}
                  width={56}
                  height={56}
                  className="rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {selected.user.firstName[0]}
                </div>
              )}
              <div>
                <h2 className="text-xl font-black text-[#171923]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                  {selected.user.firstName}
                </h2>
                <p className="text-sm text-[#718096]">{selected.role}</p>
              </div>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 mb-4 text-xs">
              {selected.location && (
                <span className="bg-[#F7FAFC] text-[#718096] px-3 py-1 rounded-full border border-gray-200">
                  {selected.location}
                </span>
              )}
              <span className="bg-[#F7FAFC] text-[#718096] px-3 py-1 rounded-full border border-gray-200">
                {selected.experience} {selected.experience === 1 ? "год" : selected.experience < 5 ? "года" : "лет"} опыта
              </span>
              {selected.openToRelocation && (
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
                  Готов к переезду
                </span>
              )}
            </div>

            {/* Bio */}
            {selected.bio && (
              <div className="mb-4">
                <p className="text-xs text-[#A0AEC0] mb-1 font-medium uppercase tracking-wide">О себе</p>
                <p className="text-sm text-[#4A5568] leading-relaxed">{selected.bio}</p>
              </div>
            )}

            {/* Desired companies */}
            {selected.companies.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-[#A0AEC0] mb-2 font-medium uppercase tracking-wide">Хочет попасть в</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.companies.map((name) => {
                    const meta = COMPANIES_META.find((c) => c.name === name);
                    return (
                      <span key={name} className="bg-[#EBF4FF] text-[#1863e5] text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        {meta?.logoPath && (
                          <Image src={meta.logoPath} alt={name} width={12} height={12} className="object-contain" />
                        )}
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Links */}
            {(selected.linkedinUrl || selected.githubUrl || selected.resumeUrl || selected.siteUrl) && (
              <div className="mb-6">
                <p className="text-xs text-[#A0AEC0] mb-2 font-medium uppercase tracking-wide">Ссылки</p>
                <div className="flex flex-wrap gap-2">
                  {selected.linkedinUrl && (
                    <a href={selected.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1863e5] hover:underline bg-[#EBF4FF] px-3 py-1 rounded-full">
                      LinkedIn
                    </a>
                  )}
                  {selected.githubUrl && (
                    <a href={selected.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1863e5] hover:underline bg-[#EBF4FF] px-3 py-1 rounded-full">
                      GitHub
                    </a>
                  )}
                  {selected.resumeUrl && (
                    <a href={selected.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1863e5] hover:underline bg-[#EBF4FF] px-3 py-1 rounded-full">
                      Резюме
                    </a>
                  )}
                  {selected.siteUrl && (
                    <a href={selected.siteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1863e5] hover:underline bg-[#EBF4FF] px-3 py-1 rounded-full">
                      Сайт
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* CTA — only if username exists */}
            {selected.user.username && (
              <a
                href={`https://t.me/${selected.user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#1863e5] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#1550c0] transition-colors text-center"
              >
                Написать в Telegram
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
