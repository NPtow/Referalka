"use client";
import Button from "@/components/ui/Button";

const plans = [
  {
    name: "Разовый реферал",
    price: "от 490 ₽",
    period: "за реферал",
    desc: "Платишь только за результат",
    features: [
      "Цена зависит от позиции",
      "Junior — от 490 ₽",
      "Middle — от 990 ₽",
      "Senior / Lead — от 1 990 ₽",
      "Реферал в конкретную компанию",
    ],
    cta: "Получить реферал",
    highlight: false,
    badge: null,
  },
  {
    name: "Подписка",
    price: "1 900 ₽",
    period: "/мес",
    desc: "Проактивный поиск рефералов за тебя",
    features: [
      "1 резюме в месяц в ленте",
      "Мы сами ищем реферера",
      "Приоритет в ленте рефереров",
      "Уведомление как только найдём",
      "Можно обновить компании",
    ],
    cta: "Попробовать подписку",
    highlight: true,
    badge: "Популярно",
  },
];

export default function Pricing() {
  const scrollToReg = () => {
    document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 px-4 bg-[#F7FAFC]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-black text-[#171923] mb-3"
            style={{ fontFamily: "'Inter Tight', sans-serif" }}
          >
            Твоя карьера стоит инвестиций
          </h2>

        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-7 border flex flex-col relative ${
                p.highlight
                  ? "border-[#1863e5] bg-[#1863e5] text-white shadow-xl shadow-blue-200"
                  : "border-gray-200 bg-white"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3 left-6 bg-white text-[#1863e5] text-xs font-bold px-3 py-1 rounded-full border border-[#1863e5]">
                  {p.badge}
                </div>
              )}
              <div className="mb-5">
                <div
                  className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                    p.highlight ? "text-blue-200" : "text-[#718096]"
                  }`}
                >
                  {p.name}
                </div>
                <div className="flex items-end gap-1.5">
                  <span
                    className="text-3xl font-black"
                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                  >
                    {p.price}
                  </span>
                  <span
                    className={`text-sm mb-1 ${
                      p.highlight ? "text-blue-200" : "text-[#718096]"
                    }`}
                  >
                    {p.period}
                  </span>
                </div>
                <div
                  className={`text-sm mt-1.5 ${
                    p.highlight ? "text-blue-100" : "text-[#718096]"
                  }`}
                >
                  {p.desc}
                </div>
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-sm ${
                      p.highlight ? "text-blue-100" : "text-[#4A5568]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 shrink-0 ${
                        p.highlight ? "text-white" : "text-[#1863e5]"
                      }`}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={p.highlight ? "outline" : "primary"}
                className={
                  p.highlight
                    ? "border-white text-white hover:bg-white/10 w-full"
                    : "w-full"
                }
                onClick={scrollToReg}
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Проактивный поиск тезис */}
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl px-6 py-5 flex items-start gap-4">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-[#1863e5]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <div>
            <div className="font-semibold text-[#171923] text-sm mb-1">
              Мы сами ищем реферера для тебя
            </div>
            <div className="text-sm text-[#718096] leading-relaxed">
              Не нужно ждать — с подпиской мы проактивно находим подходящего сотрудника компании и предлагаем ему твою анкету. Ты получаешь уведомление, как только реферер найден.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
