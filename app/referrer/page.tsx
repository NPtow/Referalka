"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, StoredUser } from "@/lib/auth";
import { COMPANIES_META } from "@/lib/constants";

export default function ReferrerPage() {
  const router = useRouter();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [company, setCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  const handleLogin = async () => {
    const res = await fetch("/api/auth/telegram/url");
    const { url } = await res.json();
    window.location.href = url;
  };

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
              <div className="flex justify-center">
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2.5 px-6 py-3 bg-[#229ED9] hover:bg-[#1a8bc4] text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 13.432l-2.939-.917c-.638-.203-.651-.638.136-.944l11.47-4.42c.53-.194.994.13.967.07z"/>
                  </svg>
                  Войти через Telegram
                </button>
              </div>
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
