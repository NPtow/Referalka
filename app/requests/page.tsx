"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface ReferralRequest {
  id: string;
  companySlug: string;
  companyName: string;
  status: string;
  referrerName: string | null;
  referrerUsername: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн. назад`;
  return `${Math.floor(days / 7)} нед. назад`;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ReferralRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/requests")
      .then((r) => r.json())
      .then((d) => { setRequests(d.requests ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handlePay = async (requestId: string) => {
    setPayingId(requestId);
    try {
      const res = await fetch("/api/payment/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const json = await res.json();
      if (json.request) {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, ...json.request } : r))
        );
      }
    } finally {
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1863e5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-[#A0AEC0] mb-6">
          <Link href="/dashboard" className="hover:text-[#1863e5] transition-colors">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-[#718096]">Мои запросы</span>
        </div>

        <h1 className="text-2xl font-black text-[#171923] mb-6" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
          Мои запросы
        </h1>

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-lg font-bold text-[#171923] mb-2">У тебя пока нет заявок</p>
            <p className="text-sm text-[#718096] mb-6">
              Выбери компанию и запроси реферал — мы найдём тебе сотрудника оттуда.
            </p>
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 bg-[#1863e5] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1550c0] transition-colors text-sm"
            >
              Смотреть компании →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                {/* PENDING */}
                {req.status === "PENDING" && (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🔍</span>
                      <p className="text-base font-bold text-[#171923]">{req.companyName}</p>
                    </div>
                    <p className="text-sm text-[#718096]">Статус: Ищем реферера...</p>
                    <p className="text-xs text-[#A0AEC0] mt-1">Отправлено: {timeAgo(req.createdAt)}</p>
                  </>
                )}

                {/* REFERRER_FOUND */}
                {req.status === "REFERRER_FOUND" && (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">✅</span>
                      <p className="text-base font-bold text-[#171923]">{req.companyName}</p>
                    </div>
                    <p className="text-sm font-semibold text-green-600 mb-3">Реферер найден!</p>
                    <p className="text-sm text-[#718096] mb-4">
                      Чтобы получить его контакт в Telegram:
                    </p>
                    <button
                      onClick={() => handlePay(req.id)}
                      disabled={payingId === req.id}
                      className="w-full bg-[#1863e5] text-white font-semibold py-3 rounded-xl hover:bg-[#1550c0] transition-colors disabled:opacity-60"
                    >
                      {payingId === req.id ? "Обрабатываем..." : "Оплатить 500 ₽"}
                    </button>
                    <p className="text-xs text-[#A0AEC0] mt-2 text-center">
                      После оплаты ты получишь ник реферера и сможешь написать напрямую.
                    </p>
                  </>
                )}

                {/* PAID */}
                {req.status === "PAID" && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🎉</span>
                        <p className="text-base font-bold text-[#171923]">{req.companyName}</p>
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        Оплачено
                      </span>
                    </div>
                    <p className="text-sm text-[#171923] mb-1">Твой реферер:</p>
                    <p className="text-sm font-semibold text-[#171923] mb-3">
                      {req.referrerName ?? "Имя не указано"}
                      {req.referrerUsername && <span className="text-[#718096] font-normal"> · @{req.referrerUsername}</span>}
                    </p>
                    {req.referrerUsername ? (
                      <a
                        href={`https://t.me/${req.referrerUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-[#1863e5] text-white font-semibold py-3 rounded-xl hover:bg-[#1550c0] transition-colors text-center text-sm"
                      >
                        Написать в Telegram
                      </a>
                    ) : (
                      <p className="text-sm text-[#718096]">
                        Напиши нам в{" "}
                        <a
                          href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1863e5] hover:underline"
                        >
                          Telegram
                        </a>
                        {" "}и мы соединим вас.
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
