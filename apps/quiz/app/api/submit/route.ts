import { NextResponse } from "next/server";
import { resolveResultType, scoreAnswers, type Answer } from "@/lib/scoring";
import { captureQuizLead } from "@/lib/resend";
import { recordFailedLead } from "@/lib/lead-fallback";

type SubmitBody = {
  firstName?: unknown;
  email?: unknown;
  answers?: unknown;
};

export async function POST(request: Request) {
  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!firstName) return NextResponse.json({ error: "firstName required" }, { status: 400 });
  if (!isValidEmail(email))
    return NextResponse.json({ error: "valid email required" }, { status: 400 });

  const answers = parseAnswers(body.answers);
  if (answers.length === 0) {
    return NextResponse.json({ error: "answers required" }, { status: 400 });
  }

  const scored = scoreAnswers(answers);
  const winner = scored.winner;
  const resultType = resolveResultType(scored);
  const capture = await captureQuizLead({
    email,
    firstName,
    archetype: winner,
    resultType,
  });
  if (!capture.ok) {
    console.error("[submit] resend capture failed:", capture.error);
    // Durable fallback — capture the lead somewhere recoverable so a silent
    // Resend failure does not lose it. We still return success to the user.
    await recordFailedLead({ firstName, email, archetype: winner, reason: capture.error });
  }

  return NextResponse.json({ archetype: winner, result: resultType });
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function parseAnswers(input: unknown): Answer[] {
  if (!Array.isArray(input)) return [];
  const result: Answer[] = [];
  for (const item of input) {
    if (
      item &&
      typeof item === "object" &&
      "questionId" in item &&
      "optionIds" in item &&
      typeof (item as Answer).questionId === "string" &&
      Array.isArray((item as Answer).optionIds) &&
      (item as Answer).optionIds.every((s) => typeof s === "string")
    ) {
      result.push(item as Answer);
    }
  }
  return result;
}
