"use client";
import { useRouter } from "next/navigation";

const COMPANIES = [
  { name: "Яндекс",      domain: "yandex.ru" },
  { name: "Тинькофф",   domain: "tinkoff.ru" },
  { name: "Озон",        domain: "ozon.ru" },
  { name: "Авито",       domain: "avito.ru" },
  { name: "ВКонтакте",  domain: "vk.com" },
  { name: "Сбер",        domain: "sber.ru" },
  { name: "Wildberries", domain: "wildberries.ru" },
  { name: "Касперский",  domain: "kaspersky.ru" },
  { name: "МТС",         domain: "mts.ru" },
  { name: "HeadHunter",  domain: "hh.ru" },
  { name: "2ГИС",        domain: "2gis.ru" },
  { name: "Skyeng",      domain: "skyeng.ru" },
  { name: "Selectel",    domain: "selectel.ru" },
  { name: "Lamoda",      domain: "lamoda.ru" },
  { name: "Самокат",     domain: "samokat.ru" },
  { name: "Positive",    domain: "ptsecurity.com" },
];

function faviconUrl(domain: string) {
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`;
}

export default function CompaniesStrip() {
  const doubled = [...COMPANIES, ...COMPANIES];
  const router = useRouter();

  return (
    <section className="bg-[#F7FAFC] border-b border-gray-100 py-10 overflow-hidden">
      <p className="text-center text-xs text-gray-400 mb-8 tracking-widest uppercase font-medium px-4">
        Рефералы в топовые компании России
      </p>
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {doubled.map((c, i) => (
          <button
            key={i}
            className="inline-flex flex-col items-center gap-2 min-w-[68px] cursor-pointer group"
            onClick={() => router.push("/companies")}
          >
            <div className="w-11 h-11 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden group-hover:border-[#1863e5] group-hover:shadow-md transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={faviconUrl(c.domain)}
                alt={c.name}
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <span className="text-xs text-gray-400 group-hover:text-[#1863e5] transition-colors">{c.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
