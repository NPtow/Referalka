"use client";

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/telegram/url");
      const data = await res.json();
      if (!data.url) throw new Error(data.error || "No URL returned");
      window.location.href = data.url;
    } catch (e) {
      alert("Ошибка авторизации: " + (e as Error).message);
    }
  };

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
          <button
            onClick={handleLogin}
            className="flex items-center gap-2.5 px-6 py-3 bg-[#229ED9] hover:bg-[#1a8bc4] text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 13.432l-2.939-.917c-.638-.203-.651-.638.136-.944l11.47-4.42c.53-.194.994.13.967.07z"/>
            </svg>
            Войти через Telegram
          </button>
        </div>
        <p className="text-xs text-[#A0AEC0] mt-4 text-center">
          Мы не храним лишнего. Только имя и username из Telegram
        </p>
      </div>
    </div>
  );
}
