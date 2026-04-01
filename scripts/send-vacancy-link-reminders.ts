import { loadEnvConfig } from "@next/env";
import { prisma } from "../lib/prisma";
import {
  getMissingVacancyLinkCompanies,
  normalizeVacancyLinks,
} from "../lib/profile-form";

loadEnvConfig(process.cwd());

type Step = "1" | "2" | "3";

type Args = {
  step: Step;
  dryRun: boolean;
  limit: number | null;
  batchSize: number;
  pauseMs: number;
  onlyEmail: string | null;
  overrideTo: string | null;
};

type Recipient = {
  userId: number;
  firstName: string;
  email: string;
  companies: string[];
  missingCompanies: string[];
  submittedAt: Date;
};

const PROFILE_URL =
  process.env.VACANCY_LINK_REMINDER_PROFILE_URL?.trim() ||
  "https://referalka.tech/profile";

function parseArgs(argv: string[]): Args {
  const args: Args = {
    step: "1",
    dryRun: false,
    limit: null,
    batchSize: 1,
    pauseMs: 350,
    onlyEmail: null,
    overrideTo: null,
  };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (arg.startsWith("--step=")) {
      const value = arg.slice("--step=".length);
      if (value === "1" || value === "2" || value === "3") {
        args.step = value;
        continue;
      }
      throw new Error(`Unsupported step value: ${value}`);
    }

    if (arg.startsWith("--limit=")) {
      const value = Number(arg.slice("--limit=".length));
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid limit value: ${arg}`);
      }
      args.limit = Math.floor(value);
      continue;
    }

    if (arg.startsWith("--batch-size=")) {
      const value = Number(arg.slice("--batch-size=".length));
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid batch size value: ${arg}`);
      }
      args.batchSize = Math.floor(value);
      continue;
    }

    if (arg.startsWith("--pause-ms=")) {
      const value = Number(arg.slice("--pause-ms=".length));
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`Invalid pause value: ${arg}`);
      }
      args.pauseMs = Math.floor(value);
      continue;
    }

    if (arg.startsWith("--only-email=")) {
      args.onlyEmail = arg.slice("--only-email=".length).trim().toLowerCase() || null;
      continue;
    }

    if (arg.startsWith("--override-to=")) {
      args.overrideTo = arg.slice("--override-to=".length).trim().toLowerCase() || null;
      continue;
    }

    if (arg === "--help") {
      printHelpAndExit();
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelpAndExit(): never {
  console.log(`
Usage:
  npm run email:vacancy-links -- --step=1 --dry-run
  npm run email:vacancy-links -- --step=1 --override-to=you@example.com --limit=3
  npm run email:vacancy-links -- --step=2 --batch-size=20

Options:
  --step=1|2|3        Which email template to send
  --dry-run           Print recipients without sending emails
  --limit=N           Limit number of recipients
  --batch-size=N      Number of emails per batch (default: 1)
  --pause-ms=N        Pause between batches in milliseconds (default: 350)
  --only-email=...    Restrict run to a single recipient email
  --override-to=...   Send selected emails to one address instead of real recipients
  --help              Show this help
`.trim());
  process.exit(0);
}

function isEmail(value: string | null | undefined): value is string {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatMissingCompanies(companies: string[]): string {
  return companies.map((company) => `<li>${escapeHtml(company)}</li>`).join("");
}

function renderTemplate(step: Step, recipient: Recipient) {
  const greetingName = recipient.firstName || recipient.email.split("@")[0] || "привет";
  const missingCompaniesHtml = formatMissingCompanies(recipient.missingCompanies);

  if (step === "1") {
    return {
      subject: "Добавь ссылки на вакансии в профиль на Referalka",
      html: `
        <p>Привет, ${escapeHtml(greetingName)}!</p>
        <p>Мы продолжаем работу по твоей заявке на Referalka, и для следующего шага нам не хватает ссылок на вакансии, на которые ты хочешь получить реферал.</p>
        <p>Пожалуйста, зайди в профиль и добавь ссылки в блок <b>«Ссылки на вакансии»</b>:</p>
        <p><a href="${escapeHtml(PROFILE_URL)}" target="_blank" rel="noreferrer">${escapeHtml(PROFILE_URL)}</a></p>
        <p>Сейчас не заполнены ссылки по этим компаниям:</p>
        <ul>${missingCompaniesHtml}</ul>
        <p>Что нужно сделать:</p>
        <ul>
          <li>открыть профиль</li>
          <li>для каждой выбранной компании добавить ссылку на конкретную вакансию</li>
          <li>проверить, что ссылки открываются корректно</li>
        </ul>
        <p>Без этих ссылок нам сложнее передавать профиль дальше подходящим реферам.</p>
        <p>Спасибо!<br/>Referalka</p>
      `.trim(),
    };
  }

  if (step === "2") {
    return {
      subject: "Напоминание: добавь ссылки на вакансии в профиль",
      html: `
        <p>Привет, ${escapeHtml(greetingName)}!</p>
        <p>Напоминаем, что в твоём профиле на Referalka ещё не заполнен блок <b>«Ссылки на вакансии»</b>.</p>
        <p>Чтобы мы могли продолжить движение по заявке, пожалуйста, добавь ссылки на конкретные вакансии по выбранным компаниям:</p>
        <p><a href="${escapeHtml(PROFILE_URL)}" target="_blank" rel="noreferrer">${escapeHtml(PROFILE_URL)}</a></p>
        <p>Сейчас не заполнены ссылки по этим компаниям:</p>
        <ul>${missingCompaniesHtml}</ul>
        <p>Если ты уже всё заполнил, ничего делать не нужно.</p>
        <p>Спасибо!<br/>Referalka</p>
      `.trim(),
    };
  }

  return {
    subject: "Последнее напоминание по ссылкам на вакансии",
    html: `
      <p>Привет, ${escapeHtml(greetingName)}!</p>
      <p>Это последнее напоминание: по твоей заявке на Referalka всё ещё не хватает ссылок на вакансии.</p>
      <p>Пока ссылки не добавлены, анкета остаётся неполной, и нам сложнее передавать её дальше реферам.</p>
      <p>Профиль здесь:</p>
      <p><a href="${escapeHtml(PROFILE_URL)}" target="_blank" rel="noreferrer">${escapeHtml(PROFILE_URL)}</a></p>
      <p>Сейчас не заполнены ссылки по этим компаниям:</p>
      <ul>${missingCompaniesHtml}</ul>
      <p>Если сейчас это уже неактуально, письмо можно просто проигнорировать.</p>
      <p>Спасибо!<br/>Referalka</p>
    `.trim(),
  };
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey) throw new Error("RESEND_API_KEY is missing");
  if (!from) throw new Error("EMAIL_FROM is missing");

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
    return;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = await response.json().catch(() => null) as
      | { message?: string; error?: string }
      | null;
    throw new Error(payload?.message || payload?.error || `HTTP ${response.status}`);
  }

  const text = await response.text().catch(() => "");
  throw new Error(text || `HTTP ${response.status}`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadRecipients(args: Args): Promise<Recipient[]> {
  const profiles = await prisma.profile.findMany({
    where: {
      applicationSubmittedAt: { not: null },
    },
    select: {
      userId: true,
      companies: true,
      vacancyLinks: true,
      applicationSubmittedAt: true,
      user: {
        select: {
          firstName: true,
          username: true,
        },
      },
    },
    orderBy: {
      applicationSubmittedAt: "desc",
    },
  });

  const recipients = profiles
    .map((profile) => {
      const email = profile.user.username?.trim().toLowerCase() || null;
      if (!isEmail(email) || !profile.applicationSubmittedAt) return null;

      const companies = profile.companies ?? [];
      const vacancyLinks = normalizeVacancyLinks(profile.vacancyLinks, companies);
      const missingCompanies = getMissingVacancyLinkCompanies(companies, vacancyLinks);

      if (!companies.length || !missingCompanies.length) return null;

      return {
        userId: profile.userId,
        firstName: profile.user.firstName?.trim() || "",
        email,
        companies,
        missingCompanies,
        submittedAt: profile.applicationSubmittedAt,
      } satisfies Recipient;
    })
    .filter((recipient): recipient is Recipient => Boolean(recipient));

  const filtered = args.onlyEmail
    ? recipients.filter((recipient) => recipient.email === args.onlyEmail)
    : recipients;

  return args.limit ? filtered.slice(0, args.limit) : filtered;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const recipients = await loadRecipients(args);

  if (!recipients.length) {
    console.log("Нет получателей для этой рассылки.");
    return;
  }

  console.log(`Шаг рассылки: ${args.step}`);
  console.log(`Режим: ${args.dryRun ? "dry-run" : "send"}`);
  console.log(`Получателей: ${recipients.length}`);

  console.table(
    recipients.map((recipient) => ({
      userId: recipient.userId,
      firstName: recipient.firstName,
      email: recipient.email,
      missingCompanies: recipient.missingCompanies.join(" | "),
      submittedAt: recipient.submittedAt.toISOString(),
      sendTo: args.overrideTo ?? recipient.email,
    })),
  );

  if (args.dryRun) {
    return;
  }

  let sent = 0;
  let failed = 0;

  for (let index = 0; index < recipients.length; index += args.batchSize) {
    const batch = recipients.slice(index, index + args.batchSize);

    const results = await Promise.allSettled(
      batch.map(async (recipient) => {
        const message = renderTemplate(args.step, recipient);
        const to = args.overrideTo ?? recipient.email;
        await sendEmail({
          to,
          subject: message.subject,
          html: message.html,
        });
      }),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        sent += 1;
      } else {
        failed += 1;
        console.error("[vacancy-link-reminder]", result.reason);
      }
    }

    console.log(
      `Обработан батч ${Math.floor(index / args.batchSize) + 1}: sent=${sent}, failed=${failed}`,
    );

    if (index + args.batchSize < recipients.length && args.pauseMs > 0) {
      await sleep(args.pauseMs);
    }
  }

  console.log(`Готово: sent=${sent}, failed=${failed}`);
}

main()
  .catch((error) => {
    console.error("[send-vacancy-link-reminders]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
