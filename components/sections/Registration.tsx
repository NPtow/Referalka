"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  onAuth: (user: { id: number; firstName: string; profile: unknown | null }) => void;
}

type Status = "idle" | "waiting" | "done";

export default function Registration({ onAuth }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const statusRef = useRef<Status>("idle");
  const tokenRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAuthRef = useRef(onAuth);
  onAuthRef.current = onAuth;

  const updateStatus = (s: Status) => {
    statusRef.current = s;
    setStatus(s);
  };

  // Cleanup polling and timeout on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleLogin() {
    // Always fetch a fresh token — pre-fetched tokens expire in 5 min and become stale
    const data = await fetch("/api/auth/telegram/init").then((r) => r.json());
    const token = data.token as string;
    tokenRef.current = token;

    // Open bot link
    window.open(`https://t.me/referalkaaaa_bot?start=login_${token}`, "_blank");
    updateStatus("waiting");

    // Start polling
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/telegram/check?token=${token}`);
        const data = await res.json();
        if (data.ready && data.user) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          updateStatus("done");
          onAuthRef.current({
            id: data.user.id,
            firstName: data.user.firstName,
            profile: data.user.profile ?? null,
          });
        }
      } catch {
        // ignore network errors during polling
      }
    }, 2000);

    // Stop polling after 5 minutes — cancel previous timeout to avoid conflicts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (statusRef.current === "waiting") updateStatus("idle");
      }
      timeoutRef.current = null;
    }, 5 * 60 * 1000);
  }

  return (
    <section id="registration" className="py-20 px-4 bg-[#F7FAFC]">
      <div className="max-w-md mx-auto text-center">
        <h2
          className="text-3xl md:text-4xl font-black text-[#171923] mb-4"
          style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
          Начни прямо сейчас
        </h2>
        <p className="text-[#718096] mb-10">
          Зарегистрируйся через Telegram и найди реферера в компанию мечты
        </p>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          {status === "idle" && (
            <button
              onClick={handleLogin}
              className="flex items-center gap-3 mx-auto px-6 py-3 bg-[#229ED9] hover:bg-[#1a8bbf] text-white font-semibold rounded-xl transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
              </svg>
              Войти через Telegram
            </button>
          )}

          {status === "waiting" && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-[#718096] mb-3">
                <span className="animate-spin text-xl">⏳</span>
                <span className="font-medium">Ожидаем подтверждения в Telegram…</span>
              </div>
              <p className="text-sm text-[#A0AEC0]">
                Нажми <strong>Start</strong> в боте @referalkaaaa_bot
              </p>
              <button
                onClick={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
                  updateStatus("idle");
                  tokenRef.current = null;
                }}
                className="mt-4 text-xs text-[#A0AEC0] underline"
              >
                Отменить
              </button>
            </div>
          )}

          {status === "done" && (
            <div className="text-green-600 font-semibold">✅ Вход выполнен!</div>
          )}

          <p className="text-xs text-[#A0AEC0] mt-4">
            Мы не храним лишнего. Только имя и username из Telegram
          </p>
        </div>
      </div>
    </section>
  );
}
