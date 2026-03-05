"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, useClerk, useUser } from "@clerk/nextjs";
import { COMPANIES_META, ROLES } from "@/lib/constants";

interface ProfileData {
  id: string;
  role: string;
  experience: number;
  companies: string[];
  resumeUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  siteUrl: string | null;
  bio: string | null;
  isPublic: boolean;
  openToRelocation: boolean;
  location: string | null;
  resumeText: string | null;
  _count?: { views: number };
  user: {
    firstName: string;
    username: string | null;
    photoUrl: string | null;
  };
}

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [role, setRole] = useState(ROLES[0] ?? "");
  const [experience, setExperience] = useState(2);
  const [companies, setCompanies] = useState<string[]>([]);
  const [resumeUrl, setResumeUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [siteUrl, setSiteUrl] = useState("");

  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [openToRelocation, setOpenToRelocation] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    fetch("/api/profile")
      .then(async (r) => {
        if (r.status === 404) {
          setLoading(false);
          return null;
        }
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error ?? "Ошибка загрузки");
        return data.profile as ProfileData;
      })
      .then((loadedProfile) => {
        if (!loadedProfile) return;

        setProfile(loadedProfile);
        setRole(loadedProfile.role);
        setExperience(loadedProfile.experience);
        setCompanies(loadedProfile.companies ?? []);
        setResumeUrl(loadedProfile.resumeUrl ?? "");
        setLinkedinUrl(loadedProfile.linkedinUrl ?? "");
        setGithubUrl(loadedProfile.githubUrl ?? "");
        setSiteUrl(loadedProfile.siteUrl ?? "");
        setBio(loadedProfile.bio ?? "");
        setLocation(loadedProfile.location ?? "");
        setOpenToRelocation(loadedProfile.openToRelocation ?? false);
        setIsPublic(loadedProfile.isPublic ?? false);
        setResumeText(loadedProfile.resumeText ?? "");
        if (loadedProfile.resumeText) setResumeFileName("резюме.pdf");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Ошибка загрузки профиля");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isLoaded, isSignedIn]);

  const displayName =
    profile?.user.firstName ||
    user?.firstName?.trim() ||
    user?.username?.trim() ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Пользователь";

  const displayUsername = profile?.user.username || user?.username || user?.primaryEmailAddress?.emailAddress || null;
  const displayPhoto = profile?.user.photoUrl || user?.imageUrl || null;

  const toggleCompany = (company: string) => {
    setCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setParseError("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/profile/parse-resume", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.text) {
        setParseError(json.error ?? "Не удалось обработать файл");
      } else {
        setResumeText(json.text);
        setResumeFileName(file.name);
      }
    } catch {
      setParseError("Ошибка соединения");
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setError(null);

    if (!role.trim()) {
      setError("Укажи роль.");
      return;
    }

    if (!companies.length) {
      setError("Выбери хотя бы одну компанию.");
      return;
    }

    if (!Number.isFinite(experience) || experience < 0) {
      setError("Укажи корректный опыт.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          experience,
          companies,
          resumeUrl: resumeUrl || null,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          siteUrl: siteUrl || null,
          bio: bio || null,
          location: location || null,
          openToRelocation,
          isPublic,
          resumeText: resumeText || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.profile) {
        setError(data.error ?? "Не удалось сохранить профиль");
        return;
      }

      setProfile(data.profile as ProfileData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Ошибка сети. Попробуй еще раз.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/" });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await fetch("/api/profile", { method: "DELETE" });
    await signOut({ redirectUrl: "/" });
  };

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1863e5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <div className="h-16" />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h1 className="text-2xl font-black text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Мой профиль
            </h1>
            <p className="text-[#718096] mb-6">Войдите через Clerk, чтобы заполнить профиль</p>
            <div className="flex items-center justify-center gap-3">
              <SignInButton mode="modal">
                <button className="bg-[#1863e5] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1550c0] transition-colors">
                  Войти
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="border border-gray-200 text-[#171923] font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  Регистрация
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-sm text-[#A0AEC0] mb-6">
          <Link href="/dashboard" className="hover:text-[#1863e5] transition-colors">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-[#718096]">Мой профиль</span>
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
              <h1 className="text-xl font-black text-[#171923]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                {displayName}
              </h1>
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
          <h2 className="text-base font-bold text-[#171923] mb-1">Основные данные</h2>
          <p className="text-xs text-[#A0AEC0] mb-5">Заполни профиль здесь, без отдельного онбординга</p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Роль</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] outline-none focus:border-[#1863e5] bg-white"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Опыт (лет)</label>
              <input
                type="number"
                min={0}
                max={40}
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] outline-none focus:border-[#1863e5]"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-[#4A5568] mb-2">Компании, куда хочешь попасть</label>
            <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200 p-3">
              <div className="flex flex-wrap gap-2">
                {COMPANIES_META.map((c) => {
                  const active = companies.includes(c.name);
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => toggleCompany(c.name)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        active ? "bg-[#1863e5] text-white" : "bg-[#F7FAFC] text-[#4A5568] hover:bg-[#EBF4FF]"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Ссылка на резюме</label>
              <input
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1.5">LinkedIn</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1.5">GitHub</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Личный сайт</label>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-bold text-[#171923] mb-1">Настройки маркетплейса</h2>
          <p className="text-xs text-[#A0AEC0] mb-5">Эти данные будут видны рефереру при просмотре твоего профиля</p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#4A5568] mb-1.5">
              О себе
              <span className="text-[#A0AEC0] font-normal ml-1">({bio.length}/500)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="Кратко опиши свой опыт и цели"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5] resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Локация</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Москва"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5]"
            />
          </div>

          <div className="mb-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setOpenToRelocation(!openToRelocation)}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${openToRelocation ? "bg-[#1863e5]" : "bg-gray-200"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${openToRelocation ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-[#4A5568]">Готов к переезду</span>
            </label>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-[#4A5568] mb-1.5">
              Резюме файлом
              <span className="text-[#A0AEC0] font-normal ml-1 text-xs"> — PDF или DOCX, мы извлечем текст для подбора вакансий</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => !parsing && fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-colors ${
                resumeText ? "border-green-300 bg-green-50" : "border-gray-200 bg-white hover:border-[#1863e5] hover:bg-[#F7FAFC]"
              } ${parsing ? "opacity-60 cursor-wait" : ""}`}
            >
              {parsing ? (
                <p className="text-sm text-[#718096]">Обрабатываю файл...</p>
              ) : resumeText ? (
                <div>
                  <p className="text-sm font-medium text-green-700">✓ {resumeFileName || "Резюме загружено"}</p>
                  <p className="text-xs text-[#718096] mt-1">{resumeText.length.toLocaleString()} символов извлечено</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-[#718096]">Нажми, чтобы загрузить PDF или DOCX</p>
                  <p className="text-xs text-[#A0AEC0] mt-1">Мы используем текст для подбора вакансий</p>
                </div>
              )}
            </div>
            {parseError && <p className="text-xs text-red-500 mt-1.5">{parseError}</p>}
          </div>

          <div className="border-t border-gray-100 pt-5">
            <label className="flex items-start gap-3 cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
              <div className={`mt-0.5 w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isPublic ? "bg-[#1863e5]" : "bg-gray-200"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#171923]">Показать в маркетплейсе</p>
                <p className="text-xs text-[#A0AEC0] mt-0.5">Рефереры из компаний смогут найти тебя и написать напрямую</p>
              </div>
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#1863e5] text-white font-semibold py-3 rounded-xl hover:bg-[#1550c0] transition-colors disabled:opacity-60"
        >
          {saving ? "Сохраняю..." : saved ? "Сохранено ✓" : "Сохранить"}
        </button>

        {isPublic && process.env.NEXT_PUBLIC_SHOW_MARKETPLACE === "true" && (
          <p className="text-center text-xs text-[#718096] mt-3">
            Твой профиль виден в <Link href="/marketplace" className="text-[#1863e5] hover:underline">маркетплейсе →</Link>
          </p>
        )}
      </div>
    </div>
  );
}
