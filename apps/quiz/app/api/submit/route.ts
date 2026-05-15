import { NextResponse } from "next/server";
import { scoreAnswers, type Answer } from "@/lib/scoring";
import { subscribeToKit } from "@/lib/kit";

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

  const { winner } = scoreAnswers(answers);
  const kit = await subscribeToKit({ email, firstName, archetype: winner });
  if (!kit.ok) {
    console.error("[submit] kit subscription failed:", kit.error);
    // We still return success to the user — losing a Kit subscribe shouldn't block their result.
    // The error is logged for monitoring.
  }

  return NextResponse.json({ archetype: winner });
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
