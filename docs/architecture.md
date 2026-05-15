# SonaWell Platform — Architecture Record

**Date:** 2026-05-14
**Status:** Active
**Owner:** Abhishek (eng) · Sonali (content)
**Author:** Drafted by Winston (BMad System Architect) in Claude Code

## Context

The SonaWell venture (see `sonawell/CLAUDE.md`) is launching a **midlife quiz** as the
first piece of the platform and the primary lead-magnet for the B2C audience
(women 38–55). The full spec is in
`~/Downloads/SonaWell_Quiz_Questions.pdf`: 8 questions, 4 archetypes,
deterministic scoring, email gate before result, ESP tagging by archetype.

This document captures the v1 architecture decisions for the quiz app and the
broader platform monorepo as of the first build.

## Decisions

### D1. Custom build, not SaaS

Chose custom over Typeform/ScoreApp/Interact.

- **Why:** the quiz seeds Platform v0.1. Owning the code keeps us on the same
  domain, design system, and ESP integration as later apps in `04-platform`.
- **Cost:** ~2–4 evenings of build time vs. an evening on SaaS, plus the
  ongoing maintenance burden. Trade accepted because the strategic value is in
  the platform, not the lead magnet alone.

### D2. Next.js 15+ App Router, Tailwind v4, TypeScript

Stack: **Next.js 16.2** (current as of install) on the App Router, with
React 19.2, Tailwind v4, and TypeScript strict.

- **Why Next.js:** boring, well-understood, first-class on Vercel, fits the
  eventual platform without lock-in. Server Components by default keeps client
  JS small.
- **Note for future devs:** Next.js 16 changed `params` and `searchParams` to
  Promises that must be `await`ed. Global `PageProps` and `RouteContext`
  helpers are auto-generated. See
  `apps/quiz/node_modules/next/dist/docs/01-app/` for current API.

### D3. Repo location: `04-platform/apps/quiz/`

Lives inside the existing platform monorepo (its own git repo, gitignored from
the parent `ventures/`).

- **Why:** seeds the monorepo. Future apps (`apps/marketing`, `apps/dashboard`)
  go next to it. Shared code can move into `packages/` when the Rule of Three
  is met.
- **Not yet:** no workspace/turborepo config. We'll add it when the second app
  shows up — not before.

### D4. Deployment: Vercel free tier → `quiz.sonaliwellness.com`

- Connect the repo to Vercel, point it at `apps/quiz/` as the root.
- Add `quiz.sonaliwellness.com` as a custom domain.
- Strikingly site links out to the subdomain.
- Free tier handles the projected traffic easily (lead-magnet, not consumer
  app).

### D5. Email: Kit (formerly ConvertKit) via v3 API

Server-side subscribe + archetype tag on quiz submission.

- See `apps/quiz/lib/kit.ts` for env vars: `KIT_API_KEY`, `KIT_FORM_ID`, and
  one tag id per archetype.
- Kit is the **system of record** for leads. No local DB at v1.
- Local dev works without keys — the call is no-op'd with a console log.
- If Kit fails, we log and **still return success** to the user — losing a
  subscribe shouldn't block their result.

### D6. State: URL-driven flow + sessionStorage

- Quiz progress is in the URL (`/quiz/1`, `/quiz/2`, …, `/quiz/8`,
  `/email`, `/result/[archetype]`). Back-button works.
- Per-question answers persist in `sessionStorage` (`sonawell-quiz-answers`).
- No cookies, no localStorage, no DB.
- On result page navigation, sessionStorage is cleared.

### D7. Scoring is a pure function

`lib/scoring.ts:scoreAnswers(answers)` takes the raw answers and returns
`{ scores, winner, redirectUnder38 }`. No I/O, fully unit-tested in
`lib/scoring.test.ts` (12 tests covering each archetype, tie-breakers, the
under-38 path, and unknown/malformed input).

Run with `npm test`.

### D8. AI: not at runtime in v1

