export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

export async function sendAuthCodeEmail(email: string, code: string): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.error("[Email Auth] Missing RESEND_API_KEY or EMAIL_FROM");
    return { ok: false, error: "Missing RESEND_API_KEY or EMAIL_FROM" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Код входа в Рефералку",
        html: `<p>Ваш код входа: <b>${code}</b></p><p>Код действует 10 минут.</p>`,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; message?: string; error?: { message?: string } }
      | null;

    if (!response.ok) {
      const reason = payload?.error?.message ?? payload?.message ?? response.statusText;
      console.error(
        "[Email Auth] Failed to send email:",
        reason
      );
      return { ok: false, error: reason };
    }

    if (!payload?.id) {
      return { ok: false, error: "Resend returned no email id" };
    }

    return { ok: true };
  } catch (err) {
    console.error("[Email Auth] Network error:", err);
    return { ok: false, error: "Network error while sending email" };
  }
}
