"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { COMPANIES_META, ROLES } from "@/lib/constants";
import CompanyPicker from "@/components/ui/CompanyPicker";

type Viewer = {
  name?: string | null;
  email?: string | null;
} | null;

type ReferrerData = {
  company: string | null;
  companies: string[];
  role: string | null;
  roles: string[];
  telegramContact: string | null;
  linkedinUrl: string | null;
};

type ReferrerFormState = {
  companies: string[];
  roles: string[];
  telegramContact: string;
  linkedinUrl: string;
};

type DraftSaveStatus = "idle" | "saving" | "saved" | "error";

type DraftSaveState = {
  status: DraftSaveStatus;
  message: string | null;
};

const COMPANY_OPTIONS = COMPANIES_META.map((company) => company.name);
const AUTOSAVE_DEBOUNCE_MS = 1500;

function normalizeReferrer(referrer: ReferrerData): ReferrerData {
  const companies = referrer.companies?.length
    ? referrer.companies
    : referrer.company
      ? [referrer.company]
      : [];
  const roles = referrer.roles?.length
    ? referrer.roles
    : referrer.role
      ? [referrer.role]
      : [];

  return {
    ...referrer,
    companies,
    company: companies[0] ?? referrer.company ?? null,
    roles,
    role: roles[0] ?? referrer.role ?? null,
  };
}

function createInitialReferrerForm(): ReferrerFormState {
  return {
    companies: [],
    roles: [],
    telegramContact: "",
    linkedinUrl: "",
  };
}

function buildDraftStatusLabel(state: DraftSaveState): string {
  if (state.status === "saving") return "Сохраняем...";
  if (state.status === "saved") return state.message ?? "Черновик сохранён";
  if (state.status === "error") return state.message ?? "Не удалось сохранить профиль";
  return "Профиль сохраняется автоматически";
}

function buildDraftStatusTone(state: DraftSaveState): string {
  if (state.status === "saving") return "text-[#4A5568]";
  if (state.status === "saved") return "text-emerald-700";
  if (state.status === "error") return "text-red-600";
  return "text-[#718096]";
}

