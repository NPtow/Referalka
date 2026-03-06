"use client";
import Hero from "@/components/sections/Hero";
import CompaniesStrip from "@/components/sections/CompaniesStrip";
import HowItWorks from "@/components/sections/HowItWorks";
import ForWhom from "@/components/sections/ForWhom";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <CompaniesStrip />
        <HowItWorks />
        <ForWhom />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
