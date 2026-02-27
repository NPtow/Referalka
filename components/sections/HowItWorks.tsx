const steps = [
  {
    num: "01",
    title: "Регистрируйся через Telegram",
    desc: "Один клик — никаких паролей. Мы берём только имя и username.",
  },
  {
    num: "02",
    title: "Заполни анкету",
    desc: "Прикрепи резюме с HH или PDF, LinkedIn, GitHub. Это нужно реферерам чтобы тебя оценить.",
  },
  {
    num: "03",
    title: "Получи первый реферал бесплатно",
    desc: "Мы создаём твою карточку и ищем подходящего реферера. Первый — бесплатно.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Как это работает
          </h2>
          <p className="text-[#718096]">Три шага до реферала в компанию мечты</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="relative">
              <div className="text-5xl font-black text-[#EDF2F7] mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{s.num}</div>
              <h3 className="text-lg font-bold text-[#171923] mb-2">{s.title}</h3>
              <p className="text-sm text-[#718096] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
