"use client";
import { useEffect, useRef } from "react";
import { TelegramUser } from "@/lib/telegram";
import { saveUser } from "@/lib/auth";

interface AuthedUser {
  id: number;
  firstName: string;
  profile: unknown | null;
}

interface Props {
  onAuth: (user: AuthedUser) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    onTelegramAuthModal: (user: TelegramUser) => void;
  }
}

export default function AuthModal({ onAuth, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ?? "referalocka_bot";

  useEffect(() => {
    window.onTelegramAuthModal = async (tgUser: TelegramUser) => {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tgUser),
      });
      const json = await res.json();
      if (json.user) {
        const user = { id: json.user.id, firstName: json.user.firstName, profile: json.user.profile ?? null };
        saveUser(user);
        onAuth(user);
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuthModal(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }
  }, [botName, onAuth]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A0AEC0] hover:text-[#718096] text-xl leading-none"
        >
          ×
        </button>
        <h2 className="text-xl font-black text-[#171923] mb-2 text-center" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
          Войди через Telegram
        </h2>
        <p className="text-sm text-[#718096] mb-6 text-center">
          Чтобы запросить реферал, нужно зарегистрироваться
        </p>
        <div className="flex justify-center" ref={containerRef} />
        <p className="text-xs text-[#A0AEC0] mt-4 text-center">
          Мы не храним лишнего. Только имя и username из Telegram
        </p>
      </div>
    </div>
  );
}
