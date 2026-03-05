"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardData {
  user: { id: number; firstName: string; username: string | null; photoUrl: string | null };
  role: "CANDIDATE" | "REFERRER";
  referrerCompany: string | null;
  profileComplete: boolean;
  profileProgress: number;
  activeRequests: {
    id: string;
    companySlug: string;
    companyName: string;
    status: string;
    createdAt: string;
  }[];
  hasReferrerFound: boolean;
  referrerFoundRequest: {
    id: string;
    companyName: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  PENDING: { icon: "🔍", label: "Ищем реферера...", color: "text-[#718096]" },
  REFERRER_FOUND: { icon: "✅", label: "Реферер найден!", color: "text-green-600" },
  PAID: { icon: "🎉", label: "Оплачено", color: "text-[#1863e5]" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн. назад`;
  return `${Math.floor(days / 7)} нед. назад`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1863e5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <p className="text-[#718096]">Не удалось загрузить данные</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Banner: referrer found */}
        {data.hasReferrerFound && data.referrerFoundRequest && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-bold text-green-800">
                ✅ Найден реферер в {data.referrerFoundRequest.companyName}!
              </p>
            </div>
            <Link
              href="/requests"
              className="flex-shrink-0 bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
            >
              Оплатить и получить контакт
            </Link>
          </div>
        )}

        {/* Greeting */}
        <h1 className="text-2xl font-black text-[#171923] mb-6" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
          Привет, {data.user.firstName}! 👋
        </h1>

        {/* Profile incomplete */}
        {!data.profileComplete && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <p className="text-base font-bold text-[#171923] mb-2">Чтобы начать — заполни профиль</p>
            <p className="text-sm text-[#718096] mb-4">Это займёт 2 минуты.</p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-[#A0AEC0] mb-1">
                <span>Заполнено</span>
                <span>{data.profileProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1863e5] rounded-full transition-all"
                  style={{ width: `${data.profileProgress}%` }}
                />
              </div>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center gap-2 bg-[#1863e5] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1550c0] transition-colors text-sm"
            >
              Заполнить профиль →
            </Link>
          </div>
        )}

        {/* Candidate view */}
        {data.profileComplete && data.role === "CANDIDATE" && (
          <>
            {/* CTA card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔍</div>
                <div>
                  <p className="text-base font-bold text-[#171923] mb-1">Хочешь реферал?</p>
                  <p className="text-sm text-[#718096] mb-4">
                    Выбери компанию и оставь заявку — мы найдём реферера.
                  </p>
                  <Link
                    href="/companies"
                    className="inline-flex items-center gap-2 bg-[#1863e5] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1550c0] transition-colors text-sm"
                  >
                    Запросить реферал →
                  </Link>
                </div>
              </div>
            </div>

            {/* Active requests */}
            <div className="mb-6">
              <h2 className="text-base font-bold text-[#171923] mb-3 uppercase tracking-wide text-xs text-[#A0AEC0]">
                Мои активные запросы
              </h2>
              {data.activeRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                  <p className="text-sm text-[#A0AEC0]">У тебя пока нет заявок</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.activeRequests.map((req) => {
                    const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.PENDING;
                    return (
                      <Link
                        key={req.id}
                        href="/requests"
                        className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#1863e5] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{cfg.icon}</span>
                            <div>
                              <p className="text-sm font-bold text-[#171923]">{req.companyName}</p>
                              <p className={`text-xs ${cfg.color}`}>{cfg.label}</p>
                            </div>
                          </div>
                          <p className="text-xs text-[#A0AEC0]">{timeAgo(req.createdAt)}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              {data.activeRequests.length > 0 && (
                <Link href="/requests" className="block text-center text-sm text-[#1863e5] hover:underline mt-3">
                  Все запросы →
                </Link>
              )}
            </div>
          </>
        )}

        {/* Referrer view */}
        {data.profileComplete && data.role === "REFERRER" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🤝</div>
              <div>
                <p className="text-base font-bold text-[#171923] mb-1">Ты реферер</p>
                {data.referrerCompany && (
                  <p className="text-sm text-[#718096] mb-1">Компания: {data.referrerCompany}</p>
                )}
                <p className="text-sm text-[#718096] mb-4">
                  Когда найдём подходящего кандидата — напишем в Telegram
                </p>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 border border-gray-200 text-[#171923] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#F7FAFC] transition-colors text-sm"
                >
                  Обновить профиль
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
