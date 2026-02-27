import Badge from "./Badge";

interface Props {
  role: string;
  stack: string[];
  experience: number;
  companies: string[];
  blurred?: boolean;
  firstName?: string;
}

export default function CandidateCard({ role, stack, experience, companies, blurred, firstName }: Props) {
  return (
    <div className="relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className={blurred ? "blur-sm select-none pointer-events-none" : ""}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {firstName ? firstName[0] : "?"}
          </div>
          <div>
            <div className="font-semibold text-[#171923] text-sm">{firstName ?? "Кандидат"}</div>
            <div className="text-xs text-[#718096]">{role}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {stack.map((s) => (
            <span key={s} className="px-2 py-0.5 bg-[#F7FAFC] text-[#4A5568] text-xs rounded-md border border-gray-100">
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-[#718096]">
          <span>{experience} {experience === 1 ? "год" : experience < 5 ? "года" : "лет"} опыта</span>
          <div className="flex gap-1">
            {companies.slice(0, 2).map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>
        </div>
      </div>
      {blurred && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl">
          <svg className="w-5 h-5 text-[#718096] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs text-[#718096] font-medium">Только для зарегистрированных</span>
        </div>
      )}
    </div>
  );
}
