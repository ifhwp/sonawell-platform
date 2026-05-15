import { notFound } from "next/navigation";
import { getQuestion, TOTAL_STEPS } from "@/lib/questions";
import { QuizStepClient } from "./quiz-step-client";

export function generateStaticParams() {
  return Array.from({ length: TOTAL_STEPS }, (_, i) => ({ step: String(i + 1) }));
}

export default async function QuizStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const stepNum = Number(step);
  if (!Number.isInteger(stepNum) || stepNum < 1 || stepNum > TOTAL_STEPS) {
    notFound();
  }
  const question = getQuestion(stepNum);
  if (!question) notFound();

  return (
    <QuizStepClient
      question={question}
      totalSteps={TOTAL_STEPS}
    />
  );
}
