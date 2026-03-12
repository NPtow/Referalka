"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COMPANIES_META } from "@/lib/constants";
import { authClient } from "@/lib/auth-client";

export default function ReferrerPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);

  const [company, setCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const displayName =
    session?.user.name?.trim() || session?.user.email?.split("@")[0] || "Пользователь";

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    await fetch("/api/referrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, linkedinUrl }),
    });
    setSaving(false);
    setDone(true);
    setTimeout(() => router.push("/profile"), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />

      <div className="max-w-lg mx-auto px-4 py-12">
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

          {!isSignedIn ? (
            <div>
              <p className="text-sm text-[#4A5568] mb-4 text-center">Войди по email, чтобы продолжить</p>
              <div className="flex justify-center gap-2">
                <Link
                  href="/sign-in"
                  className="rounded-xl bg-[#1863e5] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1550c0] transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#171923] hover:bg-gray-50 transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            </div>
          ) : done ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-bold text-[#171923] text-lg">Готово, {displayName}!</p>
              <p className="text-sm text-[#718096] mt-1">Переходим в профиль...</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {displayName[0]?.toUpperCase() || "U"}
                </div>
                <p className="text-sm font-medium text-[#171923]">{displayName}</p>
              </div>

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
                {saving ? "Сохраняю..." : "Сохранить и перейти в профиль →"}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#A0AEC0] mt-4">
          Ищешь реферал сам?{" "}
          <Link href="/profile" className="text-[#1863e5] hover:underline">Перейти в профиль</Link>
        </p>
      </div>
    </div>
  );
}
