"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import { COMPANIES_META } from "@/lib/constants";

type Candidate = {
  id: string;
  role: string;
  roles: string[];
  experience: number;
  companies: string[];
  sharedCompanies: string[];
  availableCompanies: string[];
  connectedCompanies: string[];
  location: string | null;
  openToRelocation: boolean;
  bio: string | null;
  resumeUrl: string | null;
  resumeFileUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  siteUrl: string | null;
  applicationSubmittedAt: string | null;
  user: {
    firstName: string;
    username: string | null;
    photoUrl: string | null;
  };
};

function expLabel(n: number) {
  if (n === 1) return "1 год";
  if (n < 5) return `${n} года`;
  return `${n} лет`;
}

function formatSubmittedAt(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

function companyLogo(name: string): string | null {
  const company = COMPANIES_META.find((item) => item.name === name);
  return company?.logoPath ?? null;
}

export default function ReferrerCandidatesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [connectingKey, setConnectingKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/referrer/candidates")
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error ?? "Не удалось загрузить кандидатов");
        }
        setCandidates(json.candidates ?? []);
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : "Не удалось загрузить кандидатов");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleConnect = async (candidateId: string, companyName: string) => {
    const key = `${candidateId}:${companyName}`;
    setConnectingKey(key);
    setError(null);

    try {
      const response = await fetch("/api/referrer/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, companyName }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Не удалось отправить intro.");
        return;
      }

      setCandidates((prev) =>
        prev.map((candidate) => {
          if (candidate.id !== candidateId) return candidate;
          if (candidate.connectedCompanies.includes(companyName)) return candidate;

          return {
            ...candidate,
            availableCompanies: candidate.availableCompanies.filter((item) => item !== companyName),
            connectedCompanies: [...candidate.connectedCompanies, companyName],
          };
        }),
      );
      setToastMessage(`Отправили intro по ${companyName}. Дальше ребята смогут списаться напрямую.`);
    } catch {
      setError("Ошибка сети при отправке intro.");
    } finally {
      setConnectingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1863e5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      <div className="h-16" />

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-6 text-sm text-[#A0AEC0]">
          <Link href="/dashboard" className="transition-colors hover:text-[#1863e5]">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-[#718096]">Кандидаты для реферала</span>
        </div>

        <div className="mb-8 rounded-3xl border border-[#C3DAFE] bg-[#EBF4FF] p-6">
          <h1 className="mb-2 text-3xl font-black text-[#171923]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Кого ты можешь зарефералить
          </h1>
          <p className="max-w-3xl text-sm text-[#4A5568]">
            Здесь только те кандидаты, которые совпадают с твоими компаниями и разрешили показать свой профиль подходящим реферам.
            Контакты на странице не раскрываем: нажимаешь кнопку, и мы отправляем intro email обеим сторонам.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {candidates.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="mb-2 text-lg font-bold text-[#171923]">Пока нет подходящих кандидатов</p>
            <p className="text-sm text-[#718096] mb-6">
              Как только появятся новые анкеты с пересечением по твоим компаниям, они окажутся здесь.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#171923] transition-colors hover:bg-[#F7FAFC]"
            >
              Обновить профиль →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 gap-4">
                    {candidate.user.photoUrl ? (
                      <Image
                        src={candidate.user.photoUrl}
                        alt={candidate.user.firstName}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-xl font-bold text-white">
                        {candidate.user.firstName[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-[#171923]">{candidate.user.firstName}</h2>
                        <span className="rounded-full bg-[#F7FAFC] px-2.5 py-1 text-xs text-[#718096]">
                          {candidate.role}
                        </span>
                        {candidate.applicationSubmittedAt && (
                          <span className="rounded-full bg-[#F7FAFC] px-2.5 py-1 text-xs text-[#718096]">
                            Заявка от {formatSubmittedAt(candidate.applicationSubmittedAt)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#718096]">
                        <span className="rounded-full bg-[#F7FAFC] px-2.5 py-1">{expLabel(candidate.experience)}</span>
                        {candidate.location && (
                          <span className="rounded-full bg-[#F7FAFC] px-2.5 py-1">{candidate.location}</span>
                        )}
                        {candidate.openToRelocation && (
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-green-700">Готов к переезду</span>
                        )}
                      </div>
                      {candidate.roles.length > 1 && (
                        <p className="mt-3 text-sm text-[#4A5568]">
                          <span className="font-semibold text-[#171923]">Роли:</span> {candidate.roles.join(", ")}
                        </p>
                      )}
                      {candidate.bio && (
                        <p className="mt-3 text-sm leading-relaxed text-[#4A5568]">{candidate.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className="w-full max-w-sm rounded-2xl bg-[#F7FAFC] p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#A0AEC0]">
                      Совпадающие компании
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.sharedCompanies.map((companyName) => {
                        const logo = companyLogo(companyName);
                        return (
                          <span
                            key={companyName}
                            className="inline-flex items-center gap-2 rounded-full border border-[#C3DAFE] bg-white px-3 py-1 text-xs font-medium text-[#1863e5]"
                          >
                            {logo && (
                              <Image src={logo} alt={companyName} width={14} height={14} className="object-contain" />
                            )}
                            {companyName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {(candidate.linkedinUrl || candidate.githubUrl || candidate.siteUrl || candidate.resumeUrl || candidate.resumeFileUrl) && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#A0AEC0]">Ссылки</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {candidate.linkedinUrl && (
                        <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#EBF4FF] px-3 py-1 text-[#1863e5] hover:underline">
                          LinkedIn
                        </a>
                      )}
                      {candidate.githubUrl && (
                        <a href={candidate.githubUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#EBF4FF] px-3 py-1 text-[#1863e5] hover:underline">
                          GitHub
                        </a>
                      )}
                      {candidate.siteUrl && (
                        <a href={candidate.siteUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#EBF4FF] px-3 py-1 text-[#1863e5] hover:underline">
                          Сайт
                        </a>
                      )}
                      {candidate.resumeFileUrl && (
                        <a href={candidate.resumeFileUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#EBF4FF] px-3 py-1 text-[#1863e5] hover:underline">
                          Резюме
                        </a>
                      )}
                      {!candidate.resumeFileUrl && candidate.resumeUrl && (
                        <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#EBF4FF] px-3 py-1 text-[#1863e5] hover:underline">
                          Резюме
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="mb-3 text-sm font-semibold text-[#171923]">Отправить intro</p>
                  {candidate.availableCompanies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {candidate.availableCompanies.map((companyName) => {
                        const key = `${candidate.id}:${companyName}`;
                        return (
                          <button
                            key={companyName}
                            type="button"
                            onClick={() => handleConnect(candidate.id, companyName)}
                            disabled={connectingKey === key}
                            className="rounded-xl bg-[#1863e5] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1550c0] disabled:opacity-60"
                          >
                            {connectingKey === key ? "Отправляем..." : `Связаться по ${companyName}`}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-[#718096]">По всем совпадающим компаниям intro уже отправили.</p>
                  )}

                  {candidate.connectedCompanies.length > 0 && (
                    <p className="mt-3 text-xs text-emerald-700">
                      Уже отправили intro: {candidate.connectedCompanies.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
