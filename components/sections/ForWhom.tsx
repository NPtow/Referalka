export default function ForWhom() {
  return (
    <section className="py-20 px-4 bg-[#F7FAFC]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Для кого Рефералочка
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Кандидаты */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl mb-5">🧑‍💻</div>
            <h3 className="text-xl font-bold text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Кандидаты
            </h3>
            <p className="text-[#718096] text-sm leading-relaxed mb-4">
              IT-специалисты, которые хотят попасть в Яндекс, Тинькофф, Озон, Авито и другие топовые компании РФ. Реферал — твой шорткат к рекрутеру.
            </p>
            <ul className="space-y-2 text-sm text-[#4A5568]">
              {["Приоритетное рассмотрение резюме", "Прямой выход на рекрутера", "Первый реферал бесплатно"].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-[#1863e5]">✓</span> {i}
                </li>
              ))}
            </ul>
          </div>
          {/* Рефереры */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl mb-5">🏢</div>
            <h3 className="text-xl font-bold text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Рефереры
            </h3>
            <p className="text-[#718096] text-sm leading-relaxed mb-4">
              Сотрудники компаний, которые хотят помочь крутым ребятам и заработать реферальный бонус от работодателя.
            </p>
            <ul className="space-y-2 text-sm text-[#4A5568]">
              {["Зарабатывай реферальный бонус", "Помогай талантливым ребятам", "Бесплатный доступ к платформе"].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-purple-500">✓</span> {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
