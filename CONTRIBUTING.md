# Contributing

Thanks for contributing to Flux Kontext Template.

## Ground Rules

- Keep each pull request focused on one problem.
- Prefer fixes that reduce complexity instead of adding more configuration.
- Do not commit secrets, production data, or copied `.env` files.
- Update docs when behavior, setup, or public APIs change.

## Local Setup

1. Install dependencies with `npm ci`.
2. Copy `env.example` to `.env.local`.
3. Fill in the required environment variables for Supabase, auth, and Fal.
4. Start the app with `npm run dev`.

## Before Opening A Pull Request

Run the checks that match your change:

- `npm run build`
- `npm run lint`
- `npm run check`
- `npm run test:api`

If a change cannot be fully validated locally, call that out in the PR.

## Pull Request Expectations

- Explain the problem, not just the code diff.
- Include screenshots for UI changes.
- Mention any new environment variables.
- Call out migrations, destructive actions, or rollout concerns.

## Commit Style

Conventional commits are preferred:

- `fix: ...`
- `feat: ...`
- `chore: ...`
- `docs: ...`

## Reporting Security Issues

Do not open public issues for vulnerabilities. Follow the process in
[`SECURITY.md`](SECURITY.md).
