import "server-only";
import { RESULT_LABELS, type Archetype, type ResultType } from "./questions";

type CaptureArgs = {
  email: string;
  firstName: string;
  archetype: Archetype;
  resultType: ResultType;
};

type CaptureResult = { ok: true } | { ok: false; error: string };

// Resend (resend.com) — lead capture + result email.
//
// Required env (server-only):
//   RESEND_API_KEY      - API key (Resend dashboard → API Keys)
//   RESEND_AUDIENCE_ID  - audience quiz leads are added to (fallback for all types)
//   RESEND_FROM         - verified sender, e.g. "Sonali <sonali@sonaliwellness.com>"
//
// Optional per-result-type audiences (Resend has no tags; a dedicated audience
// per result type is how you target a broadcast/sequence at one cohort).
// When set, the lead joins that audience instead of RESEND_AUDIENCE_ID:
//   RESEND_AUDIENCE_NOT_MYSELF
//   RESEND_AUDIENCE_ALWAYS_TIRED
//   RESEND_AUDIENCE_OVERWEIGHT_AND_BLOATED
//   RESEND_AUDIENCE_DONT_KNOW
//
// Optional:
//   SITE_URL - base URL used in the result email link
//              (default https://quiz.sonaliwellness.com)
//
// When RESEND_API_KEY is missing we no-op and log so local dev works without a key.
export async function captureQuizLead(args: CaptureArgs): Promise<CaptureResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[resend] no API key set — would have captured:", args);
    return { ok: true };
  }

  const audienceId = audienceIdFor(args.resultType);
  if (!audienceId) {
    return { ok: false, error: "no RESEND_AUDIENCE_ID configured" };
  }

  const contact = await post(
    apiKey,
    `https://api.resend.com/audiences/${audienceId}/contacts`,
    { email: args.email, first_name: args.firstName, unsubscribed: false },
  );
  if (!contact.ok) return contact;

  return sendResultEmail(apiKey, args);
}

function audienceIdFor(resultType: ResultType): string | undefined {
  const perType: Record<ResultType, string | undefined> = {
    "not-myself": process.env.RESEND_AUDIENCE_NOT_MYSELF,
    "always-tired": process.env.RESEND_AUDIENCE_ALWAYS_TIRED,
    "overweight-and-bloated": process.env.RESEND_AUDIENCE_OVERWEIGHT_AND_BLOATED,
    "dont-know-how-i-feel": process.env.RESEND_AUDIENCE_DONT_KNOW,
  };
  return perType[resultType] || process.env.RESEND_AUDIENCE_ID;
}

async function sendResultEmail(
  apiKey: string,
  args: CaptureArgs,
): Promise<CaptureResult> {
  const from = process.env.RESEND_FROM;
  if (!from) {
    // Contact is captured; without a verified sender we skip the email.
    console.warn("[resend] no RESEND_FROM set — skipping result email");
    return { ok: true };
  }

  const base = process.env.SITE_URL || "https://quiz.sonaliwellness.com";
  const url = `${base}/result/${args.resultType}`;
  const label = RESULT_LABELS[args.resultType];
  const name = escapeHtml(args.firstName);

  return post(apiKey, "https://api.resend.com/emails", {
    from,
    to: [args.email],
    subject: `Your SonaWell quiz result — "${label}"`,
    html:
      `<p>Hi ${name},</p>` +
      `<p>You said it yourself: <strong>&ldquo;${escapeHtml(label)}.&rdquo;</strong> ` +
      `Your full result explains the pattern behind it — plus your 5-Habit Reset ` +
      `and a plan for your first 7 days.</p>` +
      `<p><a href="${url}">Read your result</a></p>` +
      `<p>— Sonali</p>`,
  });
}

async function post(
  apiKey: string,
  url: string,
  body: Record<string, unknown>,
): Promise<CaptureResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "resend fetch failed" };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
