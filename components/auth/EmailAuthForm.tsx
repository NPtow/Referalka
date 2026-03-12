"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const maybeError = error as { message?: string; statusText?: string };
    if (maybeError.message?.trim()) return maybeError.message;
    if (maybeError.statusText?.trim()) return maybeError.statusText;
  }
  return fallback;
}

export default function EmailAuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = useMemo(
    () => (mode === "sign-in" ? "Вход по email" : "Регистрация по email"),
    [mode],
  );

  const subtitle = useMemo(
    () =>
      mode === "sign-in"
        ? "Войди, чтобы продолжить работу с профилем."
        : "Создай аккаунт, чтобы заполнить профиль и подать заявку.",
    [mode],
  );

  const alternateHref = mode === "sign-in" ? "/sign-up" : "/sign-in";
  const alternateLabel = mode === "sign-in" ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Укажи email.");
      return;
    }
    if (password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов.");
      return;
    }
    if (mode === "sign-up") {
      if (!name.trim()) {
        setError("Укажи имя.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Пароли не совпадают.");
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === "sign-in") {
        const result = await authClient.signIn.email({
          email: normalizedEmail,
          password,
          callbackURL: "/profile",
          rememberMe: true,
        });

        if (result.error) {
          setError(getErrorMessage(result.error, "Не удалось войти."));
          return;
        }
      } else {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: normalizedEmail,
          password,
          callbackURL: "/profile",
        });

        if (result.error) {
          setError(getErrorMessage(result.error, "Не удалось зарегистрироваться."));
          return;
        }
      }

      router.replace("/profile");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, mode === "sign-in" ? "Не удалось войти." : "Не удалось зарегистрироваться."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
        <h1
          className="text-3xl font-black text-[#171923] mb-2"
          style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
          {heading}
        </h1>
        <p className="text-sm text-[#4A5568] mb-6">{subtitle}</p>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "sign-up" && (
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Никита"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 8 символов"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "sign-up" && (
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Повтори пароль</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Повтори пароль"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                autoComplete="new-password"
              />
            </div>
          )}

          <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={submitting}>
            {submitting
              ? mode === "sign-in"
                ? "Входим..."
                : "Создаём аккаунт..."
              : mode === "sign-in"
                ? "Войти"
                : "Создать аккаунт"}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between gap-3 text-sm">
          <Link href={alternateHref} className="text-[#1863e5] hover:underline">
            {alternateLabel}
          </Link>
          <Link href="/" className="text-[#4A5568] hover:text-[#171923]">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
