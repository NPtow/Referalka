"use client";
import Button from "@/components/ui/Button";

const plans = [
  {
    name: "Бесплатно",
    price: "0 ₽",
    period: "",
    desc: "Попробуй как работает",
    features: ["1 реферал", "Базовая карточка", "Попадаешь в ленту", "1 раз в неделю"],
    cta: "Начать бесплатно",
    highlight: false,
  },
  {
    name: "Стандарт",
    price: "500 ₽",
    period: "/мес",
    desc: "Для активного поиска",
    features: ["3 рефералки", "Приоритет в ленте", "Обновление карточки", "Поддержка в чате"],
    cta: "Выбрать Стандарт",
    highlight: true,
  },
  {
    name: "Про",
    price: "1 500 ₽",
    period: "/мес",
    desc: "Максимум шансов",
    features: ["Безлимит рефералок", "Карточка наверху ленты", "Прямой контакт с реферером", "Приоритетная поддержка"],
    cta: "Выбрать Про",
    highlight: false,
  },
];

export default function Pricing() {
  const scrollToReg = () => {
    document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Твоя карьера стоит инвестиций
          </h2>
          <p className="text-[#718096]">Первый реферал всегда бесплатно</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-6 border flex flex-col ${
                p.highlight
                  ? "border-[#1863e5] bg-[#1863e5] text-white shadow-xl shadow-blue-200"
                  : "border-gray-100 bg-[#F7FAFC]"
              }`}
            >
              <div className="mb-4">
                <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${p.highlight ? "text-blue-200" : "text-[#718096]"}`}>
                  {p.name}
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{p.price}</span>
                  <span className={`text-sm mb-1 ${p.highlight ? "text-blue-200" : "text-[#718096]"}`}>{p.period}</span>
                </div>
                <div className={`text-sm mt-1 ${p.highlight ? "text-blue-100" : "text-[#718096]"}`}>{p.desc}</div>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${p.highlight ? "text-blue-100" : "text-[#4A5568]"}`}>
                    <span className={p.highlight ? "text-white" : "text-[#1863e5]"}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={p.highlight ? "outline" : "primary"}
                className={p.highlight ? "border-white text-white hover:bg-white/10 w-full" : "w-full"}
                onClick={scrollToReg}
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
