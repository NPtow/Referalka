"use client";
import { useEffect, useRef } from "react";

interface Props {
  onAuth: (user: { id: number; firstName: string; profile: unknown | null }) => void;
}

declare global {
  interface Window {
    onTelegramAuth: (user: Record<string, unknown>) => void;
  }
}

export default function Registration({ onAuth }: Props) {
  const onAuthRef = useRef(onAuth);
  onAuthRef.current = onAuth;

  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      try {
        const res = await fetch("/api/auth/telegram/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        const data = await res.json();
        if (data.user) {
          onAuthRef.current({
            id: data.user.id,
            firstName: data.user.firstName,
            profile: data.user.profile ?? null,
          });
        }
      } catch {
        // network error — ignore
      }
    };

    const container = document.getElementById("telegram-login-container");
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "referalkaaaa_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

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
          <div id="telegram-login-container" className="flex justify-center min-h-[48px]" />
          <p className="text-xs text-[#A0AEC0] mt-4">
            Мы не храним лишнего. Только имя и username из Telegram
          </p>
        </div>
      </div>
    </section>
  );
}
