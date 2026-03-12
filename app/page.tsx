import Hero from "@/components/sections/Hero";
import CompaniesStrip from "@/components/sections/CompaniesStrip";
import HowItWorks from "@/components/sections/HowItWorks";
import ForWhom from "@/components/sections/ForWhom";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import { getBetterAuthSession } from "@/lib/auth-session";

export default async function Home() {
  const session = await getBetterAuthSession();

  return (
    <>
      <main>
        <Hero isSignedIn={Boolean(session?.user.email)} />
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
