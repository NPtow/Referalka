import Button from "@/components/ui/Button";
import { OnboardingData } from "./OnboardingModal";

interface Props {
  firstName: string;
  data: OnboardingData;
  profileId: string | null;
  onClose: () => void;
}

export default function Step4Card({ firstName, data, profileId, onClose }: Props) {
  const profileUrl = profileId ? `${typeof window !== "undefined" ? window.location.origin : ""}/profile/${profileId}` : null;

  return (
    <div className="text-center">
      <div className="text-4xl mb-3">🎉</div>
      <h3 className="text-xl font-black text-[#171923] mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        Карточка создана, {firstName}!
      </h3>
      <p className="text-sm text-[#718096] mb-6">
        Ищем реферера в выбранных компаниях — мы уведомим тебя как только найдём
      </p>

      {/* превью карточки */}
      <div className="bg-[#F7FAFC] rounded-2xl p-5 text-left mb-5 border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
            {firstName[0]}
          </div>
          <div>
            <div className="font-semibold text-[#171923] text-sm">{firstName}</div>
            <div className="text-xs text-[#718096]">{data.role}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {data.companies.slice(0, 3).map((c) => (
            <span key={c} className="px-2 py-0.5 bg-blue-50 text-[#1863e5] text-xs rounded-full border border-blue-100">{c}</span>
          ))}
          {data.companies.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-[#718096] text-xs rounded-full">+{data.companies.length - 3}</span>
          )}
        </div>
        <div className="text-xs text-[#718096]">
          {data.experience} {data.experience === 1 ? "год" : data.experience < 5 ? "года" : "лет"} опыта
        </div>
      </div>

      {profileUrl && (
        <div className="mb-4">
          <p className="text-xs text-[#718096] mb-2">Ссылка на твою карточку:</p>
          <div className="bg-[#F7FAFC] rounded-xl px-4 py-2 text-xs text-[#4A5568] font-mono break-all border border-gray-100">
            {profileUrl}
          </div>
        </div>
      )}

      <Button className="w-full" onClick={onClose}>
        Отлично, жду реферала!
      </Button>
    </div>
  );
}
