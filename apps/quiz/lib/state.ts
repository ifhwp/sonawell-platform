"use client";

import type { Answer } from "./scoring";

const ANSWERS_KEY = "sonawell-quiz-answers";
const CONTACT_KEY = "sonawell-quiz-contact";

export type Contact = { firstName: string; email: string };

export function readAnswers(): Answer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(ANSWERS_KEY);
    return raw ? (JSON.parse(raw) as Answer[]) : [];
  } catch {
    return [];
  }
}

export function findAnswer(questionId: string): Answer | undefined {
  return readAnswers().find((a) => a.questionId === questionId);
}

export function writeAnswer(answer: Answer): void {
  if (typeof window === "undefined") return;
  const existing = readAnswers().filter((a) => a.questionId !== answer.questionId);
  existing.push(answer);
  window.sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(existing));
}

export function clearQuizState(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ANSWERS_KEY);
  window.sessionStorage.removeItem(CONTACT_KEY);
}

export function readContact(): Contact | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CONTACT_KEY);
    return raw ? (JSON.parse(raw) as Contact) : null;
  } catch {
    return null;
  }
}

export function writeContact(c: Contact): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CONTACT_KEY, JSON.stringify(c));
}
