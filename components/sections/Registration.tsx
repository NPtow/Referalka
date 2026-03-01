"use client";
import { useEffect, useRef } from "react";

interface Props {
  onAuth: (user: { id: number; firstName: string; profile: unknown | null }) => void;
}

export default function Registration(_props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "referalkaaaa_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-auth-url", `${window.location.origin}/api/auth/telegram/callback`);
    script.setAttribute("data-request-access", "write");
    script.async = true;

    containerRef.current.appendChild(script);
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
          <div className="flex justify-center" ref={containerRef} />
          <p className="text-xs text-[#A0AEC0] mt-4">
            Мы не храним лишнего. Только имя и username из Telegram
          </p>
        </div>
      </div>
    </section>
  );
}
