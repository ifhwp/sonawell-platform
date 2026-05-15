"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { clearQuizState, readAnswers, readContact, writeContact } from "@/lib/state";
import { TOTAL_STEPS } from "@/lib/questions";

export function EmailGateClient() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnswers, setHasAnswers] = useState(true);

  useEffect(() => {
    const answers = readAnswers();
    setHasAnswers(answers.length > 0);
    const c = readContact();
    if (c) {
      setFirstName(c.firstName);
      setEmail(c.email);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = firstName.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) return setError("Please enter your first name.");
    if (!isValidEmail(trimmedEmail)) return setError("Please enter a valid email.");

    const answers = readAnswers();
    if (answers.length === 0) {
      setError("It looks like the quiz didn't save. Please start over.");
      return;
    }

    setSubmitting(true);
    writeContact({ firstName: trimmedName, email: trimmedEmail });

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: trimmedName, email: trimmedEmail, answers }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Submit failed (${res.status})`);
      }
      const data = (await res.json()) as { archetype: string };
      clearQuizState();
      router.push(`/result/${data.archetype}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (!hasAnswers) {
    return (
      <section className="flex flex-1 flex-col justify-center text-center">
        <h1 className="text-2xl font-semibold text-burgundy mb-3">No quiz answers found</h1>
        <p className="text-base text-ink/80 mb-6">
          Looks like your quiz session was reset. Start over to see your result.
        </p>
        <Link
          href="/"
          className="inline-flex self-center items-center justify-center rounded-full bg-burgundy hover:bg-burgundy-700 text-white px-6 py-3 text-base font-medium"
        >
          Start the Quiz
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col justify-center">
      <p className="text-xs uppercase tracking-[0.18em] text-coral font-semibold mb-4 text-center">
        Almost done!
      </p>
      <h1 className="text-2xl sm:text-3xl font-semibold text-burgundy leading-snug mb-3 text-center">
        Where should I send your personalized result?
      </h1>
      <p className="text-base text-ink/80 mb-8 text-center">
        Your result includes a custom 5-Habit Reset based on your archetype, plus a starting
        plan for your first 7 days.
      </p>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-ink mb-1.5">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-ink focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
            placeholder="Jane"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-ink focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
            placeholder="you@example.com"
          />
        </div>

        {error && (
          <p className="text-sm text-burgundy bg-card border border-burgundy/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-burgundy hover:bg-burgundy-700 disabled:bg-muted/50 text-white px-8 py-4 text-base font-medium transition-colors shadow-sm"
        >
          {submitting ? "Sending..." : "Send Me My Results"}
        </button>

        <p className="text-center text-xs text-muted">
          No spam. Unsubscribe anytime.
        </p>
      </form>

      <p className="mt-8 text-center text-xs text-muted">
        Answered {readAnswers().length} of {TOTAL_STEPS} questions.{" "}
        <Link href="/quiz/8" className="underline hover:text-burgundy">
          Go back
        </Link>
      </p>
    </section>
  );
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
