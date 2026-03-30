# LLM Context for Referalka

## Project name

- Product: `Referalka`
- Main domain: `referalka.tech`

## What the product does

`Referalka` is a referral marketplace for candidates and referrers.

There are two main user roles:
- `Candidate`: fills out a profile, selects target companies and roles, uploads a resume, and submits an application for referral help.
- `Referrer`: fills out a referrer profile with companies and roles where they can refer people.

The product matches candidates and referrers mostly by company overlap.

## Current production logic

### Candidate flow

1. User signs up.
2. User fills out candidate profile.
3. User submits profile.
4. Submitted profiles are considered active referral applications.

Important:
- Current operational definition of “user submitted a referral request” is:
  `Profile.applicationSubmittedAt != null`
- Legacy `ReferralRequest` table exists, but in current live flow it is not the main source of truth.

### Referrer flow

1. User signs up.
2. User switches profile mode to referrer.
3. User fills:
   - companies where they can refer
   - roles / directions
   - Telegram / LinkedIn if available
4. After profile completion, referrer can open a page with matching candidates.

### Matching logic

Current matching is intentionally simple:
- candidates must have `applicationSubmittedAt != null`
- referrer and candidate must share at least one company
- role overlap is shown as context but is not the hard filter

### Manual approval flow for paid introductions

Current intended flow:

1. Referrer clicks “connect” on a candidate.
2. System creates a `ReferralConnection` with status `PENDING_PAYMENT`.
3. Candidate gets an email:
   - a match was found
   - pay manually
   - contact admin for payment confirmation
4. Admin gets an email with approve link.
5. After payment is confirmed manually, admin opens the approve link.
6. Only then does the system send final intro emails with contact details to both sides.

This is intentionally manual. Payment is **not** automated.

## Core entities

### `User`

Application-level user.

Key fields:
- `id`
- `betterAuthUserId`
- `username` (used as email in current flow)
- `firstName`

### `Profile`

Candidate profile.

Important fields:
- `companies`
- `roles`
- `role`
- `experience`
- `resumeText`
- `resumeUrl`
- `resumeFileUrl`
- `telegramContact`
- `linkedinUrl`
- `githubUrl`
- `siteUrl`
- `bio`
- `summary`
- `applicationSubmittedAt`

### `Referrer`

Referrer profile.

Important fields:
- `company`
- `companies`
- `role`
- `roles`
- `telegramContact`
- `linkedinUrl`

### `ReferralConnection`

Manual intro / paid approval entity.

Important fields:
- `candidateUserId`
- `candidateProfileId`
- `referrerUserId`
- `referrerId`
- `companyName`
- `status`
- `adminApprovalToken`
- `paymentRequestEmailSentAt`
- `adminApprovedAt`
- `introEmailSentAt`

Statuses currently used:
- `PENDING_PAYMENT`
- `APPROVED`

## Important routes and pages

### Candidate-facing

- `/profile`
  Candidate profile form and submission

### Referrer-facing

- `/profile`
  Referrer profile editing also happens here
- `/referrer/candidates`
  Referrer candidate pool

### API

- `/api/profile`
  Candidate profile read/update
- `/api/profile/submit`
  Candidate application submit
- `/api/referrer`
  Referrer profile read/update
- `/api/referrer/candidates`
  Matching candidate pool for referrer
- `/api/referrer/connections`
  Creates `ReferralConnection` in pending state
- `/api/admin/referral-connections/approve`
  Final admin approval endpoint

### Admin / operational

- `/admin/candidates`
  Admin page for candidate list using `ADMIN_SECRET`
- `/admin/referral-connections/approve?token=...`
  Approval page used from admin email

## Email behavior

Email sending is done through `Resend`.

Important env vars:
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `APPLICATION_TO_EMAIL`
- `REFERRAL_ADMIN_EMAIL`
- `REFERRAL_PAYMENT_CONTACT`

Rules:
- `EMAIL_FROM` must be a sender on verified domain
- current verified domain used operationally: `referalka.tech`
- if `403` appears from Resend, first verify the real runtime sender in logs

## Auth and infra

- Auth stack: `better-auth`
- Frontend/backend: `Next.js`
- Database: `Postgres` via Prisma
- File storage: Vercel Blob
- Deployments: Vercel

## Analytics and tracking

Currently present:
- `Yandex Metrika`
- `Vercel Speed Insights`
- `ProfileView` records in DB for marketplace profile views

There is **no** full product event log yet for all user actions.

## Important business truths

- A submitted candidate application is not the same as a completed successful intro.
- Contacts should not be revealed before manual approval.
- Manual approval is preferred over parsing reply emails.
- Current product favors operational simplicity over full automation.

## Existing docs worth reading first

- `README.md`
- `docs/referrer-intro-flow.md`
- `docs/testing.md`

## Recommended mental model for another AI

When reasoning about this codebase, assume:

- `Profile.applicationSubmittedAt` is the main candidate application signal
- company overlap is the main matching rule
- operational workflows are intentionally manual
- admin approval is the gate before contact reveal
- avoid adding heavy automation unless explicitly requested
