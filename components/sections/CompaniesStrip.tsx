"use client";

const COMPANIES = [
  { name: "Яндекс", logo: "https://logo.clearbit.com/yandex.ru" },
  { name: "Тинькофф", logo: "https://logo.clearbit.com/tinkoff.ru" },
  { name: "Озон", logo: "https://logo.clearbit.com/ozon.ru" },
  { name: "Авито", logo: "https://logo.clearbit.com/avito.ru" },
  { name: "ВКонтакте", logo: "https://logo.clearbit.com/vk.com" },
  { name: "Сбер", logo: "https://logo.clearbit.com/sber.ru" },
  { name: "Wildberries", logo: "https://logo.clearbit.com/wildberries.ru" },
  { name: "Касперский", logo: "https://logo.clearbit.com/kaspersky.ru" },
  { name: "МТС", logo: "https://logo.clearbit.com/mts.ru" },
  { name: "Positive Technologies", logo: "https://logo.clearbit.com/ptsecurity.com" },
  { name: "Selectel", logo: "https://logo.clearbit.com/selectel.ru" },
  { name: "2ГИС", logo: "https://logo.clearbit.com/2gis.ru" },
  { name: "HeadHunter", logo: "https://logo.clearbit.com/hh.ru" },
  { name: "Skyeng", logo: "https://logo.clearbit.com/skyeng.ru" },
  { name: "Lamoda", logo: "https://logo.clearbit.com/lamoda.ru" },
  { name: "Самокат", logo: "https://logo.clearbit.com/samokat.ru" },
];

export default function CompaniesStrip() {
  return (
    <section className="bg-white border-b border-gray-100 py-10 px-4 overflow-hidden">
      <p className="text-center text-sm text-gray-400 mb-7 tracking-wide uppercase font-medium">
        Рефералы в топовые компании России
      </p>

      {/* marquee wrapper */}
      <div className="relative">
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <div
              key={i}
              className="inline-flex flex-col items-center gap-2 min-w-[72px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.logo}
                alt={c.name}
                width={40}
                height={40}
                className="rounded-xl object-contain grayscale hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-xs text-gray-400">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
