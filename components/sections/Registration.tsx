"use client";
import TelegramLoginButton from "@/components/TelegramLoginButton";

export default function Registration() {
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
          <div className="flex justify-center min-h-[48px]">
            <TelegramLoginButton />
          </div>
          <p className="text-xs text-[#A0AEC0] mt-4">
            Мы не храним лишнего. Только имя и username из Telegram
          </p>
        </div>
      </div>
    </section>
  );
}
