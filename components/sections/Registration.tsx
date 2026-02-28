"use client";
import { useEffect, useRef } from "react";
import { TelegramUser } from "@/lib/telegram";

interface Props {
  onAuth: (user: { id: number; firstName: string; profile: unknown | null }) => void;
}

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
  }
}

export default function Registration({ onAuth }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onAuthRef = useRef(onAuth);
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ?? "referalocka_bot";

  // Keep ref up-to-date without triggering script recreation
  onAuthRef.current = onAuth;

  useEffect(() => {
    window.onTelegramAuth = async (tgUser: TelegramUser) => {
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tgUser),
        });
        const json = await res.json();
        if (json.user) {
          onAuthRef.current({ id: json.user.id, firstName: json.user.firstName, profile: json.user.profile ?? null });
        } else {
          console.error("Telegram auth failed:", json);
        }
      } catch (err) {
        console.error("Telegram auth error:", err);
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botName]); // only recreate script when botName changes

  return (
    <section id="registration" className="py-20 px-4 bg-[#F7FAFC]">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black text-[#171923] mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
          Начни прямо сейчас
        </h2>
        <p className="text-[#718096] mb-10">
          Зарегистрируйся через Telegram и найди реферера в компанию мечты
        </p>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="flex justify-center" ref={containerRef} />
          <p className="text-xs text-[#A0AEC0] mt-4">
            Мы не храним лишнего. Только имя и username из Telegram
          </p>
        </div>
      </div>
    </section>
  );
}
