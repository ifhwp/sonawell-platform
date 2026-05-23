import type { Archetype } from "./questions";

export type FailedLead = {
  firstName: string;
  email: string;
  archetype: Archetype;
  reason: string;
};

type Kind = "slack" | "discord";

/**
 * Persist a failed Kit subscription somewhere durable so the lead can be
 * recovered. Posts to a Slack or Discord incoming webhook configured via:
 *
 *   FAILED_LEAD_WEBHOOK_URL   — the incoming webhook URL
 *   FAILED_LEAD_WEBHOOK_KIND  — "slack" (default) or "discord"
 *
 * If no webhook URL is configured, the lead is logged with console.error so
 * it is at least visible in the Vercel function logs — still better than the
 * previous fully-silent failure. This function never throws.
 */
export async function recordFailedLead(lead: FailedLead): Promise<void> {
  const url = process.env.FAILED_LEAD_WEBHOOK_URL;
  if (!url) {
    console.error("[lead-fallback] no webhook configured — failed lead:", lead);
    return;
  }
  const kind: Kind =
    process.env.FAILED_LEAD_WEBHOOK_KIND === "discord" ? "discord" : "slack";
  const body = buildPayload(kind, lead);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(
        `[lead-fallback] webhook returned ${res.status} — failed lead:`,
        lead,
      );
    }
  } catch (e) {
    console.error(
      "[lead-fallback] webhook fetch threw — failed lead:",
      lead,
      e instanceof Error ? e.message : e,
    );
  }
}

function buildPayload(kind: Kind, lead: FailedLead): Record<string, unknown> {
  const text =
    `SonaWell quiz — Kit subscribe FAILED. Recover this lead manually.\n` +
    `Name: ${lead.firstName}\n` +
    `Email: ${lead.email}\n` +
    `Archetype: ${lead.archetype}\n` +
    `Reason: ${lead.reason}`;
  return kind === "discord" ? { content: text } : { text };
}
