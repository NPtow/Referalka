"use client";
import { useState } from "react";

interface CandidateRow {
  id: string;
  role: string;
  experience: number;
  companies: string[];
  location: string | null;
  bio: string | null;
  isPublic: boolean;
  summary: string | null;
  resumeText: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
  createdAt: string;
  _count: { views: number };
  user: { id: number; firstName: string; username: string | null };
}

export default function AdminCandidatesPage() {
  const [secret, setSecret] = useState("");
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, "summary" | "resume" | null>>({});

  const handleLoad = async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/candidates?secret=${encodeURIComponent(secret)}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Ошибка");
    } else {
      setCandidates(json.profiles);
      setLoaded(true);
    }
    setLoading(false);
  };

  const toggle = (id: string, field: "summary" | "resume") => {
    setExpanded((prev) => ({ ...prev, [id]: prev[id] === field ? null : field }));
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-black text-[#171923] mb-8" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
          Admin · Кандидаты
        </h1>

        {!loaded ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm">
            <label className="block text-sm font-medium text-[#4A5568] mb-2">Admin secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLoad()}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1863e5] mb-4"
            />
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <button
              onClick={handleLoad}
              disabled={loading || !secret}
              className="w-full bg-[#1863e5] text-white font-semibold py-2.5 rounded-xl hover:bg-[#1550c0] transition-colors disabled:opacity-50"
            >
              {loading ? "Загрузка..." : "Войти"}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#718096] mb-6">Всего: {candidates.length} кандидатов</p>
            <div className="space-y-4">
              {candidates.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#171923]">{c.user.firstName}</span>
                        {c.user.username && (
                          <a
                            href={`https://t.me/${c.user.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#1863e5] hover:underline"
                          >
                            @{c.user.username}
                          </a>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.isPublic ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {c.isPublic ? "Публичный" : "Скрытый"}
                        </span>
                      </div>
                      <p className="text-sm text-[#718096]">
                        {c.role} · {c.experience} лет опыта
                        {c.location ? ` · ${c.location}` : ""}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.companies.map((name) => (
                          <span key={name} className="text-xs bg-[#EBF4FF] text-[#1863e5] px-2 py-0.5 rounded-full">{name}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-[#171923]">👀 {c._count.views} просмотров</p>
                      <p className="text-xs text-[#A0AEC0] mt-0.5">{new Date(c.createdAt).toLocaleDateString("ru-RU")}</p>
                      <div className="flex gap-2 mt-2 justify-end">
                        {c.linkedinUrl && (
                          <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1863e5] hover:underline">LinkedIn</a>
                        )}
                        {c.resumeUrl && (
                          <a href={c.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1863e5] hover:underline">Резюме</a>
                        )}
                      </div>
                    </div>
                  </div>

                  {c.bio && (
                    <p className="text-xs text-[#4A5568] mt-3 bg-[#F7FAFC] rounded-xl px-3 py-2">{c.bio}</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    {c.summary && (
                      <button
                        onClick={() => toggle(c.id, "summary")}
                        className="text-xs text-[#718096] hover:text-[#1863e5] border border-gray-200 rounded-lg px-3 py-1 transition-colors"
                      >
                        {expanded[c.id] === "summary" ? "Скрыть summary" : "Показать summary"}
                      </button>
                    )}
                    {c.resumeText && (
                      <button
                        onClick={() => toggle(c.id, "resume")}
                        className="text-xs text-[#718096] hover:text-[#1863e5] border border-gray-200 rounded-lg px-3 py-1 transition-colors"
                      >
                        {expanded[c.id] === "resume" ? "Скрыть резюме" : "Показать резюме"}
                      </button>
                    )}
                  </div>

                  {expanded[c.id] === "summary" && c.summary && (
                    <pre className="mt-3 text-xs text-[#4A5568] bg-[#F7FAFC] rounded-xl px-4 py-3 whitespace-pre-wrap break-words border border-gray-100">
                      {c.summary}
                    </pre>
                  )}
                  {expanded[c.id] === "resume" && c.resumeText && (
                    <pre className="mt-3 text-xs text-[#4A5568] bg-[#F7FAFC] rounded-xl px-4 py-3 whitespace-pre-wrap break-words border border-gray-100 max-h-64 overflow-y-auto">
                      {c.resumeText}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
