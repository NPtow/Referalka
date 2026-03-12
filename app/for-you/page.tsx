"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

interface StubVacancy {
  id: string;
  companySlug: string;
  companyName: string;
  logoPath: string | null;
  title: string;
  level: string;
  type: string;
  tags: string[];
  postedLabel: string;
}

const STUB_VACANCIES: StubVacancy[] = [
  {
    id: "stub-1",
    companySlug: "yandex",
    companyName: "Яндекс",
    logoPath: "/logos/yandex.svg",
    title: "Senior Frontend Developer",
    level: "senior",
    type: "hybrid",
    tags: ["React", "TypeScript", "Node.js"],
    postedLabel: "13 часов назад",
  },
  {
    id: "stub-2",
    companySlug: "tinkoff",
    companyName: "Тинькофф",
    logoPath: "/logos/tinkoff.svg",
    title: "Product Manager — Платежи",
    level: "middle",
    type: "office",
    tags: ["B2C", "Финтех", "Agile"],
    postedLabel: "1 день назад",
  },
  {
    id: "stub-3",
    companySlug: "ozon",
    companyName: "Озон",
    logoPath: "/logos/ozon.svg",
    title: "Backend Developer (Go)",
    level: "middle",
    type: "remote",
    tags: ["Go", "Microservices", "PostgreSQL"],
    postedLabel: "2 дня назад",
  },
  {
    id: "stub-4",
    companySlug: "avito",
    companyName: "Авито",
    logoPath: "/logos/avito.svg",
    title: "iOS Developer",
    level: "senior",
    type: "hybrid",
    tags: ["Swift", "UIKit", "SwiftUI"],
    postedLabel: "3 дня назад",
  },
  {
    id: "stub-5",
    companySlug: "vk",
    companyName: "ВКонтакте",
    logoPath: "/logos/vk.svg",
    title: "Data Scientist",
    level: "middle",
    type: "office",
    tags: ["Python", "ML", "PyTorch"],
    postedLabel: "4 дня назад",
  },
];

const TYPE_LABELS: Record<string, string> = { remote: "Удалённо", office: "Офис", hybrid: "Гибрид" };
const LEVEL_LABELS: Record<string, string> = { junior: "Junior", middle: "Middle", senior: "Senior", lead: "Lead" };
const LEVEL_COLORS: Record<string, string> = {
  junior: "bg-green-50 text-green-700",
  middle: "bg-blue-50 text-[#1863e5]",
  senior: "bg-purple-50 text-purple-700",
  lead: "bg-orange-50 text-orange-700",
};

type ModalState = null | "auth" | "need-profile" | "payment" | "success";

