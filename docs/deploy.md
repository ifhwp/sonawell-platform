# Deploying the SonaWell Quiz to Vercel

**Audience:** Abhishek (eng) doing the first prod deploy.
**Target:** `https://quiz.sonaliwellness.com`
**App:** `04-platform/apps/quiz/` (Next.js 16)

Order matters: get it live on a `*.vercel.app` URL first, then add the
custom domain, then wire Kit, then point Sonali at it.

---

## Phase 0 — One-time prep (~5 min)

### 0.1 Verify the build is green locally

```bash
cd ~/Code/ventures/sonawell/04-platform/apps/quiz
npm install      # if you haven't already
npm test         # 12 tests should pass
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
- [ ] You land on a `/result/<archetype>` page
- [ ] Refresh — page still renders (it's static)

If Kit isn't configured yet, `/api/submit` logs a "would have subscribed"
message to the Vercel function logs but still returns success. That's intentional.

---

## Phase 2 — Kit (ConvertKit) account setup (~15 min, Sonali or Abhishek)

### 2.1 Account + form

1. Sign up / log in at https://app.kit.com.
2. **Create a form** named "SonaWell Midlife Quiz". Inline or pop-up doesn't matter
   — we use it as a subscribe target, not as a public form. Grab the numeric form id
   from its URL (e.g. `kit.com/forms/1234567/edit` → id is `1234567`).

### 2.2 Tags (one per archetype)

In Subscribers → Tags, create exactly four tags. Tag IDs are numeric, visible
in the URL when you click into a tag.

| Tag name (suggested) | Used for env var |
|---|---|
| `quiz-hormone-block` | `KIT_TAG_HORMONE` |
| `quiz-insulin-block` | `KIT_TAG_INSULIN` |
| `quiz-cortisol-block` | `KIT_TAG_CORTISOL` |
| `quiz-muscle-loss-block` | `KIT_TAG_MUSCLE_LOSS` |

### 2.3 API key

Settings → Advanced → API Key. Copy the value.

### 2.4 Set up the 4 welcome sequences

For each tag, create an automation that triggers when the tag is added →
sends the matching archetype welcome sequence. Sequences are Sonali's content.
The app doesn't care about them — it just adds the tag.

---

## Phase 3 — Wire env vars on Vercel (~3 min)

Project → Settings → Environment Variables. Add for **Production** (and
optionally Preview if you want preview deploys to also subscribe):

```
KIT_API_KEY=<from 2.3>
KIT_FORM_ID=<from 2.1>
KIT_TAG_HORMONE=<from 2.2>
KIT_TAG_INSULIN=<from 2.2>
KIT_TAG_CORTISOL=<from 2.2>
KIT_TAG_MUSCLE_LOSS=<from 2.2>
```

**Redeploy** after adding vars: Deployments → latest → ⋯ → Redeploy.

Test on the `vercel.app` URL with a real email you can check. The subscriber
should show up in Kit within a few seconds with the correct tag.

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
- The link to update copy: `apps/quiz/content/archetypes.ts`
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
