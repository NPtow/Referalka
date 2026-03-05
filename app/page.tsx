"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Hero from "@/components/sections/Hero";
import CompaniesStrip from "@/components/sections/CompaniesStrip";
import HowItWorks from "@/components/sections/HowItWorks";
import ForWhom from "@/components/sections/ForWhom";
import Registration from "@/components/sections/Registration";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import { getUser } from "@/lib/auth";

interface AuthedUser {
  id: number;
  firstName: string;
  profile: unknown | null;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<AuthedUser | null>(null);

  useEffect(() => {
    const saved = getUser();
    if (saved) {
      router.replace("/dashboard");
      return;
    }
    setUser(null);
  }, [router]);

  return (
    <>
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
