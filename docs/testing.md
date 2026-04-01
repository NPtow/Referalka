# Testing

## Commands

```bash
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Required local env

Integration and local e2e tests do not use the main `POSTGRES_URL`.

Use a dedicated local or disposable database and expose it as:

```bash
TEST_POSTGRES_URL=postgresql://postgres:postgres@127.0.0.1:5432/referalka_test?schema=public
```

The runner scripts copy `TEST_POSTGRES_URL` into `POSTGRES_URL` only for the test process.

## Email behavior in tests

Set `EMAIL_TRANSPORT_MODE=mock` for local e2e.

This is already done automatically by `npm run test:e2e`.

## Preview smoke in GitHub Actions

The preview smoke workflow runs against the Vercel deployment URL from the `deployment_status` event.

If Deployment Protection is enabled in Vercel, add the bypass secret to GitHub Actions:

- secret name: `VERCEL_AUTOMATION_BYPASS_SECRET`

The workflow sends it as `x-vercel-protection-bypass`.
