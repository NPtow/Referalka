"use client";

import { useState } from "react";

type Props = {
  token: string;
  initialApproved: boolean;
};

export default function ApproveConnectionButton({ token, initialApproved }: Props) {
  const [approved, setApproved] = useState(initialApproved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    initialApproved ? "Контакты уже отправлены обеим сторонам." : null,
  );

  const handleApprove = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/referral-connections/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Не удалось подтвердить оплату.");
        return;
      }

      setApproved(true);
      setMessage(json.alreadyApproved
        ? "Контакты уже были отправлены ранее."
        : "Готово. Контакты отправлены кандидату и реферу.");
    } catch {
      setError("Ошибка сети при подтверждении.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-[#4A5568]">
        После клика контакты уйдут обеим сторонам на email. Используй кнопку только после того, как вручную подтвердил оплату.
      </p>
      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={handleApprove}
        disabled={loading || approved}
        className="mt-4 inline-flex items-center rounded-xl bg-[#1863e5] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1550c0] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {approved ? "Апрув уже выполнен" : loading ? "Отправляем контакты..." : "Подтвердить оплату и отправить контакты"}
      </button>
    </div>
  );
}
