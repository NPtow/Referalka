"use client";
import TelegramLoginButton from "@/components/TelegramLoginButton";

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
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
        <div className="flex justify-center">
          <TelegramLoginButton />
        </div>
        <p className="text-xs text-[#A0AEC0] mt-4 text-center">
          Мы не храним лишнего. Только имя и username из Telegram
        </p>
      </div>
    </div>
  );
}
