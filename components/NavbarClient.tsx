"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Button from "@/components/ui/Button";

type Viewer = {
  name?: string | null;
  email?: string | null;
} | null;

export default function NavbarClient({ viewer }: { viewer: Viewer }) {
  const pathname = usePathname();
  const isSignedIn = Boolean(viewer?.email);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayInitial = viewer?.name?.[0]?.toUpperCase() || viewer?.email?.[0]?.toUpperCase() || "U";

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href={isSignedIn ? "/profile" : "/"}
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

          <div className="hidden md:flex items-center gap-3">
            {isSignedIn && (
              <Link
                href="/profile"
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  pathname.startsWith("/profile")
                    ? "text-[#1863e5] bg-[#EBF4FF]"
                    : "text-gray-500 hover:text-[#171923]"
                }`}
              >
                Профиль
              </Link>
            )}

            {isSignedIn ? (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1863e5] text-white font-bold text-sm hover:bg-[#1550c0] transition-colors"
                aria-label="Выйти"
                title="Выйти"
              >
                {displayInitial}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in" className="text-sm text-gray-500 hover:text-[#171923] transition-colors px-2 py-1.5">
                  Войти
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Регистрация</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

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

          <div className="px-4 py-4 flex flex-col gap-2">
            {isSignedIn && (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium px-3 py-3 rounded-xl transition-colors ${
                  pathname.startsWith("/profile") ? "text-[#1863e5] bg-[#EBF4FF]" : "text-[#171923] hover:bg-gray-50"
                }`}
              >
                Профиль
              </Link>
            )}

            {isSignedIn ? (
              <button
                onClick={handleSignOut}
                className="w-full px-3 py-3 rounded-xl bg-[#1863e5] text-white font-semibold hover:bg-[#1550c0] transition-colors"
              >
                Выйти
              </button>
            ) : (
              <div className="px-3 py-2 flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  className="w-full py-3 rounded-xl border border-gray-200 text-[#171923] font-semibold hover:bg-gray-50 transition-colors text-center"
                >
                  Войти
                </Link>
                <Link
                  href="/sign-up"
                  className="w-full py-3 rounded-xl bg-[#1863e5] text-white font-semibold hover:bg-[#1550c0] transition-colors text-center"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
