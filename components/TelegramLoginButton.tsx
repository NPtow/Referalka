"use client";
import { useState } from "react";

interface Props {
  className?: string;
}

export default function TelegramLoginButton({ className }: Props) {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleStart = async () => {
    setLoadingStart(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/email/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось отправить код.");
        return;
      }
      setCodeSent(true);
      setInfo("Код отправлен на почту. Проверь входящие и спам.");
    } catch {
      setError("Ошибка сети. Попробуй ещё раз.");
    } finally {
      setLoadingStart(false);
    }
  };

  const handleVerify = async () => {
    setLoadingVerify(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
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
      <div className="w-full max-w-sm space-y-3">
        <input
          type="email"
          autoComplete="email"
          placeholder="Введите email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#171923] outline-none focus:border-[#1863e5]"
        />
        <button
          type="button"
          onClick={handleStart}
          disabled={loadingStart || !email.trim()}
          className="w-full rounded-xl bg-[#1863e5] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1550c0] disabled:opacity-50"
        >
          {loadingStart ? "Отправляю код..." : "Получить код на почту"}
        </button>

        {codeSent && (
          <>
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
          </>
        )}
      </div>
      {info && <p className="mt-3 text-center text-sm text-green-700">{info}</p>}
      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
