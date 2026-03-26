# Referrer Intro Flow

## Purpose

This flow lets referrers and candidates connect through the site with minimal automation.

The goal is simple:

- candidate submits a profile
- referrer sees matching candidates by company overlap
- referrer clicks a button
- the system sends intro emails to both sides
- everything after that is handled manually outside the product

There is no payment, no chat, and no multi-step offer state in this version.

## Product Rules

### Candidate side

- A candidate fills in the profile on `/profile`
- A candidate must submit the application
- Only submitted candidate profiles are included in the referrer pool
- Candidate profiles are matched to referrers by company overlap only

### Referrer side

- A referrer fills in the referrer profile on `/profile`
- A referrer must have:
  - at least one company
  - at least one role
- After the referrer profile is complete, the UI shows a CTA to open `/referrer/candidates`

### Matching rules

The current logic is intentionally simple:

- include only candidate profiles with `applicationSubmittedAt != null`
- include only candidates whose `companies` intersect with referrer `companies`
- do not require role overlap for eligibility
- use roles only as context in the UI and emails

### Connection rules

- The referrer sees matching candidates on `/referrer/candidates`
- Each candidate card shows overlapping companies
- The referrer can send intro for a specific overlapping company
- A connection is deduplicated by:
  - `candidateUserId`
  - `referrerUserId`
  - `companyName`
- Repeated clicks for the same pair and company do not send duplicate emails

## Main UX

### Candidate profile

File: [`app/profile/ProfileClient.tsx`](/Users/NIKITA/Downloads/referalocka/app/profile/ProfileClient.tsx)

What matters here:

- candidate submits the application from `/profile`
- after submit, the application is saved and candidate-side email flow is triggered

### Referrer profile

File: [`app/profile/ProfileClient.tsx`](/Users/NIKITA/Downloads/referalocka/app/profile/ProfileClient.tsx)

What matters here:

- referrer enters companies they can refer into
- referrer enters one or more roles
- once complete, the page shows a CTA to open `/referrer/candidates`

### Referrer candidate pool

File: [`app/referrer/candidates/page.tsx`](/Users/NIKITA/Downloads/referalocka/app/referrer/candidates/page.tsx)

This page:

- fetches `/api/referrer/candidates`
- renders only candidates matching the current referrer by company
- shows:
  - name
  - roles
  - experience
  - overlapping companies
  - links to resume / LinkedIn / GitHub / site when present
- hides direct contacts in the UI
- sends intro through the backend when the referrer clicks the company button

## Backend

### Candidate submit API

File: [`app/api/profile/submit/route.ts`](/Users/NIKITA/Downloads/referalocka/app/api/profile/submit/route.ts)

Responsibilities:

- validate submitted candidate profile
- upsert the profile
- send the internal application email
- mark `applicationSubmittedAt`
- optionally notify matching referrers by email when:
  - this is the first submission
  - or the company list changed

### Referrer candidates API

File: [`app/api/referrer/candidates/route.ts`](/Users/NIKITA/Downloads/referalocka/app/api/referrer/candidates/route.ts)

Responsibilities:

- load the current authenticated referrer
- resolve referrer companies and roles
- fetch submitted candidate profiles with company overlap
- load already-sent connections
- calculate:
  - `sharedCompanies`
  - `availableCompanies`
  - `connectedCompanies`

### Referrer connections API

File: [`app/api/referrer/connections/route.ts`](/Users/NIKITA/Downloads/referalocka/app/api/referrer/connections/route.ts)

Responsibilities:

- validate candidate and selected company
- verify company overlap
- create or reuse a deduplicated `ReferralConnection`
- send intro emails to both sides
- store `introEmailSentAt`

## Email Flow

File: [`lib/referral-mail.ts`](/Users/NIKITA/Downloads/referalocka/lib/referral-mail.ts)

The project uses Resend over HTTP API.

Current email scenarios:

1. Candidate submitted profile and matching referrers exist
2. Referrer clicked intro for a specific candidate and company

Current behavior:

- matching-referrer email goes to referrers when a candidate submits or updates target companies
- intro email goes to both candidate and referrer
- contacts are revealed in email, not in the page UI

Related existing file:

- [`lib/application-mail.ts`](/Users/NIKITA/Downloads/referalocka/lib/application-mail.ts)

## Data Model

### Updated model

File: [`prisma/schema.prisma`](/Users/NIKITA/Downloads/referalocka/prisma/schema.prisma)

Important models:

- `Profile`
- `Referrer`
- `ReferralConnection`

### ReferralConnection

This table logs intro actions.

Fields:

- `id`
- `candidateUserId`
- `candidateProfileId`
- `referrerUserId`
- `referrerId`
- `companyName`
- `introEmailSentAt`
- `createdAt`

Unique key:

- `[candidateUserId, referrerUserId, companyName]`

### Migration

File: [`prisma/migrations/20260326120000_add_referral_connections/migration.sql`](/Users/NIKITA/Downloads/referalocka/prisma/migrations/20260326120000_add_referral_connections/migration.sql)

This migration:

- adds `shareWithMatchingReferrers` to `Profile`
- creates `ReferralConnection`

Note:

- the current company-based matching no longer requires the consent flag for visibility in the referrer pool
- the column is still present in the schema because it already exists in the database

## Matching Helpers

File: [`lib/referral-matching.ts`](/Users/NIKITA/Downloads/referalocka/lib/referral-matching.ts)

Helpers are responsible for:

- normalizing company and role values
- resolving legacy single-value and new array-based fields
- comparing strings case-insensitively
- intersecting company lists

## Manual Test Checklist

### Candidate

1. Log in as a candidate
2. Open `/profile`
3. Fill roles, companies, experience, and resume
4. Submit the application
5. Confirm that the application succeeds

### Referrer

1. Log in as a referrer
2. Open `/profile`
3. Fill at least one company and one role
4. Open `/referrer/candidates`
5. Confirm that candidates with overlapping companies appear
6. Click `Связаться по <компания>`
7. Confirm success toast and that the company moves into `Уже отправили intro`
8. Click the same company again and confirm it does not create a duplicate intro

## Operational Notes

- This flow is designed to be simple and reliable
- Company overlap is the only hard matching rule
- All post-intro coordination is manual
- Existing `ReferralRequest` flow remains separate and is not replaced by this flow

## Known Follow-ups

These are optional future improvements, not part of the current v1:

- add admin visibility into sent intros
- add a dashboard block for sent connections
- add better referrer-side sorting and filters
- add candidate-side visibility that an intro was already sent
