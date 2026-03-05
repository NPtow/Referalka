"use client";

export default function Registration() {
  const handleLogin = async () => {
    const res = await fetch("/api/auth/telegram/url");
    const { url } = await res.json();
    window.location.href = url;
  };

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
          <p className="text-xs text-[#A0AEC0] mt-4">
            Мы не храним лишнего. Только имя и username из Telegram
          </p>
        </div>
      </div>
    </section>
  );
}
