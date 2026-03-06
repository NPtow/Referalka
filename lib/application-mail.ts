import type { ProfileFormPayload } from "@/lib/profile-form";

type SendResult = { ok: true } | { ok: false; error: string };

function maskLongText(value: string | null, max = 2500): string {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max)}\n\n... [обрезано ${value.length - max} символов]`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatHtml(text: string | null): string {
  if (!text) return "—";
  return escapeHtml(text).replaceAll("\n", "<br/>");
}

export async function sendApplicationEmail(params: {
  candidateName: string;
  candidateEmail: string | null;
  payload: ProfileFormPayload;
  submittedAt: Date;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.APPLICATION_TO_EMAIL || "pusser.nikitaa@gmail.com";

  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is missing" };
  if (!from) return { ok: false, error: "EMAIL_FROM is missing" };

  const payload = params.payload;
  const resumeText = maskLongText(payload.resumeText);

  const html = `
    <h2>Новая заявка на реферал</h2>
    <p><b>Имя:</b> ${formatHtml(params.candidateName)}</p>
    <p><b>Email:</b> ${formatHtml(params.candidateEmail)}</p>
    <p><b>Дата:</b> ${params.submittedAt.toISOString()}</p>
    <hr />
    <p><b>Роли:</b> ${formatHtml(payload.roles.join(", "))}</p>
    <p><b>Опыт:</b> ${payload.experience} лет</p>
    <p><b>Компании:</b> ${formatHtml(payload.companies.join(", "))}</p>
    <p><b>Локация:</b> ${formatHtml(payload.location)}</p>
    <p><b>Готов к переезду:</b> ${payload.openToRelocation ? "Да" : "Нет"}</p>
    <p><b>Резюме (файл):</b> ${payload.resumeFileUrl ? `<a href="${payload.resumeFileUrl}" target="_blank" rel="noreferrer">Скачать</a>` : "—"}</p>
    <p><b>Резюме (ссылка):</b> ${payload.resumeUrl ? `<a href="${payload.resumeUrl}" target="_blank" rel="noreferrer">${payload.resumeUrl}</a>` : "—"}</p>
    <p><b>LinkedIn:</b> ${payload.linkedinUrl ? `<a href="${payload.linkedinUrl}" target="_blank" rel="noreferrer">${payload.linkedinUrl}</a>` : "—"}</p>
    <p><b>GitHub:</b> ${payload.githubUrl ? `<a href="${payload.githubUrl}" target="_blank" rel="noreferrer">${payload.githubUrl}</a>` : "—"}</p>
    <p><b>Сайт:</b> ${payload.siteUrl ? `<a href="${payload.siteUrl}" target="_blank" rel="noreferrer">${payload.siteUrl}</a>` : "—"}</p>
    <p><b>О себе:</b><br/>${formatHtml(payload.bio)}</p>
    <p><b>Текст резюме:</b><br/>${formatHtml(resumeText)}</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Новая заявка на реферал — ${params.candidateName}`,
      html,
    }),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const statusLabel = `HTTP ${response.status}`;

    if (contentType.includes("application/json")) {
      const payload = await response
        .json()
        .catch(() => null) as
        | { message?: string; error?: string; errors?: unknown }
        | null;

      const message =
        (payload && typeof payload.message === "string" && payload.message) ||
        (payload && typeof payload.error === "string" && payload.error) ||
        (payload && Array.isArray(payload.errors) && payload.errors.map((x) => String(x)).join("; ")) ||
        "";

      return { ok: false, error: message ? `${statusLabel}: ${message}` : statusLabel };
    }

    const text = await response.text().catch(() => "");
    const shortText = text.length > 400 ? `${text.slice(0, 400)}...` : text;
    return { ok: false, error: shortText ? `${statusLabel}: ${shortText}` : statusLabel };
  }

  return { ok: true };
}
