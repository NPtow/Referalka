"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CompanyMeta } from "@/lib/constants";

interface Props {
  company: CompanyMeta;
  vacancyCount?: number;
}

export default function CompanyCard({ company, vacancyCount }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/companies/${company.slug}`)}
      className="bg-white rounded-2xl border border-gray-200 p-5 text-left hover:border-[#1863e5] hover:shadow-md transition-all group w-full"
    >
      <div className="flex items-center gap-3 mb-3">
        {company.logoPath ? (
          <div className="w-10 h-10 rounded-xl bg-[#F7FAFC] flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image src={company.logoPath} alt={company.name} width={32} height={32} className="object-contain" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-[#EBF4FF] flex items-center justify-center flex-shrink-0 text-[#1863e5] font-bold text-sm">
            {company.name[0]}
          </div>
        )}
        <div>
          <div className="font-bold text-[#171923] text-sm leading-tight group-hover:text-[#1863e5] transition-colors">
            {company.name}
          </div>
          <div className="text-xs text-[#A0AEC0]">{company.size}</div>
        </div>
      </div>

      <p className="text-xs text-[#718096] mb-3 line-clamp-2">{company.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {company.tags.map((tag) => (
            <span key={tag} className="bg-[#EBF4FF] text-[#1863e5] text-xs px-2 py-0.5 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-[#718096] ml-2 flex-shrink-0">
          {vacancyCount !== undefined ? (
            <span className="text-[#1863e5] font-semibold">{vacancyCount} вак.</span>
          ) : (
            "→"
          )}
        </span>
      </div>
    </button>
  );
}
