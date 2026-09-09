# Deploying the SonaWell Quiz to Vercel

**Audience:** Abhishek (eng) doing the first prod deploy.
**Target:** `https://quiz.sonaliwellness.com`
**App:** `04-platform/apps/quiz/` (Next.js 16)

Order matters: get it live on a `*.vercel.app` URL first, then add the
custom domain, then wire Resend, then point Sonali at it.

---

## Phase 0 — One-time prep (~5 min)

### 0.1 Verify the build is green locally

```bash
cd ~/Code/ventures/sonawell/04-platform/apps/quiz
npm install      # if you haven't already
npm test         # 28 tests should pass
npm run build    # should finish with no TS errors
```

If any of those fail, fix before continuing.

### 0.2 Push the platform repo to GitHub

The `04-platform` repo has no remote yet. Create one:

```bash
cd ~/Code/ventures/sonawell/04-platform

# First commit — review what's going in
git status

# Stage and commit
git add .
git commit -m "Initial commit: quiz app scaffold + architecture record"

# Create the GitHub repo (private). Requires `gh` CLI authenticated.
gh repo create sonawell-platform --private --source=. --remote=origin --push
```

If you don't use `gh`: create the repo manually at github.com, then
`git remote add origin git@github.com:<you>/sonawell-platform.git && git push -u origin main`.

---

## Phase 1 — First Vercel deploy (~5 min)

### 1.1 Import the repo

1. Go to https://vercel.com/new
2. Pick the `sonawell-platform` repo.
3. **Critical setting — Root Directory:** click "Edit" and set it to `apps/quiz`.
   Vercel will then auto-detect Next.js. Leave build command and output dir as defaults.
4. **Skip env vars for now.** Click Deploy.

You'll get a `https://sonawell-platform-<hash>.vercel.app` URL in ~60 seconds.

### 1.2 Smoke-test the preview URL

Walk the full happy path on the Vercel URL:

- [ ] Landing screen renders with the burgundy CTA
- [ ] Click "Start the Quiz" → Q1
- [ ] Pick "Under 38" → redirects to `/under-38` (skips email)
- [ ] Go back to `/`, pick 45–50, walk through Q2–Q8
- [ ] Email gate appears; submit with a test email + name
- [ ] You land on a `/result/<slug>` page (e.g. `/result/always-tired`)
- [ ] Refresh — page still renders (it's static)

If Resend isn't configured yet, `/api/submit` logs a "would have captured"
message to the Vercel function logs but still returns success. That's intentional.

---

## Phase 2 — Resend account setup (~15 min, Sonali or Abhishek)

### 2.1 Account + domain verification

1. Sign up / log in at https://resend.com.
2. **Domains → Add Domain** → `sonaliwellness.com`. Resend shows DNS records
   (SPF + DKIM) to add where the domain's DNS lives. The result email can't
   send until this verifies — contacts still get captured in the meantime.

### 2.2 Audience(s)

Audiences → Create. Minimum setup is **one audience** ("SonaWell Quiz Leads")
— its id is in the audience URL, used for `RESEND_AUDIENCE_ID`.

Optional but recommended for follow-up sequences: one audience per result
type (Resend has no tags, so a per-cohort audience is how you target a
broadcast at one result type):

| Audience name (suggested) | Used for env var |
|---|---|
| `quiz-not-myself` | `RESEND_AUDIENCE_NOT_MYSELF` |
| `quiz-always-tired` | `RESEND_AUDIENCE_ALWAYS_TIRED` |
| `quiz-overweight-and-bloated` | `RESEND_AUDIENCE_OVERWEIGHT_AND_BLOATED` |
| `quiz-dont-know-how-i-feel` | `RESEND_AUDIENCE_DONT_KNOW` |

### 2.3 API key

API Keys → Create API Key (sending access + audiences). Copy the value —
it's shown once.

### 2.4 Result email + follow-ups

The app itself sends the "here's your result" email via Resend on submit
(from `RESEND_FROM`, linking back to the result page). Follow-up sequences
are Broadcasts sent to the per-result-type audiences — Sonali's content,
scheduled from the Resend dashboard.

---

## Phase 3 — Wire env vars on Vercel (~3 min)

Project → Settings → Environment Variables. Add for **Production** (and
optionally Preview if you want preview deploys to also capture leads):

```
RESEND_API_KEY=<from 2.3>
RESEND_AUDIENCE_ID=<from 2.2>
RESEND_FROM=Sonali <sonali@sonaliwellness.com>
# optional per-cohort audiences (see 2.2)
RESEND_AUDIENCE_NOT_MYSELF=
RESEND_AUDIENCE_ALWAYS_TIRED=
RESEND_AUDIENCE_OVERWEIGHT_AND_BLOATED=
RESEND_AUDIENCE_DONT_KNOW=
```

**Redeploy** after adding vars: Deployments → latest → ⋯ → Redeploy.

Test on the `vercel.app` URL with a real email you can check. The contact
should show up in the Resend audience within a few seconds, and the result
email should arrive (once the domain is verified).

---

## Phase 4 — Custom domain (~5 min + DNS propagation)

### 4.1 Add the domain on Vercel

Project → Settings → Domains → Add Domain → `quiz.sonaliwellness.com`.

Vercel will display the CNAME target it wants (something like
`cname.vercel-dns.com`).

### 4.2 Set up DNS

Where DNS for `sonaliwellness.com` lives depends on the registrar / Strikingly
setup. Add a CNAME record:

```
Type: CNAME
Name: quiz
Value: cname.vercel-dns.com   (use the exact value Vercel shows)
TTL:   300 (or "auto")
```

Wait 5–30 minutes for propagation. Vercel will auto-provision SSL once DNS
resolves. The padlock should appear.

### 4.3 Sanity check

Visit `https://quiz.sonaliwellness.com` and walk the flow once more. Done.

---

## Phase 5 — Hand-off + iteration

### 5.1 Tell Sonali

Send her:

- The live URL: `https://quiz.sonaliwellness.com`
- The link to update copy: `apps/quiz/content/results.ts`
  (the four `[Sonali to write — …]` placeholders)
- The YouTube redirect URL TODO: `apps/quiz/app/under-38/page.tsx` line 4

### 5.2 Future deploys

Any push to `main` auto-deploys to prod. Pushes to other branches get
preview URLs Vercel comments on the PR. Sonali can review her copy edits
on a preview URL before they go live.

### 5.3 Analytics

In the Vercel project → Analytics tab → enable Web Analytics (free). Adds
a small script automatically; no code changes needed.

---

## Rollback

If a deploy breaks:

- Vercel: Deployments → previous good deploy → ⋯ → Promote to Production.
- DNS: nothing to revert — the domain still points at Vercel.

## Cost expectations

Hobby tier (free) covers:
- 100 GB bandwidth/month
- Unlimited builds & deploys
- 1 commercial-use project (this is fine — it's a single brand)

This quiz at 10K visits/month uses well under 1% of those limits.

Upgrade to Pro ($20/mo) only when you need: multiple commercial projects,
team seats, or higher build minutes. Not yet.
