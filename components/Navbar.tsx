"use client";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const scrollToReg = () => {
    document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0C0129]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-white font-black text-lg" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
          Рефералочка
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
            Цены
          </Button>
          <Button size="sm" onClick={scrollToReg}>
            Начать
          </Button>
        </div>
      </div>
    </nav>
  );
}
