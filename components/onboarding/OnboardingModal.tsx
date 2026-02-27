"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Step1Companies from "./Step1Companies";
import Step2Resume from "./Step2Resume";
import Step3RoleExp from "./Step3RoleExp";
import Step4Card from "./Step4Card";

interface Props {
  userId: number;
  firstName: string;
  onClose: () => void;
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

export default function OnboardingModal({ userId, firstName, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
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
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...finalData }),
    });
    const json = await res.json();
    if (json.profile) {
      setProfileId(json.profile.id);
      setStep(3);
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
              firstName={firstName}
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
