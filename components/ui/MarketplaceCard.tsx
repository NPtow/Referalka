"use client";

import Image from "next/image";
import { COMPANIES_META } from "@/lib/constants";

interface User {
  firstName: string;
  username: string | null;
  photoUrl: string | null;
}

interface Candidate {
  id: string;
  role: string;
  experience: number;
  companies: string[];
  location: string | null;
  openToRelocation: boolean;
  bio: string | null;
  resumeUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  siteUrl: string | null;
  user: User;
}

interface Props {
  candidate: Candidate;
  onView: (candidate: Candidate) => void;
}

function expLabel(n: number) {
  if (n === 1) return "1 год";
  if (n < 5) return `${n} года`;
  return `${n} лет`;
}

export default function MarketplaceCard({ candidate, onView }: Props) {
  const { user } = candidate;

  const logoForCompany = (name: string) => {
    const meta = COMPANIES_META.find((c) => c.name === name);
    return meta?.logoPath ?? null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#1863e5] hover:shadow-sm transition-all flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        {user.photoUrl ? (
          <Image
            src={user.photoUrl}
            alt={user.firstName}
            width={44}
            height={44}
            className="rounded-full flex-shrink-0 object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            {user.firstName[0]}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-[#171923] text-sm truncate">{user.firstName}</p>
          <p className="text-xs text-[#718096] truncate">{candidate.role}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5 text-xs text-[#718096]">
        {candidate.location && (
          <span className="bg-[#F7FAFC] px-2 py-0.5 rounded-full">{candidate.location}</span>
        )}
        <span className="bg-[#F7FAFC] px-2 py-0.5 rounded-full">{expLabel(candidate.experience)}</span>
        {candidate.openToRelocation && (
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full">К переезду</span>
        )}
      </div>

      {/* Desired companies */}
      {candidate.companies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {candidate.companies.slice(0, 5).map((name) => {
            const logo = logoForCompany(name);
            return logo ? (
              <div key={name} title={name} className="w-6 h-6 rounded-md bg-[#F7FAFC] flex items-center justify-center overflow-hidden border border-gray-100">
                <Image src={logo} alt={name} width={16} height={16} className="object-contain" />
              </div>
            ) : (
              <span key={name} className="text-xs bg-[#EBF4FF] text-[#1863e5] px-2 py-0.5 rounded-full">{name}</span>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => onView(candidate)}
        className="mt-auto w-full bg-[#1863e5] text-white text-sm font-semibold py-2 rounded-xl hover:bg-[#1550c0] transition-colors"
      >
        Зареферить
      </button>
    </div>
  );
}

export type { Candidate };
