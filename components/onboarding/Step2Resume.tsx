import Button from "@/components/ui/Button";
import { OnboardingData } from "./OnboardingModal";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const fields = [
  { key: "resumeUrl", label: "Резюме (HH или PDF)", placeholder: "https://hh.ru/resume/...", required: true },
  { key: "linkedinUrl", label: "LinkedIn", placeholder: "https://linkedin.com/in/...", required: false },
  { key: "githubUrl", label: "GitHub", placeholder: "https://github.com/...", required: false },
  { key: "siteUrl", label: "Личный сайт", placeholder: "https://...", required: false },
] as const;

export default function Step2Resume({ data, onChange, onNext, onBack }: Props) {
  const canNext = data.resumeUrl.trim().length > 0;

  return (
    <div>
      <h3 className="text-xl font-black text-[#171923] mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        Расскажи о себе
      </h3>
      <p className="text-sm text-[#718096] mb-5">Резюме обязательно, остальное — по желанию</p>
      <div className="space-y-3 mb-6">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-[#4A5568] mb-1">
              {f.label} {f.required && <span className="text-[#1863e5]">*</span>}
            </label>
            <input
              type="url"
              placeholder={f.placeholder}
              value={data[f.key]}
              onChange={(e) => onChange({ [f.key]: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1863e5] transition-colors placeholder:text-gray-300"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">← Назад</Button>
        <Button className="flex-1" disabled={!canNext} onClick={onNext}>Далее →</Button>
      </div>
    </div>
  );
}
