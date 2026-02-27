"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getUser, saveUser, StoredUser } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";
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
  user: {
    firstName: string;
    username: string | null;
    photoUrl: string | null;
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  // Form state
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [openToRelocation, setOpenToRelocation] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (!u) { setLoading(false); return; }

    fetch(`/api/profile?userId=${u.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile(d.profile);
          setBio(d.profile.bio ?? "");
          setLocation(d.profile.location ?? "");
          setOpenToRelocation(d.profile.openToRelocation ?? false);
          setIsPublic(d.profile.isPublic ?? false);
          setResumeText(d.profile.resumeText ?? "");
          if (d.profile.resumeText) setResumeFileName("резюме.pdf");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAuth = (authedUser: StoredUser) => {
    saveUser(authedUser);
    setUser(authedUser);
    setShowAuth(false);

    fetch(`/api/profile?userId=${authedUser.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile(d.profile);
          setBio(d.profile.bio ?? "");
          setLocation(d.profile.location ?? "");
          setOpenToRelocation(d.profile.openToRelocation ?? false);
          setIsPublic(d.profile.isPublic ?? false);
          setResumeText(d.profile.resumeText ?? "");
          if (d.profile.resumeText) setResumeFileName("резюме.pdf");
        }
        setLoading(false);
      });
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
      if (json.text) {
        setResumeText(json.text);
        setResumeFileName(file.name);
      } else {
        setParseError(json.error ?? "Не удалось обработать файл");
      }
    } catch {
      setParseError("Ошибка соединения");
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, bio, location, openToRelocation, isPublic, resumeText }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1863e5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <div className="h-16" />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h1 className="text-2xl font-black text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Мой профиль
            </h1>
            <p className="text-[#718096] mb-6">Войди через Telegram, чтобы управлять своим профилем в маркетплейсе</p>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-[#1863e5] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1550c0] transition-colors"
            >
              Войти через Telegram
            </button>
          </div>
        </div>
        {showAuth && (
          <AuthModal onAuth={handleAuth} onClose={() => setShowAuth(false)} />
        )}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <div className="h-16" />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h1 className="text-2xl font-black text-[#171923] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Профиль не заполнен
            </h1>
            <p className="text-[#718096] mb-6">Сначала пройди регистрацию на главной странице, чтобы создать профиль</p>
            <Link
              href="/#registration"
              className="inline-block bg-[#1863e5] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1550c0] transition-colors"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-[#A0AEC0] mb-6">
          <Link href="/" className="hover:text-[#1863e5] transition-colors">Главная</Link>
          <span className="mx-2">/</span>
          <Link href="/marketplace" className="hover:text-[#1863e5] transition-colors">Маркетплейс</Link>
          <span className="mx-2">/</span>
          <span className="text-[#718096]">Мой профиль</span>
        </div>

        {/* User header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            {profile.user.photoUrl ? (
              <Image
                src={profile.user.photoUrl}
                alt={profile.user.firstName}
                width={56}
                height={56}
                className="rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {profile.user.firstName[0]}
              </div>
            )}
            <div>
              <h1 className="text-xl font-black text-[#171923]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                {profile.user.firstName}
              </h1>
              {profile.user.username && (
                <p className="text-sm text-[#A0AEC0]">@{profile.user.username}</p>
              )}
            </div>
          </div>
        </div>

        {/* Base profile (readonly) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-bold text-[#171923] mb-4">Основной профиль</h2>
          <div className="flex flex-wrap gap-2 text-sm text-[#718096] mb-3">
            <span className="bg-[#F7FAFC] px-3 py-1 rounded-full border border-gray-200">
              {profile.role}
            </span>
            <span className="bg-[#F7FAFC] px-3 py-1 rounded-full border border-gray-200">
              {profile.experience} {profile.experience === 1 ? "год" : profile.experience < 5 ? "года" : "лет"} опыта
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {profile.companies.map((name) => {
              const meta = COMPANIES_META.find((c) => c.name === name);
              return (
                <span key={name} className="bg-[#EBF4FF] text-[#1863e5] text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  {meta?.logoPath && <Image src={meta.logoPath} alt={name} width={12} height={12} className="object-contain" />}
                  {name}
                </span>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#1863e5] hover:underline">LinkedIn ↗</a>}
            {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[#1863e5] hover:underline">GitHub ↗</a>}
            {profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-[#1863e5] hover:underline">Резюме ↗</a>}
            {profile.siteUrl && <a href={profile.siteUrl} target="_blank" rel="noopener noreferrer" className="text-[#1863e5] hover:underline">Сайт ↗</a>}
          </div>
        </div>

        {/* Marketplace settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-bold text-[#171923] mb-1">Настройки маркетплейса</h2>
          <p className="text-xs text-[#A0AEC0] mb-5">Эти данные будут видны рефереру при просмотре твоего профиля</p>

          {/* Bio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#4A5568] mb-1.5">
              О себе
              <span className="text-[#A0AEC0] font-normal ml-1">({bio.length}/500)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="Я frontend-разработчик с 5 годами опыта в e-commerce. Знаю React, TypeScript, Next.js. Хочу попасть в продуктовую команду Яндекса или Авито."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#171923] placeholder-[#A0AEC0] outline-none focus:border-[#1863e5] resize-none"
            />
          </div>

          {/* Location */}
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

          {/* Open to relocation */}
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

          {/* Resume file upload */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#4A5568] mb-1.5">
              Резюме файлом
              <span className="text-[#A0AEC0] font-normal ml-1 text-xs">— PDF или DOCX, мы извлечём текст для подбора вакансий</span>
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
                resumeText
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-white hover:border-[#1863e5] hover:bg-[#F7FAFC]"
              } ${parsing ? "opacity-60 cursor-wait" : ""}`}
            >
              {parsing ? (
                <p className="text-sm text-[#718096]">Обрабатываю файл...</p>
              ) : resumeText ? (
                <div>
                  <p className="text-sm font-medium text-green-700">
                    ✓ {resumeFileName || "Резюме загружено"}
                  </p>
                  <p className="text-xs text-[#718096] mt-1">
                    {resumeText.length.toLocaleString()} символов извлечено · нажми, чтобы заменить
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-[#718096]">
                    Нажми, чтобы загрузить PDF или DOCX
                  </p>
                  <p className="text-xs text-[#A0AEC0] mt-1">Мы используем текст для подбора вакансий</p>
                </div>
              )}
            </div>
            {parseError && (
              <p className="text-xs text-red-500 mt-1.5">{parseError}</p>
            )}
          </div>

          {/* isPublic toggle */}
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

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#1863e5] text-white font-semibold py-3 rounded-xl hover:bg-[#1550c0] transition-colors disabled:opacity-60"
        >
          {saving ? "Сохраняю..." : saved ? "Сохранено ✓" : "Сохранить"}
        </button>

        {isPublic && (
          <p className="text-center text-xs text-[#718096] mt-3">
            Твой профиль виден в{" "}
            <Link href="/marketplace" className="text-[#1863e5] hover:underline">маркетплейсе →</Link>
          </p>
        )}
      </div>
    </div>
  );
}
