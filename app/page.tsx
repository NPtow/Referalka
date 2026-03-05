"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Hero from "@/components/sections/Hero";
import CompaniesStrip from "@/components/sections/CompaniesStrip";
import HowItWorks from "@/components/sections/HowItWorks";
import ForWhom from "@/components/sections/ForWhom";
import Registration from "@/components/sections/Registration";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import { getUser } from "@/lib/auth";

const AUTH_ERRORS: Record<string, string> = {
  invalid: "Ошибка авторизации. Попробуйте ещё раз.",
  db: "Ошибка сервера. Попробуйте позже.",
};

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const saved = getUser();
    if (saved) {
      router.replace("/dashboard");
      return;
    }

    const error = searchParams.get("auth_error");
    if (error) {
      setAuthError(AUTH_ERRORS[error] ?? "Произошла ошибка. Попробуйте ещё раз.");
    }
  }, [router, searchParams]);

  return (
    <>
      {authError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
          {authError}
          <button onClick={() => setAuthError(null)} className="ml-3 text-red-400 hover:text-red-600">×</button>
        </div>
      )}
      <main>
        <Hero />
        <CompaniesStrip />
        <HowItWorks />
        <ForWhom />
        <Registration />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
