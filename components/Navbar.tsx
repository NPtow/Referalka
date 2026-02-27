"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { getUser } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [user, setUser] = useState<{ firstName: string } | null>(null);

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-[#171923] font-black text-lg hover:text-[#1863e5] transition-colors" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
          Рефералка
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/companies"
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              pathname.startsWith("/companies")
                ? "text-[#1863e5] font-semibold"
                : "text-gray-500 hover:text-[#171923]"
            }`}
          >
            Рефералы
          </Link>
          <Link
            href="/marketplace"
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              pathname.startsWith("/marketplace") || pathname.startsWith("/profile")
                ? "text-[#1863e5] font-semibold"
                : "text-gray-500 hover:text-[#171923]"
            }`}
          >
            Маркетплейс
          </Link>
          {isHome && (
            <button
              className="text-sm text-gray-500 hover:text-[#171923] transition-colors px-3 py-1.5"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
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
            <Button size="sm" onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}>
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
