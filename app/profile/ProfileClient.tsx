"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { COMPANIES_META, ROLES } from "@/lib/constants";
import { authClient } from "@/lib/auth-client";
import CompanyPicker from "@/components/ui/CompanyPicker";
import Toast from "@/components/ui/Toast";

interface ProfileData {
  id: string;
  role: string;
  roles: string[];
  experience: number;
  companies: string[];
  resumeUrl: string | null;
  resumeFileUrl: string | null;
  resumeFileName: string | null;
  resumeFileMime: string | null;
  resumeFileSize: number | null;
  telegramContact: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  siteUrl: string | null;
  bio: string | null;
  isPublic: boolean;
  openToRelocation: boolean;
  location: string | null;
  resumeText: string | null;
  applicationSubmittedAt: string | null;
  _count?: { views: number };
  user: {
    firstName: string;
    username: string | null;
    photoUrl: string | null;
  };
}

interface ReferrerData {
  id: string;
  company: string;
  telegramContact: string | null;
  linkedinUrl: string | null;
}

type UserKind = "candidate" | "referrer";

type FormState = {
  roles: string[];
  companies: string[];
  experience: number;
  location: string;
  resumeUrl: string;
  resumeFileUrl: string | null;
  resumeFileName: string | null;
  resumeFileMime: string | null;
  resumeFileSize: number | null;
  resumeText: string;
  telegramContact: string;
  linkedinUrl: string;
  githubUrl: string;
  siteUrl: string;
  bio: string;
  openToRelocation: boolean;
  isPublic: boolean;
};

type ReferrerFormState = {
  company: string;
  telegramContact: string;
  linkedinUrl: string;
};

type SessionUser = {
  name: string;
  email: string;
  image: string | null;
};

