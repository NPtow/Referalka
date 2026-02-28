"use client";
import { useState } from "react";
import Hero from "@/components/sections/Hero";
import CompaniesStrip from "@/components/sections/CompaniesStrip";
import HowItWorks from "@/components/sections/HowItWorks";
import ForWhom from "@/components/sections/ForWhom";
import CandidateFeed from "@/components/sections/CandidateFeed";
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

  return (
    <>
      <main>
        <Hero />
        <CompaniesStrip />
        <HowItWorks />
        <ForWhom />
        <CandidateFeed />
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
