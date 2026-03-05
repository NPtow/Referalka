"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { COMPANIES_META } from "@/lib/constants";
import { getUser, StoredUser } from "@/lib/auth";
import VacancyCard from "@/components/ui/VacancyCard";
import AuthModal from "@/components/AuthModal";
import OnboardingModal from "@/components/onboarding/OnboardingModal";

interface Vacancy {
  id: string;
  companySlug: string;
  title: string;
  level: string;
  type: string;
  tags: string[];
  salary?: string | null;
}

const TYPE_FILTER = ["Все", "remote", "office", "hybrid"];
const LEVEL_FILTER = ["Все", "junior", "middle", "senior"];
const TYPE_LABELS: Record<string, string> = { remote: "Удалённо", office: "Офис", hybrid: "Гибрид" };
const LEVEL_LABELS: Record<string, string> = { junior: "Junior", middle: "Middle", senior: "Senior" };

type ModalState = null | "auth" | "onboarding" | "payment" | "success";

export default function CompanyPage() {
  const { slug } = useParams<{ slug: string }>();
  const company = COMPANIES_META.find((c) => c.slug === slug);

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("Все");
  const [levelFilter, setLevelFilter] = useState("Все");
  const [modal, setModal] = useState<ModalState>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/vacancies?company=${slug}`)
      .then((r) => r.json())
      .then((d) => { setVacancies(d.vacancies ?? []); setLoading(false); });
  }, [slug]);

  const handleRequest = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    const currentUser = getUser();
    if (!currentUser) {
      setModal("auth");
    } else if (!currentUser.profile) {
      setModal("onboarding");
    } else {
      setModal("payment");
    }
  };

  const filtered = vacancies.filter((v) => {
    const matchType = typeFilter === "Все" || v.type === typeFilter;
    const matchLevel = levelFilter === "Все" || v.level === levelFilter;
    return matchType && matchLevel;
  });

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#718096] mb-4">Компания не найдена</p>
          <Link href="/companies" className="text-[#1863e5] hover:underline">← Все компании</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-[#A0AEC0] mb-6">
          <Link href="/" className="hover:text-[#1863e5] transition-colors">Главная</Link>
          <span className="mx-2">/</span>
          <Link href="/companies" className="hover:text-[#1863e5] transition-colors">Компании</Link>
          <span className="mx-2">/</span>
          <span className="text-[#718096]">{company.name}</span>
        </div>

        {/* Company header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            {company.logoPath ? (
              <div className="w-16 h-16 rounded-2xl bg-[#F7FAFC] flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image src={company.logoPath} alt={company.name} width={48} height={48} className="object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#EBF4FF] flex items-center justify-center flex-shrink-0 text-[#1863e5] font-bold text-xl">
                {company.name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-black text-[#171923]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                  {company.name}
                </h1>
                {company.tags.map((tag) => (
                  <span key={tag} className="bg-[#EBF4FF] text-[#1863e5] text-xs px-2 py-0.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[#A0AEC0] mb-2">{company.size}</p>
              <p className="text-sm text-[#718096] mb-3">{company.description}</p>
              <div className="flex gap-4 flex-wrap">
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#1863e5] hover:underline"
                >
                  {company.website} ↗
                </a>
                <a
                  href={company.vacancyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-white bg-[#1863e5] hover:bg-[#1251c0] px-3 py-1 rounded-lg transition-colors"
                >
                  Смотреть вакансии ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Vacancies */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-[#171923]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Вакансии {!loading && <span className="text-[#A0AEC0] font-normal text-base">({vacancies.length})</span>}
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex gap-1">
            {TYPE_FILTER.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === t ? "bg-[#1863e5] text-white" : "bg-white border border-gray-200 text-[#718096] hover:border-[#1863e5]"
                }`}
              >
                {t === "Все" ? "Все типы" : TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {LEVEL_FILTER.map((l) => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  levelFilter === l ? "bg-[#1863e5] text-white" : "bg-white border border-gray-200 text-[#718096] hover:border-[#1863e5]"
                }`}
              >
                {l === "Все" ? "Все уровни" : LEVEL_LABELS[l]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((v) => (
              <VacancyCard key={v.id} vacancy={v} onRequest={handleRequest} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[#A0AEC0]">
            Вакансий с такими фильтрами нет
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === "auth" && (
        <AuthModal onClose={() => setModal(null)} />
      )}
      {modal === "onboarding" && user && (
        <OnboardingModal
          userId={user.id}
          firstName={user.firstName}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "payment" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className="text-4xl mb-3">💳</div>
            <h3 className="text-xl font-black text-[#171923] mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Запрос реферала
            </h3>
            <p className="font-semibold text-[#171923] mb-4">
              {selectedVacancy?.title} · {company.name}
            </p>
            <div className="bg-[#FFF8E1] border border-[#F6E05E] rounded-xl p-4 mb-5 text-left">
              <p className="text-sm font-semibold text-[#744210] mb-1">🧪 Бета-тестирование</p>
              <p className="text-sm text-[#92400E]">
                Сейчас мы работаем в ручном режиме. После подтверждения заявки с вами свяжется наш менеджер в Telegram и объяснит следующие шаги.
              </p>
            </div>
            <button
              onClick={() => setModal("success")}
              className="w-full bg-[#1863e5] text-white font-semibold py-3 rounded-xl hover:bg-[#1550c0] transition-colors mb-3"
            >
              Подтвердить заявку →
            </button>
            <button
              onClick={() => setModal(null)}
              className="text-sm text-[#A0AEC0] hover:text-[#718096] transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
      {modal === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-black text-[#171923] mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Заявка принята!
            </h3>
            <p className="text-sm text-[#718096] mb-1">
              Ищем реферера для вакансии:
            </p>
            <p className="font-semibold text-[#171923] mb-4">{selectedVacancy?.title} в {company.name}</p>
            <p className="text-sm text-[#718096] mb-6">
              Уведомим тебя в течение 1–3 рабочих дней
            </p>
            <button
              onClick={() => setModal(null)}
              className="w-full bg-[#1863e5] text-white font-semibold py-3 rounded-xl hover:bg-[#1550c0] transition-colors"
            >
              Отлично, жду!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
