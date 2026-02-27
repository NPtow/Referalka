import { COMPANIES } from "@/lib/constants";
import Button from "@/components/ui/Button";

interface Props {
  selected: string[];
  onChange: (companies: string[]) => void;
  onNext: () => void;
}

export default function Step1Companies({ selected, onChange, onNext }: Props) {
  const toggle = (c: string) => {
    onChange(selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c]);
  };

  return (
    <div>
      <h3 className="text-xl font-black text-[#171923] mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        В какие компании хочешь попасть?
      </h3>
      <p className="text-sm text-[#718096] mb-5">Выбери одну или несколько</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {COMPANIES.map((c) => (
          <button
            key={c}
            onClick={() => toggle(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selected.includes(c)
                ? "bg-[#1863e5] text-white border-[#1863e5]"
                : "bg-white text-[#4A5568] border-gray-200 hover:border-[#1863e5]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <Button className="w-full" disabled={selected.length === 0} onClick={onNext}>
        Далее →
      </Button>
    </div>
  );
}
