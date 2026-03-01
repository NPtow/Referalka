"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/sections/Hero";
import CompaniesStrip from "@/components/sections/CompaniesStrip";
import HowItWorks from "@/components/sections/HowItWorks";
import ForWhom from "@/components/sections/ForWhom";
import Registration from "@/components/sections/Registration";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { saveUser } from "@/lib/auth";

interface AuthedUser {
  id: number;
  firstName: string;
  profile: unknown | null;
}

export default function Home() {
  const [user, setUser] = useState<AuthedUser | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleAuth = (authedUser: AuthedUser) => {
    saveUser(authedUser);
    setUser(authedUser);
    if (!authedUser.profile) {
      setShowOnboarding(true);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("auth_success")) {
      const raw = document.cookie.split(";").find((c) => c.trim().startsWith("tg_auth="));
      if (raw) {
        const userData = JSON.parse(decodeURIComponent(raw.split("=").slice(1).join("=")));
        handleAuth(userData);
        document.cookie = "tg_auth=; path=/; max-age=0";
      }
      window.history.replaceState({}, "", "/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <main>
        <Hero />
        <CompaniesStrip />
        <HowItWorks />
        <ForWhom />
        <Registration onAuth={handleAuth} />
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
