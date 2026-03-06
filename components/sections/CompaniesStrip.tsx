"use client";
import { useRouter } from "next/navigation";
import { COMPANIES_META } from "@/lib/constants";

function faviconUrl(domain: string) {
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`;
}

export default function CompaniesStrip() {
  const doubled = [...COMPANIES_META, ...COMPANIES_META];
  const router = useRouter();

  return (
    <section className="bg-[#F7FAFC] border-b border-gray-100 py-12 overflow-hidden">
      <p className="text-center text-xs text-[#4A5568] mb-9 tracking-widest uppercase font-semibold px-4">
        Рефералы в топовые компании России
      </p>
      <div className="flex gap-10 animate-marquee whitespace-nowrap">
        {doubled.map((c, i) => (
          <button
            key={i}
            className="inline-flex flex-col items-center gap-2.5 min-w-[86px] cursor-pointer group"
            onClick={() => router.push("/profile")}
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden group-hover:border-[#1863e5] group-hover:shadow-md transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={faviconUrl(c.domain)}
                alt={c.name}
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <span className="text-xs text-[#4A5568] group-hover:text-[#1863e5] transition-colors">{c.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
