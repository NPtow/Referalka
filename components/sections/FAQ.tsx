"use client";
import { useState } from "react";
import { FAQS } from "@/lib/constants";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-[#F7FAFC]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Частые вопросы
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-semibold text-[#171923] text-sm"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {faq.q}
                <span className={`text-[#1863e5] transition-transform flex-shrink-0 ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-[#718096] leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