Per the parent `sonawell/CLAUDE.md` voice rules ("no medical claims, preserve
Sonali's exact words"), AI does **not** generate medical guidance.

- AI is used at **build time** only (this repo was scaffolded inside Claude
  Code).
- The 4 archetype result pages are hand-authored copy in
  `content/archetypes.ts` — currently placeholder, to be filled by Sonali.
- **Reserved for v2 (optional):** personalize only the result-page *intro*
  using first name + Q8 "what hasn't worked" multi-select. Hand-written
  guidance below stays untouched. Cached, bounded surface area.

### D9. Static-first rendering

All routes except `/api/submit` and `/email` (client interactivity) are
statically generated at build time. 19 routes total, 17 static, 1 dynamic,
1 client-rendered. Cheap to host, fast for users on mobile.

## Repo layout

```
04-platform/
  apps/
    quiz/                          ← this app
      app/
        layout.tsx                 ← root layout, fonts, brand bg
        page.tsx                   ← landing screen
        globals.css                ← Tailwind v4 + brand palette
        quiz/[step]/
          page.tsx                 ← server: loads question
          quiz-step-client.tsx     ← client: form, sessionStorage, routing
        email/
          page.tsx
          email-gate-client.tsx    ← client: form + /api/submit
        under-38/page.tsx
        result/[archetype]/page.tsx
        api/submit/route.ts        ← scoring + Kit
      lib/
        questions.ts               ← typed quiz data, single source of truth
        scoring.ts                 ← pure scoring fn
        scoring.test.ts            ← vitest tests (12 cases)
        state.ts                   ← sessionStorage client helpers
        kit.ts                     ← Kit/ConvertKit v3 API client
      content/
        archetypes.ts              ← Sonali-editable result copy
      package.json
      tsconfig.json
  docs/
    architecture.md                ← this file
  packages/                        ← empty, future shared code
  services/                        ← empty, future backend services
  infra/                           ← empty, future IaC
  scripts/                         ← empty
```

## Brand palette (temporary)

The PDF spec used burgundy/coral/cream. Codified in `app/globals.css` as
Tailwind theme variables until `sonawell/_brand/visual-system/` is populated.

| Token | Value | Use |
|---|---|---|
| `--color-burgundy` | `#8e2630` | Primary brand, CTAs, headings |
| `--color-burgundy-700` | `#6f1d24` | Hover state |
| `--color-coral` | `#d97757` | Accent, "Question N of 8" eyebrow |
| `--color-cream` | `#fbf6f0` | Page background |
| `--color-card` | `#f7ede7` | Selected-option card, accent surface |
| `--color-ink` | `#1a1a1a` | Body text |
| `--color-muted` | `#6b6660` | Secondary text |
| `--color-border` | `#e8dccf` | Default border |

Sonali / brand to replace once `_brand/visual-system/` ships canonical tokens.

## Open items before launch

1. **Sonali writes the 4 archetype result pages** — `5-Habit Reset` + `first 7 days`
   + `closing` per archetype. Replace `[Sonali to write — …]` placeholders in
   `content/archetypes.ts`.
2. **Sonali / Abhishek confirms YouTube redirect URL** in `app/under-38/page.tsx`
   (currently `https://www.youtube.com/@sonaliwellness` — verify).
3. **Kit account setup:** create the form, create the 4 archetype tags, grab
   the IDs, set env vars on Vercel.
4. **DNS:** add CNAME `quiz` → Vercel target on `sonaliwellness.com`.
5. **Vercel project:** import repo, set root to `apps/quiz/`, add env vars.

## Out of scope for v1

- Database / lead storage beyond Kit
- A/B testing infrastructure
- Analytics beyond Vercel Web Analytics (already free, opt-in via dashboard)
- Multi-language (Sonali's Marathi venture `sonapurna` is separate)
- Authentication / user accounts
- Result page intro personalization (reserved for v2)
- Monorepo workspace tooling (Turborepo/pnpm workspaces — wait for app #2)

## Commands

```bash
cd sonawell/04-platform/apps/quiz
npm install
npm run dev          # local at http://localhost:3000
npm test             # 12 scoring tests
npm run build        # production build
```