export default function ForYouPage() {
  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);
  const [modal, setModal] = useState<ModalState>(null);
  const [selectedVacancy, setSelectedVacancy] = useState<StubVacancy | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  const displayName =
    session?.user.name?.trim() || session?.user.email?.split("@")[0] || "Пользователь";

  useEffect(() => {
    if (!isSignedIn) {
      setHasProfile(false);
      return;
    }

    fetch("/api/profile")
      .then(async (r) => {
        if (!r.ok) return null;
        const data = await r.json();
        return data.profile ?? null;
      })
      .then((profile) => {
        setHasProfile(Boolean(profile));
      })
      .catch(() => setHasProfile(false));
  }, [isSignedIn]);

  const handleRequest = (vacancy: StubVacancy) => {
    setSelectedVacancy(vacancy);
    if (!isSignedIn) {
      setModal("auth");
    } else if (!hasProfile) {
      setModal("need-profile");
    } else {
      setModal("payment");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-sm text-[#A0AEC0] mb-6">
          <Link href="/" className="hover:text-[#1863e5] transition-colors">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-[#718096]">Для тебя</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
              {isSignedIn ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#1863e5] text-white flex items-center justify-center text-xl font-bold mb-3">
                    {displayName[0]?.toUpperCase() || "U"}
                  </div>
                  <p className="font-bold text-[#171923] text-sm mb-0.5">{displayName}</p>
                  <p className="text-xs text-[#A0AEC0] mb-3">{hasProfile ? "Профиль заполнен" : "Профиль не заполнен"}</p>
                  <p className="text-xs text-[#A0AEC0] mb-4">Местоположение не указано</p>
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 text-xs text-[#718096] hover:text-[#1863e5] transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    Обновить профиль
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#EBF4FF] flex items-center justify-center text-xl mb-3">
                    <span>👤</span>
                  </div>
                  <p className="text-sm text-[#718096] mb-3">Войди, чтобы видеть персональные вакансии</p>
                  <Link
                    href="/sign-in"
                    className="block w-full text-sm bg-[#1863e5] text-white font-semibold py-2 rounded-xl hover:bg-[#1550c0] transition-colors text-center"
                  >
                    Войти
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-[#171923]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                  Подобрано для тебя
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EBF4FF] text-[#1863e5]">Скоро</span>
              </div>
              <p className="text-sm text-[#A0AEC0]">
                Вакансии будут подбираться автоматически на основе твоего профиля и резюме.
                Сейчас — актуальные позиции из топовых компаний.
              </p>
            </div>

            <div className="space-y-3">
              {STUB_VACANCIES.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#1863e5] hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F7FAFC] border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {v.logoPath ? (
                          <Image src={v.logoPath} alt={v.companyName} width={28} height={28} className="object-contain" />
                        ) : (
                          <span className="text-sm font-bold text-[#1863e5]">{v.companyName[0]}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Link
                            href={`/companies/${v.companySlug}`}
                            className="text-sm font-semibold text-[#171923] hover:text-[#1863e5] transition-colors"
                          >
                            {v.companyName}
                          </Link>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#1863e5] to-[#7C3AED] text-white">
                            New
                          </span>
                        </div>

                        <p className="font-bold text-[#1863e5] text-base mb-1">{v.title}</p>
                        <p className="text-xs text-[#A0AEC0] mb-2">{v.postedLabel}</p>

                        <div className="flex flex-wrap gap-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[v.level] ?? "bg-gray-50 text-gray-600"}`}>
                            {LEVEL_LABELS[v.level] ?? v.level}
                          </span>
                          <span className="bg-[#F7FAFC] text-[#718096] text-xs px-2 py-0.5 rounded-full">
                            {TYPE_LABELS[v.type] ?? v.type}
                          </span>
                          {v.tags.map((tag) => (
                            <span key={tag} className="bg-[#F7FAFC] text-[#718096] text-xs px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRequest(v)}
                      className="flex-shrink-0 bg-[#1863e5] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1550c0] transition-colors whitespace-nowrap"
                    >
                      Запросить реферал
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-gradient-to-r from-[#1863e5] to-[#7C3AED] rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-sm mb-0.5">Хочешь персональный подбор?</p>
                <p className="text-white/80 text-xs">Заполни профиль — и мы будем подбирать вакансии специально под тебя</p>
              </div>
              <Link
                href="/profile"
                className="flex-shrink-0 bg-white text-[#1863e5] text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors ml-4"
              >
                Заполнить профиль →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {modal === "auth" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <h3 className="text-xl font-black text-[#171923] mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Вход в аккаунт
            </h3>
            <p className="text-sm text-[#718096] mb-6">Чтобы отправить запрос, нужно авторизоваться</p>
            <div className="flex gap-2">
              <Link
                href="/sign-in"
                className="flex-1 rounded-xl bg-[#1863e5] text-white font-semibold py-3 hover:bg-[#1550c0] transition-colors text-center"
              >
                Войти
              </Link>
              <Link
                href="/sign-up"
                className="flex-1 rounded-xl border border-gray-200 text-[#171923] font-semibold py-3 hover:bg-gray-50 transition-colors text-center"
              >
                Регистрация
              </Link>
            </div>
            <button
              onClick={() => setModal(null)}
              className="text-sm text-[#A0AEC0] hover:text-[#718096] transition-colors mt-4"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
      {modal === "need-profile" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-xl font-black text-[#171923] mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Сначала заполни профиль
            </h3>
            <p className="text-sm text-[#718096] mb-6">
              Чтобы запросить реферал, нужно заполнить профиль на экране профиля.
            </p>
            <a
              href="/profile"
              className="block w-full bg-[#1863e5] text-white font-semibold py-3 rounded-xl hover:bg-[#1550c0] transition-colors mb-3"
            >
              Открыть профиль →
            </a>
            <button
              onClick={() => setModal(null)}
              className="text-sm text-[#A0AEC0] hover:text-[#718096] transition-colors"
            >
              Позже
            </button>
          </div>
        </div>
      )}
      {modal === "payment" && selectedVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className="text-4xl mb-3">💳</div>
            <h3 className="text-xl font-black text-[#171923] mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Запрос реферала
            </h3>
            <p className="font-semibold text-[#171923] mb-4">
              {selectedVacancy.title} · {selectedVacancy.companyName}
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
      {modal === "success" && selectedVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-black text-[#171923] mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Заявка принята!
            </h3>
            <p className="text-sm text-[#718096] mb-1">Ищем реферера для вакансии:</p>
            <p className="font-semibold text-[#171923] mb-4">
              {selectedVacancy.title} в {selectedVacancy.companyName}
            </p>
            <p className="text-sm text-[#718096] mb-6">Уведомим тебя в течение 1–3 рабочих дней</p>
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
