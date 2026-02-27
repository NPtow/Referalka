"use client";
import Button from "@/components/ui/Button";

export default function Hero() {
  const scrollToReg = () => {
    document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-[90vh] bg-[#0C0129] flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center relative overflow-hidden">
      {/* bg glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1863e5] opacity-10 rounded-full blur-3xl pointer-events-none" />

      {/* badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        500+ рефералов выдано
      </div>

      <h1 className="text-4xl md:text-6xl font-black text-white max-w-3xl leading-tight mb-5" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        Реферал в топовую IT-компанию{" "}
        <span className="bg-gradient-to-r from-[#7CABFD] to-[#a78bfa] bg-clip-text text-transparent">
          от реального сотрудника
        </span>
      </h1>

      <p className="text-lg text-white/60 max-w-xl mb-8 leading-relaxed">
        Кандидаты с рефералом на 40% чаще получают приглашение на интервью. Мы соединяем тебя с сотрудниками Яндекса, Тинькофф, Озона и ещё 50+ компаний.
      </p>

      <Button size="lg" onClick={scrollToReg} className="shadow-lg shadow-blue-900/40">
        Получить реферал →
      </Button>

      {/* social proof */}
      <div className="flex flex-wrap justify-center gap-8 mt-14 text-center">
        {[
          { val: "500+", label: "рефералов выдано" },
          { val: "50+", label: "компаний в сети" },
          { val: "300+", label: "кандидатов" },
        ].map(({ val, label }) => (
          <div key={label}>
            <div className="text-2xl font-black text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{val}</div>
            <div className="text-xs text-white/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* notification previews */}
      <div className="flex flex-col sm:flex-row gap-3 mt-10 text-left">
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 backdrop-blur-sm">
          🎉 Тебя зареферили в <strong className="text-white">Яндекс</strong>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 backdrop-blur-sm">
          👀 Сотрудник <strong className="text-white">Тинькофф</strong> хочет тебя зареферить
        </div>
      </div>
    </section>
  );
}
