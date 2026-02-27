import type { Metadata } from "next";
import { Inter_Tight, DM_Sans } from "next/font/google";
import "./globals.css";

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
  title: "Рефералочка — реферал в топовую IT-компанию",
  description: "Получи реферал от реального сотрудника Яндекса, Тинькофф, Озона и 50+ других компаний. Первый реферал бесплатно.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${interTight.variable} ${dmSans.variable} antialiased`} style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
