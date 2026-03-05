import type { Metadata } from "next";
import { Inter_Tight, DM_Sans } from "next/font/google";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Рефералка — реферал в топовую IT-компанию",
  description: "Получи реферал от реального сотрудника Яндекса, Тинькофф, Озона и 50+ других компаний.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${interTight.variable} ${dmSans.variable} antialiased`} style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
        <ClerkProvider>
          <header className="fixed top-3 right-4 z-[60] flex items-center gap-2 rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-sm">
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          <Navbar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