export default function ReferrerClient({ viewer }: { viewer: Viewer }) {
  const isSignedIn = Boolean(viewer?.email);

  const [form, setForm] = useState<ReferrerFormState>(() => createInitialReferrerForm());
  const [savedReferrer, setSavedReferrer] = useState<ReferrerData | null>(null);
  const [customRole, setCustomRole] = useState("");
  const [draftState, setDraftState] = useState<DraftSaveState>({ status: "idle", message: null });
  const autosaveReadyRef = useRef(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSignatureRef = useRef("");
  const savePromiseRef = useRef<Promise<void> | null>(null);
  const resaveRequestedRef = useRef(false);

  const displayName =
    viewer?.name?.trim() || viewer?.email?.split("@")[0] || "Пользователь";

  const collectPayload = () => ({
    company: form.companies[0] ?? null,
    companies: form.companies,
    role: form.roles[0] ?? null,
    roles: form.roles,
    telegramContact: form.telegramContact || null,
    linkedinUrl: form.linkedinUrl || null,
  });

  const clearAutosaveTimer = () => {
    if (!autosaveTimerRef.current) return;
    clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = null;
  };

  useEffect(() => {
    if (!isSignedIn) return;

    fetch("/api/referrer")
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.referrer) return null;
        return normalizeReferrer(json.referrer as ReferrerData);
      })
      .then((referrer) => {
        const nextReferrer = referrer ? normalizeReferrer(referrer) : null;
        setSavedReferrer(nextReferrer);

        if (!nextReferrer) {
          lastSavedSignatureRef.current = JSON.stringify({
            company: null,
            companies: [],
            role: null,
            roles: [],
            telegramContact: null,
            linkedinUrl: null,
          });
          autosaveReadyRef.current = true;
          return;
        }

        setForm({
          companies: nextReferrer.companies,
          roles: nextReferrer.roles,
          telegramContact: nextReferrer.telegramContact ?? "",
          linkedinUrl: nextReferrer.linkedinUrl ?? "",
        });
        lastSavedSignatureRef.current = JSON.stringify({
          company: nextReferrer.companies[0] ?? null,
          companies: nextReferrer.companies,
          role: nextReferrer.roles[0] ?? null,
          roles: nextReferrer.roles,
          telegramContact: nextReferrer.telegramContact,
          linkedinUrl: nextReferrer.linkedinUrl,
        });
        autosaveReadyRef.current = true;
      })
      .catch(() => {
        lastSavedSignatureRef.current = JSON.stringify({
          company: null,
          companies: [],
          role: null,
          roles: [],
          telegramContact: null,
          linkedinUrl: null,
        });
        autosaveReadyRef.current = true;
      });
  }, [isSignedIn]);

  const saveDraft = async (payloadOverride?: ReturnType<typeof collectPayload>) => {
    const payload = payloadOverride ?? collectPayload();
    const signature = JSON.stringify(payload);

    if (signature === lastSavedSignatureRef.current) {
      return;
    }

    if (savePromiseRef.current) {
      resaveRequestedRef.current = true;
      return savePromiseRef.current;
    }

    const request = (async () => {
      setDraftState({ status: "saving", message: null });

      try {
        const response = await fetch("/api/referrer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await response.json();

        if (!response.ok || !json.referrer) {
          throw new Error(json.error ?? "Не удалось сохранить профиль");
        }

        const normalized = normalizeReferrer(json.referrer as ReferrerData);
        setSavedReferrer(normalized);
        lastSavedSignatureRef.current = signature;
        setDraftState({ status: "saved", message: "Черновик сохранён" });
      } catch (draftError) {
        setDraftState({
          status: "error",
          message: draftError instanceof Error ? draftError.message : "Не удалось сохранить профиль",
        });
      } finally {
        savePromiseRef.current = null;
        if (resaveRequestedRef.current) {
          resaveRequestedRef.current = false;
          await saveDraft();
        }
      }
    })();

    savePromiseRef.current = request;
    return request;
  };

  useEffect(() => {
    if (!autosaveReadyRef.current) return;

    const payload = collectPayload();
    const signature = JSON.stringify(payload);
    clearAutosaveTimer();

    if (signature === lastSavedSignatureRef.current) {
      return;
    }

    autosaveTimerRef.current = setTimeout(() => {
      void saveDraft(payload);
    }, AUTOSAVE_DEBOUNCE_MS);

    return clearAutosaveTimer;
  }, [form]);

  const toggleRole = (role: string) => {
    setForm((prev) => {
      if (prev.roles.includes(role)) {
        return { ...prev, roles: prev.roles.filter((item) => item !== role) };
      }
      return { ...prev, roles: [...prev.roles, role] };
    });
  };

  const addCustomRole = () => {
    const trimmed = customRole.trim();
    if (!trimmed) return;

    setForm((prev) => {
      if (prev.roles.some((role) => role.toLowerCase() === trimmed.toLowerCase())) return prev;
      return { ...prev, roles: [...prev.roles, trimmed] };
    });
    setCustomRole("");
  };

  const removeRole = (role: string) => {
    setForm((prev) => ({ ...prev, roles: prev.roles.filter((item) => item !== role) }));
  };

  const referrerProfileCompleted = Boolean(
    savedReferrer
    && savedReferrer.companies.length > 0
    && savedReferrer.roles.length > 0,
  );

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-sm text-[#A0AEC0] mb-6">
          <Link href="/" className="hover:text-[#1863e5] transition-colors">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-[#718096]">Стать реферером</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-2xl font-black text-[#171923] mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Стать реферером
          </h1>
          <p className="text-[#718096] text-sm mb-8">
            Заполни короткий профиль: укажи компании, в которые можешь порефералить, и направление, по которому хорошо понимаешь кандидатов. Профиль сохраняется автоматически.
          </p>

          {!isSignedIn ? (
            <div>
              <p className="text-sm text-[#4A5568] mb-4 text-center">Войди по email, чтобы продолжить</p>
              <div className="flex justify-center gap-2">
                <Link
                  href="/sign-in"
                  className="rounded-xl bg-[#1863e5] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1550c0] transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#171923] hover:bg-gray-50 transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {displayName[0]?.toUpperCase() || "U"}
                </div>
                <p className="text-sm font-medium text-[#171923]">{displayName}</p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-[#4A5568] mb-1.5">
                  В какие компании ты можешь порефералить? <span className="text-red-400">*</span>
                </label>
                <CompanyPicker
                  options={COMPANY_OPTIONS}
                  values={form.companies}
                  onChange={(values) => setForm((prev) => ({ ...prev, companies: values }))}
                  multiple
                  placeholder="Выбери компании или добавь свои"
                />
                <p className="mt-2 text-xs text-[#718096]">
                  Укажи компании, где работаешь сейчас, работал раньше или где у тебя есть сильные контакты.
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-[#4A5568] mb-1.5">
                  Кем ты работаешь? <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {ROLES.map((role) => {
                    const active = form.roles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          active ? "bg-[#1863e5] text-white" : "bg-[#F7FAFC] text-[#4A5568] hover:bg-[#EBF4FF]"
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRole}
                    onChange={(event) => setCustomRole(event.target.value)}
                    placeholder="Своя роль"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                  />
                  <button
                    type="button"
                    onClick={addCustomRole}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#171923] hover:bg-gray-50 transition-colors"
                  >
                    Добавить
                  </button>
                </div>
                {form.roles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-2 rounded-full bg-[#EBF4FF] px-3 py-1 text-xs font-medium text-[#1863e5]"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => removeRole(role)}
                          className="text-[#1550c0] hover:text-[#0f3d92]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#4A5568] mb-1.5">
                    Telegram <span className="text-[#A0AEC0] font-normal">(опционально)</span>
                  </label>
                  <input
                    type="text"
                    value={form.telegramContact}
                    onChange={(e) => setForm((prev) => ({ ...prev, telegramContact: e.target.value }))}
                    placeholder="@username"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A5568] mb-1.5">
                    LinkedIn <span className="text-[#A0AEC0] font-normal">(опционально)</span>
                  </label>
                  <input
                    type="url"
                    value={form.linkedinUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-[#F7FAFC] p-4">
                <p className={`text-sm font-medium ${buildDraftStatusTone(draftState)}`}>
                  {buildDraftStatusLabel(draftState)}
                </p>
                {referrerProfileCompleted ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/profile"
                      className="rounded-xl bg-[#1863e5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1550c0]"
                    >
                      Перейти в профиль →
                    </Link>
                    <Link
                      href="/referrer/candidates"
                      className="rounded-xl border border-[#C3DAFE] bg-white px-4 py-2.5 text-sm font-semibold text-[#1863e5] transition-colors hover:bg-[#EBF4FF]"
                    >
                      Открыть кандидатов
                    </Link>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-[#718096]">
                    Как только компании и роли будут заполнены, профиль станет готов к работе.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#A0AEC0] mt-4">
          Ищешь реферал сам?{" "}
          <Link href="/profile" className="text-[#1863e5] hover:underline">Перейти в профиль</Link>
        </p>
      </div>
    </div>
  );
}