const COMPANY_OPTIONS = COMPANIES_META.map((company) => company.name);

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function humanFileSize(value: number | null): string {
  if (!value || value <= 0) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function FieldLabel({
  children,
  required = false,
  optional = false,
  extra,
}: {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="mb-1.5 flex flex-wrap items-center gap-2 text-sm font-medium text-[#4A5568]">
      <span>{children}</span>
      {required && (
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
          * Обязательно
        </span>
      )}
      {optional && (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-[#718096]">
          Опционально
        </span>
      )}
      {extra}
    </div>
  );
}

export default function ProfileClient({ sessionUser }: { sessionUser: SessionUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [referrer, setReferrer] = useState<ReferrerData | null>(null);
  const [userKind, setUserKind] = useState<UserKind>("candidate");
  const [form, setForm] = useState<FormState>({
    roles: [],
    companies: [],
    experience: 2,
    location: "",
    resumeUrl: "",
    resumeFileUrl: null,
    resumeFileName: null,
    resumeFileMime: null,
    resumeFileSize: null,
    resumeText: "",
    telegramContact: "",
    linkedinUrl: "",
    githubUrl: "",
    siteUrl: "",
    bio: "",
    openToRelocation: false,
    isPublic: false,
  });
  const [referrerForm, setReferrerForm] = useState<ReferrerFormState>({
    company: "",
    telegramContact: "",
    linkedinUrl: "",
  });
  const [customRole, setCustomRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmittedStatus, setLastSubmittedStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([fetch("/api/profile"), fetch("/api/referrer")])
      .then(async ([profileRes, referrerRes]) => {
        let loadedProfile: ProfileData | null = null;
        if (profileRes.status !== 404) {
          const json = await profileRes.json();
          if (!profileRes.ok) throw new Error(json.error ?? "Ошибка загрузки профиля");
          loadedProfile = json.profile as ProfileData;
        }

        const referrerJson = await referrerRes.json();
        if (!referrerRes.ok) throw new Error(referrerJson.error ?? "Ошибка загрузки данных реферала");
        const loadedReferrer = (referrerJson.referrer ?? null) as ReferrerData | null;

        if (loadedProfile) {
          setProfile(loadedProfile);
          setForm({
            roles: loadedProfile.roles?.length ? loadedProfile.roles : [loadedProfile.role],
            companies: loadedProfile.companies ?? [],
            experience: loadedProfile.experience ?? 0,
            location: loadedProfile.location ?? "",
            resumeUrl: loadedProfile.resumeUrl ?? "",
            resumeFileUrl: loadedProfile.resumeFileUrl,
            resumeFileName: loadedProfile.resumeFileName,
            resumeFileMime: loadedProfile.resumeFileMime,
            resumeFileSize: loadedProfile.resumeFileSize,
            resumeText: loadedProfile.resumeText ?? "",
            telegramContact: loadedProfile.telegramContact ?? "",
            linkedinUrl: loadedProfile.linkedinUrl ?? "",
            githubUrl: loadedProfile.githubUrl ?? "",
            siteUrl: loadedProfile.siteUrl ?? "",
            bio: loadedProfile.bio ?? "",
            openToRelocation: loadedProfile.openToRelocation ?? false,
            isPublic: loadedProfile.isPublic ?? false,
          });
          if (loadedProfile.applicationSubmittedAt) {
            setLastSubmittedStatus(
              `Последняя заявка отправлена: ${formatDate(loadedProfile.applicationSubmittedAt)}`,
            );
          }
        }

        if (loadedReferrer) {
          setReferrer(loadedReferrer);
          setReferrerForm({
            company: loadedReferrer.company ?? "",
            telegramContact: loadedReferrer.telegramContact ?? "",
            linkedinUrl: loadedReferrer.linkedinUrl ?? "",
          });
          setUserKind("referrer");
        } else {
          setReferrer(null);
          setUserKind("candidate");
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Ошибка загрузки профиля");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const displayName =
    profile?.user.firstName ||
    sessionUser.name?.trim() ||
    sessionUser.email.split("@")[0] ||
    "Пользователь";

  const displayUsername = profile?.user.username || sessionUser.email || null;
  const displayPhoto = profile?.user.photoUrl || sessionUser.image || null;
  const hasAnyResume = Boolean(form.resumeFileUrl || form.resumeUrl.trim() || form.resumeText.trim());

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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

  const collectPayload = () => ({
    roles: form.roles,
    companies: form.companies,
    experience: form.experience,
    location: form.location || null,
    resumeUrl: form.resumeUrl || null,
    resumeFileUrl: form.resumeFileUrl,
    resumeFileName: form.resumeFileName,
    resumeFileMime: form.resumeFileMime,
    resumeFileSize: form.resumeFileSize,
    resumeText: form.resumeText || null,
    telegramContact: form.telegramContact || null,
    linkedinUrl: form.linkedinUrl || null,
    githubUrl: form.githubUrl || null,
    siteUrl: form.siteUrl || null,
    bio: form.bio || null,
    openToRelocation: form.openToRelocation,
    isPublic: form.isPublic,
  });

  const validateForm = (): string | null => {
    if (userKind === "referrer") {
      if (!referrerForm.company.trim()) return "Укажи компанию, в которой ты можешь реферить.";
      return null;
    }

    if (!form.roles.length) return "Выбери хотя бы одну роль.";
    if (!form.companies.length) return "Выбери хотя бы одну компанию.";
    if (!Number.isFinite(form.experience) || form.experience < 0) return "Укажи корректный опыт.";
    if (!hasAnyResume) return "Добавь резюме файлом, ссылкой или текстом.";
    return null;
  };

  const handleUploadResume = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/profile/resume/upload", {
        method: "POST",
        body,
      });
      const json = await response.json();

      if (!response.ok) {
        setUploadError(json.error ?? "Не удалось загрузить резюме");
        return;
      }

      setForm((prev) => ({
        ...prev,
        resumeFileUrl: json.resumeFileUrl ?? null,
        resumeFileName: json.resumeFileName ?? file.name,
        resumeFileMime: json.resumeFileMime ?? file.type ?? null,
        resumeFileSize: json.resumeFileSize ?? file.size,
        resumeText: json.resumeText || prev.resumeText,
      }));
    } catch {
      setUploadError("Ошибка сети при загрузке резюме");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmitApplication = async () => {
    setError(null);
    setToastMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      if (userKind === "referrer") {
        const response = await fetch("/api/referrer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: referrerForm.company,
            telegramContact: referrerForm.telegramContact || null,
            linkedinUrl: referrerForm.linkedinUrl || null,
          }),
        });
        const json = await response.json();

        if (!response.ok || !json.referrer) {
          setError(json.error ?? "Не удалось сохранить профиль реферала.");
          return;
        }

        const savedReferrer = json.referrer as ReferrerData;
        setReferrer(savedReferrer);
        setReferrerForm({
          company: savedReferrer.company ?? "",
          telegramContact: savedReferrer.telegramContact ?? "",
          linkedinUrl: savedReferrer.linkedinUrl ?? "",
        });
        setToastMessage("Профиль реферала сохранен");
        return;
      }

      const response = await fetch("/api/profile/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectPayload()),
      });
      const json = await response.json();

      if (!response.ok || !json.ok) {
        const details =
          typeof json.details === "string" && json.details.trim().length
            ? ` Детали: ${json.details}`
            : "";
        setError(`${json.error ?? "Не удалось отправить заявку."}${details}`);
        return;
      }

      const submittedAt = json.submittedAt ?? json.profile?.applicationSubmittedAt ?? new Date().toISOString();
      if (json.profile) setProfile(json.profile as ProfileData);
      setLastSubmittedStatus(`Последняя заявка отправлена: ${formatDate(submittedAt)}`);
      setToastMessage("Заявка подана");
    } catch {
      setError("Ошибка сети при отправке заявки.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await fetch("/api/profile", { method: "DELETE" });
    await authClient.signOut();
    router.replace("/");
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace("/");
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

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-[#EBF4FF] border border-[#C3DAFE] rounded-2xl p-5 mb-6">
          <h1 className="text-lg font-black text-[#171923] mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            {userKind === "candidate"
              ? "Заполни профиль, чтобы подать заявку на реферал"
              : "Заполни профиль реферала"}
          </h1>
          <p className="text-sm text-[#4A5568]">
            {userKind === "candidate"
              ? "После нажатия кнопки внизу мы сохраним профиль и отправим заявку владельцу сервиса."
              : "Выбери компанию и оставь контакты, чтобы получать обращения от кандидатов."}
          </p>
          {userKind === "candidate" && lastSubmittedStatus && (
            <p className="text-sm text-green-700 mt-2">{lastSubmittedStatus}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            {displayPhoto ? (
              <Image
                src={displayPhoto}
                alt={displayName}
                width={56}
                height={56}
                className="rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {displayName[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-black text-[#171923]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                {displayName}
              </h2>
              {displayUsername && <p className="text-sm text-[#A0AEC0]">{displayUsername}</p>}
            </div>
            {(profile?._count?.views ?? 0) > 0 && (
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-black text-[#171923]">{profile?._count?.views ?? 0}</p>
                <p className="text-xs text-[#A0AEC0]">просмотров</p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
            <button
              onClick={handleLogout}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-[#4A5568] hover:bg-[#F7FAFC] transition-colors"
            >
              Выйти
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex-1 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                Удалить аккаунт
              </button>
            ) : (
              <div className="flex-1 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-medium text-red-700 mb-2">Удалить аккаунт навсегда?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-[#4A5568] hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-xs font-semibold text-white transition-colors disabled:opacity-60"
                  >
                    {deleting ? "Удаляю..." : "Да, удалить"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-bold text-[#171923] mb-2">Кто ты?</h3>
          <p className="text-sm text-[#4A5568] mb-4">Выбери роль, чтобы увидеть нужные поля.</p>
          <div className="grid sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setUserKind("candidate");
                setError(null);
              }}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                userKind === "candidate"
                  ? "border-[#1863e5] bg-[#EBF4FF] text-[#1863e5]"
                  : "border-gray-200 text-[#4A5568] hover:bg-gray-50"
              }`}
            >
              Кандидат
            </button>
            <button
              type="button"
              onClick={() => {
                setUserKind("referrer");
                setError(null);
              }}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                userKind === "referrer"
                  ? "border-[#1863e5] bg-[#EBF4FF] text-[#1863e5]"
                  : "border-gray-200 text-[#4A5568] hover:bg-gray-50"
              }`}
            >
              Реферал
            </button>
          </div>
        </div>

        {userKind === "candidate" ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h3 className="text-base font-bold text-[#171923] mb-4">Основные данные</h3>

              <div className="mb-4">
                <FieldLabel required>Роли (можно несколько)</FieldLabel>
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

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <FieldLabel required>Опыт (лет)</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={form.experience}
                    onChange={(event) => updateForm("experience", Number(event.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] outline-none focus:border-[#1863e5]"
                  />
                </div>
                <div>
                  <FieldLabel optional>Локация</FieldLabel>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) => updateForm("location", event.target.value)}
                    placeholder="Москва"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                  />
                </div>
              </div>

              <div>
                <FieldLabel required>Компании</FieldLabel>
                <CompanyPicker
                  options={COMPANY_OPTIONS}
                  values={form.companies}
                  onChange={(values) => updateForm("companies", values)}
                  multiple
                  placeholder="Поиск компании или добавление своей"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="mb-4">
                <FieldLabel required>Резюме</FieldLabel>
                <p className="text-xs text-[#718096]">
                  Нужен хотя бы один способ: файл, ссылка или текст.
                </p>
              </div>

              <div className="mb-4">
                <FieldLabel optional>1) Загрузить файл (PDF/DOCX)</FieldLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleUploadResume}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#171923] hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    {uploading ? "Загрузка..." : "Выбрать файл"}
                  </button>
                  {form.resumeFileUrl && (
                    <a
                      href={form.resumeFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#1863e5] hover:underline"
                    >
                      Открыть файл
                    </a>
                  )}
                </div>
                {form.resumeFileName && (
                  <p className="mt-2 text-xs text-[#718096]">
                    Файл: {form.resumeFileName}
                    {form.resumeFileMime ? ` · ${form.resumeFileMime}` : ""}
                    {form.resumeFileSize ? ` · ${humanFileSize(form.resumeFileSize)}` : ""}
                  </p>
                )}
                {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
              </div>

              <div className="mb-4">
                <FieldLabel optional>2) Ссылка на резюме</FieldLabel>
                <input
                  type="url"
                  value={form.resumeUrl}
                  onChange={(event) => updateForm("resumeUrl", event.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                />
              </div>

              <div>
                <FieldLabel optional>3) Текст резюме</FieldLabel>
                <textarea
                  value={form.resumeText}
                  onChange={(event) => updateForm("resumeText", event.target.value)}
                  rows={8}
                  placeholder="Вставь текст резюме"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5] resize-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h3 className="text-base font-bold text-[#171923] mb-4">Дополнительные данные</h3>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <FieldLabel optional>Telegram для связи</FieldLabel>
                  <input
                    type="text"
                    value={form.telegramContact}
                    onChange={(event) => updateForm("telegramContact", event.target.value)}
                    placeholder="@username"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                  />
                </div>
                <div>
                  <FieldLabel optional>LinkedIn</FieldLabel>
                  <input
                    type="url"
                    value={form.linkedinUrl}
                    onChange={(event) => updateForm("linkedinUrl", event.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                  />
                </div>
                <div>
                  <FieldLabel optional>GitHub</FieldLabel>
                  <input
                    type="url"
                    value={form.githubUrl}
                    onChange={(event) => updateForm("githubUrl", event.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                  />
                </div>
                <div>
                  <FieldLabel optional>Личный сайт</FieldLabel>
                  <input
                    type="url"
                    value={form.siteUrl}
                    onChange={(event) => updateForm("siteUrl", event.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                  />
                </div>
              </div>

              <div className="mb-4">
                <FieldLabel
                  optional
                  extra={<span className="text-[#A0AEC0]">({form.bio.length}/700)</span>}
                >
                  О себе
                </FieldLabel>
                <textarea
                  value={form.bio}
                  onChange={(event) => updateForm("bio", event.target.value.slice(0, 700))}
                  rows={4}
                  placeholder="Коротко о себе"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5] resize-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium text-[#718096]">Ниже два опциональных переключателя</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.openToRelocation}
                    onChange={(event) => updateForm("openToRelocation", event.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[#4A5568]">Готов к переезду</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(event) => updateForm("isPublic", event.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[#4A5568]">Показывать профиль в базе рефереров</span>
                </label>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h3 className="text-base font-bold text-[#171923] mb-2">Данные реферала</h3>
            <p className="text-sm text-[#4A5568] mb-4">
              Укажи компанию и контакты. Этого достаточно, чтобы активировать профиль реферала.
            </p>

            <div className="mb-4">
              <FieldLabel required>Компания</FieldLabel>
              <CompanyPicker
                options={COMPANY_OPTIONS}
                values={referrerForm.company ? [referrerForm.company] : []}
                onChange={(values) =>
                  setReferrerForm((prev) => ({ ...prev, company: values[0] ?? "" }))
                }
                multiple={false}
                placeholder="Поиск компании или добавление своей"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <FieldLabel optional>Telegram для связи</FieldLabel>
                <input
                  type="text"
                  value={referrerForm.telegramContact}
                  onChange={(event) =>
                    setReferrerForm((prev) => ({ ...prev, telegramContact: event.target.value }))
                  }
                  placeholder="@username"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                />
              </div>
              <div>
                <FieldLabel optional>LinkedIn</FieldLabel>
                <input
                  type="url"
                  value={referrerForm.linkedinUrl}
                  onChange={(event) =>
                    setReferrerForm((prev) => ({ ...prev, linkedinUrl: event.target.value }))
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
                />
              </div>
            </div>

            {referrer && (
              <p className="mt-3 text-xs text-[#718096]">
                Текущий профиль реферала: {referrer.company}
              </p>
            )}
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={handleSubmitApplication}
            disabled={submitting}
            className="w-full bg-[#1863e5] text-white font-semibold py-3 rounded-xl hover:bg-[#1550c0] transition-colors disabled:opacity-60"
          >
            {submitting
              ? userKind === "candidate"
                ? "Отправляю заявку..."
                : "Сохраняю профиль..."
              : userKind === "candidate"
                ? "Подать заявку"
                : "Сохранить профиль реферала"}
          </button>
        </div>
      </div>
    </div>
  );
}
