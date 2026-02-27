"use client";
import CandidateCard from "@/components/ui/CandidateCard";
import Button from "@/components/ui/Button";
import { MOCK_CANDIDATES } from "@/lib/constants";

export default function CandidateFeed() {
  const scrollToReg = () => {
    document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 px-4 bg-[#F7FAFC]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Лента кандидатов
          </h2>
          <p className="text-[#718096]">Рефереры видят анкеты и выбирают кого зареферить</p>
        </div>

        {/* Декоративный поиск */}
        <div className="bg-[#F7FAFC] rounded-2xl p-4 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-gray-100 shadow-sm">
            <svg className="w-4 h-4 text-[#A0AEC0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm text-[#A0AEC0]">Поиск по роли или компании...</span>
            <span className="ml-auto px-2 py-0.5 text-xs bg-[#F7FAFC] text-[#718096] rounded border border-gray-100">Только для зарегистрированных</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {MOCK_CANDIDATES.map((c, i) => (
            <CandidateCard
              key={c.id}
              role={c.role}
              stack={c.stack}
              experience={c.experience}
              companies={c.companies}
              blurred={i >= 1}
              firstName={i === 0 ? "Алексей" : undefined}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Button size="lg" onClick={scrollToReg}>
            Зарегистрироваться и видеть кандидатов
          </Button>
        </div>
      </div>
    </section>
  );
}
