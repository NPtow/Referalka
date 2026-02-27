"use client";

interface Vacancy {
  id: string;
  companySlug: string;
  title: string;
  level: string;
  type: string;
  tags: string[];
  salary?: string | null;
}

interface Props {
  vacancy: Vacancy;
  onRequest: (vacancy: Vacancy) => void;
}

const TYPE_LABELS: Record<string, string> = {
  remote: "Удалённо",
  office: "Офис",
  hybrid: "Гибрид",
};

const LEVEL_LABELS: Record<string, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead",
};

const LEVEL_COLORS: Record<string, string> = {
  junior: "bg-green-50 text-green-700",
  middle: "bg-blue-50 text-[#1863e5]",
  senior: "bg-purple-50 text-purple-700",
  lead: "bg-orange-50 text-orange-700",
};

export default function VacancyCard({ vacancy, onRequest }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#1863e5] hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#171923] text-base mb-2">{vacancy.title}</h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[vacancy.level] ?? "bg-gray-50 text-gray-600"}`}>
              {LEVEL_LABELS[vacancy.level] ?? vacancy.level}
            </span>
            <span className="bg-[#F7FAFC] text-[#718096] text-xs px-2 py-0.5 rounded-full">
              {TYPE_LABELS[vacancy.type] ?? vacancy.type}
            </span>
            {vacancy.tags.map((tag) => (
              <span key={tag} className="bg-[#F7FAFC] text-[#718096] text-xs px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          {vacancy.salary && (
            <p className="text-sm font-semibold text-[#171923]">{vacancy.salary}</p>
          )}
        </div>
        <button
          onClick={() => onRequest(vacancy)}
          className="flex-shrink-0 bg-[#1863e5] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1550c0] transition-colors whitespace-nowrap"
        >
          Запросить реферал
        </button>
      </div>
    </div>
  );
}
