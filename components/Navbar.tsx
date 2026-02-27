"use client";
import Button from "@/components/ui/Button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-[#171923] font-black text-lg" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
          Рефералка
        </div>
        <div className="flex items-center gap-3">
          <button
            className="text-sm text-gray-500 hover:text-[#171923] transition-colors px-3 py-1.5"
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
          >
            Цены
          </button>
          <Button size="sm" onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}>
            Начать
          </Button>
        </div>
      </div>
    </nav>
  );
}
