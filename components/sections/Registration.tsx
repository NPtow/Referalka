"use client";
import { useEffect, useRef } from "react";

// Props kept for API compatibility but onAuth is now handled via redirect+cookie in page.tsx
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Props {
  onAuth: (user: { id: number; firstName: string; profile: unknown | null }) => void;
}

export default function Registration(_props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ?? "referalocka_bot";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-auth-url", `${window.location.origin}/api/auth/telegram/callback`);
    script.setAttribute("data-request-access", "write");
    script.async = true;

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botName]);

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
