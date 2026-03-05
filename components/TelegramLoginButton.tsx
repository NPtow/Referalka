"use client";
import { useEffect, useRef } from "react";

interface Props {
  className?: string;
}

export default function TelegramLoginButton({ className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register global callback for Telegram OIDC widget
    (window as any).onTelegramAuth = async (data: { id_token?: string; error?: string }) => {
      if (data.error || !data.id_token) {
        window.location.href = "/?auth_error=invalid";
        return;
      }
      // POST id_token to our callback API
      const res = await fetch("/api/auth/telegram/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: data.id_token }),
      });
      const result = await res.json();
      if (result.redirect) {
        window.location.href = result.redirect;
      } else {
        window.location.href = "/?auth_error=invalid";
      }
    };

    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://oauth.telegram.org/js/telegram-login.js?3";
    script.setAttribute("data-client-id", process.env.NEXT_PUBLIC_TELEGRAM_CLIENT_ID!);
    script.setAttribute("data-onauth", "onTelegramAuth(data)");
    script.setAttribute("data-request-access", "write");
    script.async = true;
    containerRef.current.appendChild(script);

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
