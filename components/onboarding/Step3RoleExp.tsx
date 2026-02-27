import { ROLES } from "@/lib/constants";
import Button from "@/components/ui/Button";

interface Props {
  role: string;
  experience: number;
  onChange: (updates: { role?: string; experience?: number }) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function Step3RoleExp({ role, experience, onChange, onSubmit, onBack }: Props) {
  return (
    <div>
      <h3 className="text-xl font-black text-[#171923] mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        Твоя роль и опыт
      </h3>
      <p className="text-sm text-[#718096] mb-5">Это поможет рефереру понять кто ты</p>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-[#4A5568] mb-1">Роль <span className="text-[#1863e5]">*</span></label>
        <select
          value={role}
          onChange={(e) => onChange({ role: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1863e5] transition-colors bg-white"
        >
          <option value="">Выбери роль...</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#4A5568] mb-3">
          Опыт: <span className="text-[#1863e5] font-bold">{experience} {experience === 1 ? "год" : experience < 5 ? "года" : "лет"}</span>
        </label>
        <input
          type="range"
          min={0}
          max={15}
          value={experience}
          onChange={(e) => onChange({ experience: Number(e.target.value) })}
          className="w-full accent-[#1863e5]"
        />
        <div className="flex justify-between text-xs text-[#A0AEC0] mt-1">
          <span>0</span><span>5</span><span>10</span><span>15+</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">← Назад</Button>
        <Button className="flex-1" disabled={!role} onClick={onSubmit}>Создать карточку 🎉</Button>
      </div>
    </div>
  );
}
