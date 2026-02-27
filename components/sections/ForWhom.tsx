export default function ForWhom() {
  return (
    <section className="py-20 px-4 bg-[#F7FAFC]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-black text-[#171923] mb-3"
            style={{ fontFamily: "'Inter Tight', sans-serif" }}
          >
            Для кого Рефералка
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Кандидаты */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-5 text-[#1863e5]">
              {/* Lucide: User */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3
              className="text-xl font-bold text-[#171923] mb-3"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              Кандидаты
            </h3>
            <p className="text-[#718096] text-sm leading-relaxed mb-5">
              IT-специалисты, которые хотят попасть в Яндекс, Тинькофф, Озон, Авито и другие топовые компании РФ. Реферал — твой шорткат к рекрутеру.
            </p>
            <ul className="space-y-3 text-sm text-[#4A5568]">
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                  ),
                  text: "Приоритетное рассмотрение резюме",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  ),
                  text: "Прямой выход на рекрутера",
                },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span className="text-[#1863e5] shrink-0">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Рефереры */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-5 text-violet-500">
              {/* Lucide: Building2 */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
              </svg>
            </div>
            <h3
              className="text-xl font-bold text-[#171923] mb-3"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              Рефереры
            </h3>
            <p className="text-[#718096] text-sm leading-relaxed mb-5">
              Сотрудники компаний, которые хотят помочь крутым ребятам попасть в команду и заработать реферальный бонус от работодателя.
            </p>
            <ul className="space-y-3 text-sm text-[#4A5568]">
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  ),
                  text: "Зарабатывай реферальный бонус",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  ),
                  text: "Помогай талантливым специалистам",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  ),
                  text: "Бесплатный доступ к платформе",
                },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span className="text-violet-500 shrink-0">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
