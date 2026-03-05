"use client";
import { useState } from "react";

interface Props {
  className?: string;
}

export default function TelegramLoginButton({ className }: Props) {
  const [botUrl, setBotUrl] = useState<string | null>(null);
  const [botDeepLink, setBotDeepLink] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoadingStart(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/telegram/bot/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.botUrl) {
        setError(data.error ?? "Не удалось запустить вход через бота.");
        return;
      }
      setBotUrl(data.botUrl);
      setBotDeepLink(data.botDeepLink ?? null);
      const openUrl = data.botDeepLink ?? data.botUrl;
      window.location.href = openUrl;
    } catch {
      setError("Ошибка сети. Попробуй ещё раз.");
    } finally {
      setLoadingStart(false);
    }
  };

  const handleVerify = async () => {
    setLoadingVerify(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/telegram/bot/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось подтвердить код.");
        return;
      }
      window.location.href = data.redirect ?? "/dashboard";
    } catch {
      setError("Ошибка сети. Попробуй ещё раз.");
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <div className={className}>
      {!botUrl ? (
        <button
          type="button"
          onClick={handleStart}
          disabled={loadingStart}
          className="inline-flex items-center justify-center rounded-xl bg-[#1863e5] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1550c0] disabled:opacity-50"
        >
          {loadingStart ? "Открываю бота..." : "Получить код в Telegram"}
        </button>
      ) : (
        <div className="w-full max-w-sm space-y-3">
          <a
            href={botDeepLink ?? botUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-center text-sm font-medium text-[#1863e5] hover:underline"
          >
            Открыть Telegram
          </a>
          <a
            href={botUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-center text-xs text-[#718096] hover:underline"
          >
            Если не открылось, открыть через браузер
          </a>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Введите 6-значный код"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#171923] outline-none focus:border-[#1863e5]"
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={loadingVerify || code.length !== 6}
            className="w-full rounded-xl bg-[#171923] px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
          >
            {loadingVerify ? "Проверяю..." : "Войти"}
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
