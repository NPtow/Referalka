const REVIEWS = [
  {
    name: "Артем, Backend Engineer",
    rating: 5,
    text: "После реферала получил интервью через 3 дня. Флоу простой и без лишних шагов.",
  },
  {
    name: "Полина, Product Designer",
    rating: 5,
    text: "Оформила профиль за 10 минут, и меня быстро связали с сотрудником компании.",
  },
  {
    name: "Михаил, iOS Developer",
    rating: 5,
    text: "Понравилось, что все в одном месте: профиль, резюме и отправка заявки.",
  },
  {
    name: "София, Data Analyst",
    rating: 5,
    text: "Прозрачный процесс и приятный интерфейс. Получила релевантный контакт без шума.",
  },
  {
    name: "Илья, Frontend Engineer",
    rating: 5,
    text: "Заполнил анкету один раз и сразу отправил заявку. Очень удобно.",
  },
  {
    name: "Ксения, QA Engineer",
    rating: 5,
    text: "Хорошо структурированные поля профиля и понятные статусы. Все по делу.",
  },
];

function stars(value: number): string {
  return "★".repeat(value);
}

export default function Testimonials() {
  const cards = [...REVIEWS, ...REVIEWS];

  return (
    <section className="py-20 px-4 bg-[#F7FAFC] border-t border-b border-gray-100 overflow-hidden">
      <div className="max-w-5xl mx-auto mb-10 text-center">
        <h2
          className="text-3xl md:text-4xl font-black text-[#171923] mb-3"
          style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
          Кому Мы Уже Помогли
        </h2>
        <p className="text-[#4A5568]">Отзывы кандидатов, которые уже прошли путь через Рефералку</p>
      </div>

      <div className="flex gap-4 animate-marquee-slow whitespace-nowrap">
        {cards.map((review, i) => (
          <article
            key={`${review.name}-${i}`}
            className="w-[320px] shrink-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm whitespace-normal"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-sm font-bold text-[#171923]">{review.name}</p>
              <p className="text-xs font-bold text-amber-500">
                {stars(review.rating)} <span className="text-[#4A5568]">{review.rating}.0</span>
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[#4A5568]">{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
