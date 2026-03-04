"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Hero from "@/components/sections/Hero";
import CompaniesStrip from "@/components/sections/CompaniesStrip";
import HowItWorks from "@/components/sections/HowItWorks";
import ForWhom from "@/components/sections/ForWhom";
import Registration from "@/components/sections/Registration";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { saveUser, getUser } from "@/lib/auth";

interface AuthedUser {
  id: number;
  firstName: string;
  profile: unknown | null;
}

export default function Home() {
  const [user, setUser] = useState<AuthedUser | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const saved = getUser();
    if (saved) setUser(saved as AuthedUser);
  }, []);

  const handleAuth = (authedUser: AuthedUser) => {
    saveUser(authedUser);
    setUser(authedUser);
    if (!authedUser.profile) {
      setShowOnboarding(true);
    }
  };

  return (
    <>
      <main>
        <Hero />
        <CompaniesStrip />
        <HowItWorks />
        <ForWhom />
        {user ? (
          <section id="registration" className="py-20 px-4 bg-[#F7FAFC]">
            <div className="max-w-md mx-auto text-center">
              <p className="text-2xl font-black text-[#171923] mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                Привет, {user.firstName}! 👋
              </p>
              <p className="text-[#718096] mb-8">Ты уже в системе. Перейди в профиль, чтобы управлять заявками.</p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1863e5] hover:bg-[#1251c0] text-white font-semibold rounded-xl transition-colors"
              >
                Перейти в профиль →
              </Link>
            </div>
          </section>
        ) : (
          <Registration onAuth={handleAuth} />
        )}
        <div id="pricing">
          <Pricing />
        </div>
        <FAQ />
      </main>
      <Footer />
      {showOnboarding && user && (
        <OnboardingModal
          userId={user.id}
          firstName={user.firstName}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
}
