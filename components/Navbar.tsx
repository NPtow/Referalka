"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { getUser } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [user, setUser] = useState<{ firstName: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isReferralsActive =
    pathname.startsWith("/companies") || pathname.startsWith("/marketplace") || pathname.startsWith("/profile");

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-[#171923] font-black text-lg hover:text-[#1863e5] transition-colors"
          style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
          Рефералка
        </Link>

        <div className="flex items-center gap-3">
          {/* Referrals dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                isReferralsActive
                  ? "text-[#1863e5]"
                  : "text-[#171923] hover:text-[#1863e5]"
              }`}
            >
              Рефералы
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M3 5l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
                <Link
                  href="/companies"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[#F7FAFC] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#EBF4FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5z"
                        stroke="#1863e5"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M2 20c0-3.3 2.7-6 6-6h4"
                        stroke="#1863e5"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <circle cx="18.5" cy="18.5" r="2.5" stroke="#1863e5" strokeWidth="1.8" />
                      <path
                        d="M20.5 20.5l1.5 1.5"
                        stroke="#1863e5"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#171923] mb-0.5">Запросить реферал</p>
                    <p className="text-xs text-[#718096] leading-relaxed">
                      Отправьте заявку в компанию и свяжитесь с её сотрудником
                    </p>
                  </div>
                </Link>

                <Link
                  href="/marketplace"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[#F7FAFC] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#F3E8FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                        stroke="#7C3AED"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <circle cx="9" cy="7" r="4" stroke="#7C3AED" strokeWidth="1.8" />
                      <path
                        d="M23 21v-2a4 4 0 0 0-3-3.87"
                        stroke="#7C3AED"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16 3.13a4 4 0 0 1 0 7.75"
                        stroke="#7C3AED"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#171923] mb-0.5">Маркетплейс рефереров</p>
                    <p className="text-xs text-[#718096] leading-relaxed">
                      Выберите проверенного реферера из топовых компаний
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* For You */}
          <Link
            href="/for-you"
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
              pathname.startsWith("/for-you")
                ? "text-[#1863e5] font-semibold"
                : "text-gray-500 hover:text-[#171923]"
            }`}
          >
            Для тебя
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#1863e5] to-[#7C3AED] text-white leading-none">
              New
            </span>
          </Link>

          {isHome && (
            <button
              className="text-sm text-gray-500 hover:text-[#171923] transition-colors px-3 py-1.5"
              onClick={() =>
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Цены
            </button>
          )}

          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm font-semibold text-[#171923] hover:text-[#1863e5] transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-[#1863e5] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user.firstName[0]}
              </span>
              Профиль
            </Link>
          ) : isHome ? (
            <Button
              size="sm"
              onClick={() =>
                document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Начать
            </Button>
          ) : (
            <Link href="/#registration">
              <Button size="sm">Начать</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
