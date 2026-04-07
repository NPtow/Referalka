"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { COMPANIES_META } from "@/lib/constants";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity";

export default function CompaniesStrip() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-[#F7FAFC] py-12">
      <p className="text-center text-xs text-[#4A5568] mb-9 tracking-widest uppercase font-semibold px-4">
        Рефералы в топовые компании России
      </p>
      <div className="relative">
        <ScrollVelocityContainer className="w-full">
          <ScrollVelocityRow
            baseVelocity={1}
            direction={1}
            scrollReactivity
            className="gap-4 px-2 py-1 sm:gap-6 sm:px-3"
          >
            {COMPANIES_META.map((company) => (
              <button
                key={company.slug}
                type="button"
                aria-label={company.name}
                className="group inline-flex shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-[#1863e5] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1863e5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7FAFC] md:p-3.5"
                onClick={() => router.push("/profile")}
              >
                <div className="flex size-12 items-center justify-center overflow-hidden md:size-14">
                  {company.logoPath ? (
                    <Image
                      src={company.logoPath}
                      alt={company.name}
                      width={40}
                      height={40}
                      className="max-h-8 w-auto object-contain md:max-h-10"
                    />
                  ) : (
                    <span className="text-lg font-bold text-[#1863e5]">
                      {company.name[0]}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </ScrollVelocityRow>
        </ScrollVelocityContainer>
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r via-[#F7FAFC]/90 to-transparent sm:w-28" />
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l via-[#F7FAFC]/90 to-transparent sm:w-28" />
      </div>
    </section>
  );
}
