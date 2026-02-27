export default function Footer() {
  return (
    <footer className="bg-[#0C0129] py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-white font-black text-xl" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
          Рефералка
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-xs text-white/40">
          <a href="#" className="hover:text-white/70 transition-colors">Политика конфиденциальности</a>
          <a href="#" className="hover:text-white/70 transition-colors">Условия использования</a>
          <a href="https://t.me/referalocka_support" className="hover:text-white/70 transition-colors">Поддержка в Telegram</a>
        </div>
        <div className="text-xs text-white/20">© 2025 Рефералка</div>
      </div>
    </footer>
  );
}
