"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string | null;
  onClose: () => void;
};

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => {
      onClose();
    }, 4500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] w-full max-w-sm">
      <div className="rounded-2xl border border-emerald-200 bg-white shadow-xl">
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            ✓
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#171923]">Успешно</p>
            <p className="mt-0.5 text-sm text-[#4A5568]">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#A0AEC0] transition-colors hover:bg-gray-50 hover:text-[#4A5568]"
            aria-label="Закрыть уведомление"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
