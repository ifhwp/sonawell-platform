"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { Question } from "@/lib/questions";
import { findAnswer, writeAnswer } from "@/lib/state";

export function QuizStepClient({
  question,
  totalSteps,
}: {
  question: Question;
  totalSteps: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const existing = findAnswer(question.id);
    setSelected(existing?.optionIds ?? []);
  }, [question.id]);

  function advance(nextSelection: string[]) {
    writeAnswer({ questionId: question.id, optionIds: nextSelection });

    if (question.step === 1 && nextSelection.includes("under-38")) {
      startTransition(() => router.push("/under-38"));
      return;
    }
    if (question.step === totalSteps) {
      startTransition(() => router.push("/email"));
      return;
    }
    startTransition(() => router.push(`/quiz/${question.step + 1}`));
  }

  function pickSingle(optionId: string) {
    setSelected([optionId]);
    advance([optionId]);
  }

  function toggleMulti(optionId: string) {
    setSelected((prev) =>
      prev.includes(optionId) ? prev.filter((o) => o !== optionId) : [...prev, optionId]
    );
  }

  const prevHref = question.step > 1 ? `/quiz/${question.step - 1}` : "/";

  return (
    <section className="flex flex-1 flex-col">
      <ProgressBar step={question.step} total={totalSteps} />

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-coral font-semibold">
          Question {question.step} of {totalSteps}
        </p>
        <Link
          href={prevHref}
          className="text-sm text-muted hover:text-burgundy transition-colors"
        >
          ← Back
        </Link>
      </div>

      <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-ink leading-snug">
        {question.title}
      </h1>

      <ul className="mt-8 space-y-3" role={question.kind === "single" ? "radiogroup" : undefined}>
        {question.options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <li key={opt.id}>
              <button
                type="button"
                role={question.kind === "single" ? "radio" : "checkbox"}
                aria-checked={isSelected}
                onClick={() =>
                  question.kind === "single" ? pickSingle(opt.id) : toggleMulti(opt.id)
                }
                className={`w-full text-left rounded-2xl border px-5 py-4 transition-all duration-150 ${
                  isSelected
                    ? "border-burgundy bg-card shadow-sm"
                    : "border-border bg-white hover:border-coral hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <SelectionIndicator
                    kind={question.kind}
                    selected={isSelected}
                  />
                  <span className="flex-1 text-base text-ink leading-relaxed">
                    {opt.label}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {question.kind === "multi" && (
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => advance(selected)}
            disabled={selected.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy hover:bg-burgundy-700 disabled:bg-muted/40 disabled:cursor-not-allowed text-white px-8 py-3 text-base font-medium transition-colors"
          >
            Continue <span aria-hidden>→</span>
          </button>
        </div>
      )}
    </section>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div
      className="w-full h-1.5 bg-card rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Quiz progress: question ${step} of ${total}`}
    >
      <div
        className="h-full bg-burgundy transition-all duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SelectionIndicator({
  kind,
  selected,
}: {
  kind: "single" | "multi";
  selected: boolean;
}) {
  if (kind === "single") {
    return (
      <span
        aria-hidden
        className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? "border-burgundy" : "border-muted/50"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-burgundy" />}
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
        selected ? "border-burgundy bg-burgundy" : "border-muted/50 bg-white"
      }`}
    >
      {selected && (
        <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="none">
          <path
            d="M3 8.5l3 3 7-7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
