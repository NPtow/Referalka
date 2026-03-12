import type { Metadata } from "next";
import { Inter_Tight, DM_Sans } from "next/font/google";
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=107181480', 'ym');
ym(107181480, 'init', {
  ssr: true,
  webvisor: true,
  clickmap: true,
  ecommerce: 'dataLayer',
  referrer: document.referrer,
  url: location.href,
  accurateTrackBounce: true,
  trackLinks: true
});`,
          }}
        />
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/107181480" style={{ position: "absolute", left: "-9999px" }} alt="" />
          </div>
        </noscript>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
