"use client";
import { useEffect, useRef } from "react";

interface Props {
  className?: string;
}

export default function TelegramLoginButton({ className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME!);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-auth-url", `${window.location.origin}/api/auth/telegram/callback`);
    script.setAttribute("data-request-access", "write");
    script.async = true;
    containerRef.current.appendChild(script);
  }, []);

  return <div ref={containerRef} className={className} />;
}
