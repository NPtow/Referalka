"use client";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Hero() {
  return (
    <section className="bg-[#F7FAFC] flex flex-col items-center justify-center px-4 pt-28 pb-20 text-center relative overflow-hidden">
      <h1
        className="text-4xl md:text-6xl font-black text-[#171923] max-w-3xl leading-tight mb-5"
        style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
      >
        <span className="text-[#1863e5]">Реферал в топовую компанию</span>{" "}
        от реального сотрудника.
      </h1>

      <p className="text-lg text-gray-500 max-w-xl mb-8 leading-relaxed">
        Кандидаты с рефералом на 40% чаще получают приглашение на интервью.
        Мы соединяем тебя с сотрудниками ведущих IT-компаний России.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <Show when="signed-in">
          <Link href="/profile">
            <Button size="lg">Открыть мой профиль →</Button>
          </Link>
        </Show>
        <Show when="signed-out">
          <SignUpButton mode="modal">
            <Button size="lg">Получить реферал →</Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="text-sm font-medium text-gray-500 hover:text-[#1863e5] transition-colors px-4 py-2">
              Уже есть аккаунт
            </button>
          </SignInButton>
        </Show>
        <Link
          href="/referrer"
          className="text-sm font-medium text-gray-500 hover:text-[#1863e5] transition-colors px-4 py-2"
        >
          Стать реферером
        </Link>
      </div>

      {/* notification previews */}
      <div className="flex flex-col sm:flex-row gap-3 mt-12 text-left">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 shadow-sm">
          🎉 Тебя зареферили в <strong className="text-[#171923]">Яндекс</strong>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 shadow-sm">
          👀 Сотрудник <strong className="text-[#171923]">Тинькофф</strong> хочет тебя зареферить
        </div>
      </div>
    </section>
  );
}
