export async function sendAuthCodeEmail(email: string, code: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.error("[Email Auth] Missing RESEND_API_KEY or EMAIL_FROM");
    return false;
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
      console.error(
        "[Email Auth] Failed to send email:",
        payload?.error?.message ?? payload?.message ?? response.statusText
      );
      return false;
    }

    return Boolean(payload?.id);
  } catch (err) {
    console.error("[Email Auth] Network error:", err);
    return false;
  }
}
