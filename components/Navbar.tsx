"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";

const showMarketplace = process.env.NEXT_PUBLIC_SHOW_MARKETPLACE === "true";
const showForYou = process.env.NEXT_PUBLIC_SHOW_FOR_YOU === "true";

function getDisplayName(user: ReturnType<typeof useUser>["user"]): string {
  return (
    user?.firstName?.trim() ||
    user?.username?.trim() ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "U"
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { isSignedIn, user } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayName = getDisplayName(user);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isCompaniesActive = pathname.startsWith("/companies");
  const isRequestsActive = pathname.startsWith("/requests");
  const isDashboardActive = pathname === "/dashboard";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href={isSignedIn ? "/dashboard" : "/"}
          className="text-[#171923] font-black text-lg hover:text-[#1863e5] transition-colors"
          style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
          Рефералка
        </Link>

        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#171923] hover:bg-gray-100 transition-colors"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Открыть меню"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {isSignedIn && (
            <Link
              href="/dashboard"
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
                isDashboardActive ? "text-[#1863e5] font-semibold" : "text-gray-500 hover:text-[#171923]"
              }`}
            >
              Главная
            </Link>
          )}

          <Link
            href="/companies"
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
              isCompaniesActive ? "text-[#1863e5] font-semibold" : "text-gray-500 hover:text-[#171923]"
            }`}
          >
            Компании
          </Link>

          {isSignedIn && (
            <Link
              href="/requests"
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
                isRequestsActive ? "text-[#1863e5] font-semibold" : "text-gray-500 hover:text-[#171923]"
              }`}
            >
              Мои запросы
            </Link>
          )}

          {showMarketplace && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  pathname.startsWith("/marketplace")
                    ? "text-[#1863e5] font-semibold"
                    : "text-gray-500 hover:text-[#171923]"
                }`}
              >
                Маркетплейс
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
                  <Link href="/marketplace" onClick={() => setDropdownOpen(false)} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[#F7FAFC] transition-colors">
                    <div>
                      <p className="text-sm font-bold text-[#171923] mb-0.5">Маркетплейс рефереров</p>
                      <p className="text-xs text-[#718096]">Выберите проверенного реферера</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}

          {showForYou && (
            <Link
              href="/for-you"
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
                pathname.startsWith("/for-you") ? "text-[#1863e5] font-semibold" : "text-gray-500 hover:text-[#171923]"
              }`}
            >
              Для тебя
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#1863e5] to-[#7C3AED] text-white leading-none">New</span>
            </Link>
          )}

          {isHome && (
            <button
              className="text-sm text-gray-500 hover:text-[#171923] transition-colors px-3 py-1.5"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            >
              Цены
            </button>
          )}

          {isSignedIn ? (
            <Link
              href="/profile"
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ml-2 ${
                pathname.startsWith("/profile") ? "text-[#1863e5]" : "text-[#171923] hover:text-[#1863e5]"
              }`}
            >
              <span className="w-8 h-8 rounded-full bg-[#1863e5] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {displayName[0]?.toUpperCase() || "U"}
              </span>
              Профиль
            </Link>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="text-sm text-gray-500 hover:text-[#171923] transition-colors px-2 py-1.5">
                  Войти
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">{isHome ? "Начать" : "Регистрация"}</Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
            <span className="text-[#171923] font-black text-lg" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Рефералка
            </span>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-lg text-[#171923] hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Закрыть меню"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-4 flex flex-col gap-1">
            {isSignedIn && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium px-3 py-3 rounded-xl transition-colors ${
                  isDashboardActive ? "text-[#1863e5] bg-[#EBF4FF]" : "text-[#171923] hover:bg-gray-50"
                }`}
              >
                Главная
              </Link>
            )}

            <Link
              href="/companies"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-medium px-3 py-3 rounded-xl transition-colors ${
                isCompaniesActive ? "text-[#1863e5] bg-[#EBF4FF]" : "text-[#171923] hover:bg-gray-50"
              }`}
            >
              Компании
            </Link>

            {isSignedIn && (
              <Link
                href="/requests"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium px-3 py-3 rounded-xl transition-colors ${
                  isRequestsActive ? "text-[#1863e5] bg-[#EBF4FF]" : "text-[#171923] hover:bg-gray-50"
                }`}
              >
                Мои запросы
              </Link>
            )}

            {showMarketplace && (
              <Link
                href="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium px-3 py-3 rounded-xl transition-colors ${
                  pathname.startsWith("/marketplace") ? "text-[#1863e5] bg-[#EBF4FF]" : "text-[#171923] hover:bg-gray-50"
                }`}
              >
                Маркетплейс
              </Link>
            )}

            {showForYou && (
              <Link
                href="/for-you"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 text-base font-medium px-3 py-3 rounded-xl transition-colors ${
                  pathname.startsWith("/for-you") ? "text-[#1863e5] bg-[#EBF4FF]" : "text-[#171923] hover:bg-gray-50"
                }`}
              >
                Для тебя
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#1863e5] to-[#7C3AED] text-white leading-none">New</span>
              </Link>
            )}

            {isHome && (
              <button
                className="text-base font-medium text-[#171923] hover:bg-gray-50 px-3 py-3 rounded-xl transition-colors text-left"
                onClick={() => {
                  setMobileMenuOpen(false);
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Цены
              </button>
            )}

            <div className="h-px bg-gray-200 my-2" />

            {isSignedIn ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-[#1863e5] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {displayName[0]?.toUpperCase() || "U"}
                </span>
                <span className="text-base font-semibold text-[#171923]">{displayName}</span>
              </Link>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <SignUpButton mode="modal">
                  <Button size="sm" className="w-full">Начать</Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-[#4A5568] hover:bg-[#F7FAFC] transition-colors">
                    Войти
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
