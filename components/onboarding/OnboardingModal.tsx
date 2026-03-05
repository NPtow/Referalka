"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Step1Companies from "./Step1Companies";
import Step2Resume from "./Step2Resume";
import Step3RoleExp from "./Step3RoleExp";
import Step4Card from "./Step4Card";

interface Props {
  onClose: () => void;
  onError?: () => void;
}

export interface OnboardingData {
  companies: string[];
  resumeUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  siteUrl: string;
  role: string;
  experience: number;
}

const STEPS = ["Компании", "Ссылки", "Роль", "Карточка"];

export default function OnboardingModal({ onClose, onError }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [data, setData] = useState<OnboardingData>({
    companies: [],
    resumeUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    siteUrl: "",
    role: "",
    experience: 2,
  });
  const [profileId, setProfileId] = useState<string | null>(null);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const submit = async (finalData: OnboardingData) => {
    setSubmitError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      const json = await res.json();
      if (json.profile) {
        setProfileId(json.profile.id);
        setStep(3);
      } else {
        setSubmitError("Не удалось создать профиль. Попробуй войти заново.");
        onError?.();
      }
    } catch {
      setSubmitError("Ошибка сети. Проверь соединение и попробуй снова.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* stepper */}
        <div className="flex border-b border-gray-100">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex-1 py-3 text-center text-xs font-semibold transition-colors ${
                i === step ? "text-[#1863e5] border-b-2 border-[#1863e5]" : i < step ? "text-[#38A169]" : "text-[#A0AEC0]"
              }`}
            >
              {i < step ? "✓ " : ""}{label}
            </div>
          ))}
        </div>

        <div className="p-6">
          {submitError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {submitError}
            </div>
          )}
          {step === 0 && (
            <Step1Companies
              selected={data.companies}
              onChange={(companies) => setData((d) => ({ ...d, companies }))}
              onNext={next}
            />
          )}
          {step === 1 && (
            <Step2Resume
              data={data}
              onChange={(updates) => setData((d) => ({ ...d, ...updates }))}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 2 && (
            <Step3RoleExp
              role={data.role}
              experience={data.experience}
              onChange={(updates) => setData((d) => ({ ...d, ...updates }))}
              onSubmit={() => submit(data)}
              onBack={back}
            />
          )}
          {step === 3 && (
            <Step4Card
              firstName={
                user?.firstName?.trim() ||
                user?.username?.trim() ||
                user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
                "Пользователь"
              }
              data={data}
              profileId={profileId}
              onClose={() => {
                onClose();
                router.push("/profile");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
