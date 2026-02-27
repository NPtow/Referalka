"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, saveUser, StoredUser } from "@/lib/auth";
import { COMPANIES_META } from "@/lib/constants";
import { TelegramUser } from "@/lib/telegram";

declare global {
  interface Window {
    onTelegramAuthReferrer: (user: TelegramUser) => void;
  }
}

export default function ReferrerPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ?? "referalocka_bot";

  const [user, setUser] = useState<StoredUser | null>(null);
  const [company, setCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  const loadWidget = useCallback(() => {
    if (!containerRef.current) return;
    window.onTelegramAuthReferrer = async (tgUser: TelegramUser) => {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tgUser),
      });
      const json = await res.json();
      if (json.user) {
        const u = { id: json.user.id, firstName: json.user.firstName, profile: json.user.profile ?? null };
        saveUser(u);
        setUser(u);
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuthReferrer(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);
  }, [botName]);

  useEffect(() => {
    if (!user) loadWidget();
  }, [user, loadWidget]);

  const handleSave = async () => {
    if (!user || !company) return;
    setSaving(true);
    await fetch("/api/referrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, company, linkedinUrl }),
    });
    setSaving(false);
    setDone(true);
    setTimeout(() => router.push("/marketplace"), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />

      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-[#A0AEC0] mb-6">
          <Link href="/" className="hover:text-[#1863e5] transition-colors">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-[#718096]">Стать реферером</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-2xl font-black text-[#171923] mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Стать реферером
          </h1>
          <p className="text-[#718096] text-sm mb-8">
            Зарегистрируйся, чтобы находить кандидатов в маркетплейсе и давать им реферал
          </p>

          {!user ? (
            <div>
              <p className="text-sm text-[#4A5568] mb-4 text-center">Войди через Telegram, чтобы продолжить</p>
              <div className="flex justify-center" ref={containerRef} />
              <p className="text-xs text-[#A0AEC0] mt-4 text-center">Мы не храним лишнего. Только имя и username из Telegram</p>
            </div>
          ) : done ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-bold text-[#171923] text-lg">Готово, {user.firstName}!</p>
              <p className="text-sm text-[#718096] mt-1">Переходим в маркетплейс...</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.firstName[0]}
                </div>
                <p className="text-sm font-medium text-[#171923]">{user.firstName}</p>
              </div>

              {/* Company select */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#4A5568] mb-1.5">
                  В какой компании ты работаешь? <span className="text-red-400">*</span>
                </label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] outline-none focus:border-[#1863e5] bg-white"
                >
                  <option value="">Выбери компанию</option>
                  {COMPANIES_META.map((c) => (
                    <option key={c.slug} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* LinkedIn */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#4A5568] mb-1.5">
                  LinkedIn <span className="text-[#A0AEC0] font-normal">(опционально)</span>
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!company || saving}
                className="w-full bg-[#1863e5] text-white font-semibold py-3 rounded-xl hover:bg-[#1550c0] transition-colors disabled:opacity-50"
              >
                {saving ? "Сохраняю..." : "Перейти в маркетплейс →"}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#A0AEC0] mt-4">
          Ищешь реферал сам?{" "}
          <Link href="/#registration" className="text-[#1863e5] hover:underline">Зарегистрируйся как кандидат</Link>
        </p>
      </div>
    </div>
  );
}
