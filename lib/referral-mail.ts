import type { ProfileFormPayload } from "@/lib/profile-form";
import { getAppBaseUrl } from "@/lib/app-url";

type SendResult = { ok: true } | { ok: false; error: string };

function isMockEmailTransportEnabled(): boolean {
  return process.env.EMAIL_TRANSPORT_MODE === "mock";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatText(value: string | null | undefined): string {
  if (!value) return "—";
  return escapeHtml(value).replaceAll("\n", "<br/>");
}

function link(label: string, href: string | null | undefined): string {
  if (!href) return "—";
  const safeHref = escapeHtml(href);
  return `<a href="${safeHref}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
}

function isEmail(value: string | null | undefined): value is string {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

function getReferralAdminEmail(): string | null {
  const value = process.env.REFERRAL_ADMIN_EMAIL || process.env.APPLICATION_TO_EMAIL || null;
  return isEmail(value) ? value : null;
}

function getReferralPaymentContact(): string {
  return process.env.REFERRAL_PAYMENT_CONTACT || getReferralAdminEmail() || "напишите администратору сервиса";
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  if (isMockEmailTransportEnabled()) {
    return { ok: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is missing" };
  if (!from) return { ok: false, error: "EMAIL_FROM is missing" };
  if (!isEmail(params.to)) return { ok: false, error: `Invalid email recipient: ${params.to}` };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (response.ok) {
    return { ok: true };
  }

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

export async function sendMatchingCandidateEmailToReferrer(params: {
  referrerName: string;
  referrerEmail: string;
  candidateName: string;
  candidateProfileUrl: string;
  sharedCompanies: string[];
  payload: ProfileFormPayload;
}): Promise<SendResult> {
  const html = `
    <h2>Появился подходящий кандидат</h2>
    <p>Привет, ${formatText(params.referrerName)}.</p>
    <p>На Рефералке появился кандидат, которому ты потенциально можешь помочь.</p>
    <hr />
    <p><b>Имя:</b> ${formatText(params.candidateName)}</p>
    <p><b>Роли:</b> ${formatText(params.payload.roles.join(", "))}</p>
    <p><b>Опыт:</b> ${params.payload.experience} лет</p>
    <p><b>Хочет попасть в:</b> ${formatText(params.payload.companies.join(", "))}</p>
    <p><b>Совпадающие компании:</b> ${formatText(params.sharedCompanies.join(", "))}</p>
    <p><b>Локация:</b> ${formatText(params.payload.location)}</p>
    <p><b>О себе:</b><br/>${formatText(params.payload.bio)}</p>
    <p><b>Резюме:</b> ${params.payload.resumeFileUrl ? link("Файл", params.payload.resumeFileUrl) : params.payload.resumeUrl ? link("Ссылка", params.payload.resumeUrl) : "Внутри профиля"}</p>
    <p><a href="${escapeHtml(params.candidateProfileUrl)}" target="_blank" rel="noreferrer">Открыть подходящих кандидатов</a></p>
  `;

  return sendEmail({
    to: params.referrerEmail,
    subject: `Новый кандидат на реферал — ${params.candidateName}`,
    html,
  });
}

export async function sendReferralMatchPendingEmails(params: {
  approvalToken: string;
  companyName: string;
  candidate: {
    name: string;
    email: string;
    telegramContact: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    siteUrl: string | null;
    experience: number;
    roles: string[];
    companies: string[];
    bio: string | null;
    resumeUrl: string | null;
    resumeFileUrl: string | null;
  };
  referrer: {
    name: string;
    email: string;
    telegramContact: string | null;
    linkedinUrl: string | null;
    roles: string[];
    companies: string[];
  };
}): Promise<SendResult> {
  if (!isEmail(params.candidate.email)) {
    return { ok: false, error: "У кандидата нет корректного email." };
  }

  const adminEmail = getReferralAdminEmail();
  if (!adminEmail) {
    return { ok: false, error: "REFERRAL_ADMIN_EMAIL или APPLICATION_TO_EMAIL не настроен." };
  }

  const paymentContact = getReferralPaymentContact();
  const approveUrl = `${getAppBaseUrl()}/admin/referral-connections/approve?token=${encodeURIComponent(params.approvalToken)}`;

  const candidateHtml = `
    <h2>Мы нашли тебе подходящего рефера</h2>
    <p>Появился мэтч по компании <b>${formatText(params.companyName)}</b>.</p>
    <p>Рефер уже подтвердил готовность помочь, но контакты мы откроем только после ручного апрува.</p>
    <hr />
    <p><b>Рефер:</b> ${formatText(params.referrer.name)}</p>
    <p><b>Направления:</b> ${formatText(params.referrer.roles.join(", "))}</p>
    <p><b>Компании:</b> ${formatText(params.referrer.companies.join(", "))}</p>
    <p><b>Как оплатить:</b> свяжись по ${formatText(paymentContact)} и подтвердим оплату вручную.</p>
    <p><b>Если нужен человек:</b> ${formatText(adminEmail)}</p>
    <p>После подтверждения оплаты мы пришлём контакты обеим сторонам отдельным письмом.</p>
  `;

  const adminHtml = `
    <h2>Новый мэтч ожидает оплату</h2>
    <p>Рефер откликнулся на кандидата по компании <b>${formatText(params.companyName)}</b>.</p>
    <hr />
    <p><b>Кандидат:</b> ${formatText(params.candidate.name)}</p>
    <p><b>Email кандидата:</b> ${formatText(params.candidate.email)}</p>
    <p><b>Telegram кандидата:</b> ${formatText(params.candidate.telegramContact)}</p>
    <p><b>Роли кандидата:</b> ${formatText(params.candidate.roles.join(", "))}</p>
    <p><b>Опыт:</b> ${params.candidate.experience} лет</p>
    <p><b>Компании кандидата:</b> ${formatText(params.candidate.companies.join(", "))}</p>
    <p><b>Резюме кандидата:</b> ${params.candidate.resumeFileUrl ? link("Файл", params.candidate.resumeFileUrl) : params.candidate.resumeUrl ? link("Ссылка", params.candidate.resumeUrl) : "—"}</p>
    <hr />
    <p><b>Рефер:</b> ${formatText(params.referrer.name)}</p>
    <p><b>Email рефера:</b> ${formatText(params.referrer.email)}</p>
    <p><b>Telegram рефера:</b> ${formatText(params.referrer.telegramContact)}</p>
    <p><b>LinkedIn рефера:</b> ${params.referrer.linkedinUrl ? link(params.referrer.linkedinUrl, params.referrer.linkedinUrl) : "—"}</p>
    <p><b>Направления рефера:</b> ${formatText(params.referrer.roles.join(", "))}</p>
    <p><b>Компании рефера:</b> ${formatText(params.referrer.companies.join(", "))}</p>
    <p><a href="${escapeHtml(approveUrl)}" target="_blank" rel="noreferrer">Открыть страницу апрува</a></p>
  `;

  const [candidateResult, adminResult] = await Promise.all([
    sendEmail({
      to: params.candidate.email,
      subject: `Нашли мэтч по ${params.companyName} — нужен ручной апрув`,
      html: candidateHtml,
    }),
    sendEmail({
      to: adminEmail,
      subject: `Новый мэтч ожидает оплату — ${params.companyName}`,
      html: adminHtml,
    }),
  ]);

  if (!candidateResult.ok) return candidateResult;
  if (!adminResult.ok) return adminResult;
  return { ok: true };
}

export async function sendReferralIntroEmails(params: {
  companyName: string;
  candidate: {
    name: string;
    email: string;
    telegramContact: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    siteUrl: string | null;
    experience: number;
    roles: string[];
    companies: string[];
    bio: string | null;
    resumeUrl: string | null;
    resumeFileUrl: string | null;
  };
  referrer: {
    name: string;
    email: string;
    telegramContact: string | null;
    linkedinUrl: string | null;
    roles: string[];
    companies: string[];
  };
}): Promise<SendResult> {
  if (!isEmail(params.candidate.email)) {
    return { ok: false, error: "У кандидата нет корректного email." };
  }

  if (!isEmail(params.referrer.email)) {
    return { ok: false, error: "У рефера нет корректного email." };
  }

  const dashboardUrl = `${getAppBaseUrl()}/referrer/candidates`;

  const candidateHtml = `
    <h2>Оплата подтверждена, отправляем контакты</h2>
    <p>Апрув по компании <b>${formatText(params.companyName)}</b> подтверждён. Ниже контакты твоего рефера.</p>
    <hr />
    <p><b>Рефер:</b> ${formatText(params.referrer.name)}</p>
    <p><b>Email:</b> ${formatText(params.referrer.email)}</p>
    <p><b>Telegram:</b> ${formatText(params.referrer.telegramContact)}</p>
    <p><b>LinkedIn:</b> ${params.referrer.linkedinUrl ? link(params.referrer.linkedinUrl, params.referrer.linkedinUrl) : "—"}</p>
    <p><b>Направления:</b> ${formatText(params.referrer.roles.join(", "))}</p>
    <p><b>Компании:</b> ${formatText(params.referrer.companies.join(", "))}</p>
    <p>Дальше вы можете договориться напрямую в почте или Telegram.</p>
  `;

  const referrerHtml = `
    <h2>Апрув подтверждён, можно знакомить кандидата</h2>
    <p>Оплата по компании <b>${formatText(params.companyName)}</b> подтверждена. Ниже контакты кандидата.</p>
    <hr />
    <p><b>Кандидат:</b> ${formatText(params.candidate.name)}</p>
    <p><b>Email:</b> ${formatText(params.candidate.email)}</p>
    <p><b>Telegram:</b> ${formatText(params.candidate.telegramContact)}</p>
    <p><b>Роли:</b> ${formatText(params.candidate.roles.join(", "))}</p>
    <p><b>Опыт:</b> ${params.candidate.experience} лет</p>
    <p><b>Компании:</b> ${formatText(params.candidate.companies.join(", "))}</p>
    <p><b>О себе:</b><br/>${formatText(params.candidate.bio)}</p>
    <p><b>LinkedIn:</b> ${params.candidate.linkedinUrl ? link(params.candidate.linkedinUrl, params.candidate.linkedinUrl) : "—"}</p>
    <p><b>GitHub:</b> ${params.candidate.githubUrl ? link(params.candidate.githubUrl, params.candidate.githubUrl) : "—"}</p>
    <p><b>Сайт:</b> ${params.candidate.siteUrl ? link(params.candidate.siteUrl, params.candidate.siteUrl) : "—"}</p>
    <p><b>Резюме:</b> ${params.candidate.resumeFileUrl ? link("Файл", params.candidate.resumeFileUrl) : params.candidate.resumeUrl ? link("Ссылка", params.candidate.resumeUrl) : "В профиле кандидата"}</p>
    <p><a href="${escapeHtml(dashboardUrl)}" target="_blank" rel="noreferrer">Открыть список кандидатов</a></p>
  `;

  const [candidateResult, referrerResult] = await Promise.all([
    sendEmail({
      to: params.candidate.email,
      subject: `Тебя готовы порефералить в ${params.companyName}`,
      html: candidateHtml,
    }),
    sendEmail({
      to: params.referrer.email,
      subject: `Интро с кандидатом по ${params.companyName}`,
      html: referrerHtml,
    }),
  ]);

  if (!candidateResult.ok) return candidateResult;
  if (!referrerResult.ok) return referrerResult;
  return { ok: true };
}
