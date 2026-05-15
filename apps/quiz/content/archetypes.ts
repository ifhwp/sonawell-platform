import type { Archetype } from "@/lib/questions";

export type ArchetypeContent = {
  headline: string;
  intro: string;
  fiveHabitReset: string[];
  firstSevenDays: string[];
  closing: string;
};

// PLACEHOLDER copy — to be replaced by Sonali Surve, DTR.
// Voice rules (sonawell/CLAUDE.md):
//   - No medical claims, no ROI promises
//   - Preserve Sonali's exact words when she provides them
//   - Credibility before monetization
export const ARCHETYPE_CONTENT: Record<Archetype, ArchetypeContent> = {
  hormone: {
    headline: "Your block is hormonal.",
    intro:
      "Perimenopause and menopause shift the rules. The patterns you're noticing — sleep disruption, cycle changes, hot flashes, weight that won't move even when you eat the same — aren't a willpower problem. They're a hormonal one.",
    fiveHabitReset: [
      "[Sonali to write — Habit 1]",
      "[Sonali to write — Habit 2]",
      "[Sonali to write — Habit 3]",
      "[Sonali to write — Habit 4]",
      "[Sonali to write — Habit 5]",
    ],
    firstSevenDays: [
      "[Sonali to write — Day 1–2 focus]",
      "[Sonali to write — Day 3–4 focus]",
      "[Sonali to write — Day 5–7 focus]",
    ],
    closing: "[Sonali to write — closing nudge + next step]",
  },
  insulin: {
    headline: "Your block is insulin.",
    intro:
      "The afternoon crash, the sugar pull, the bloat that comes and goes — those are signs your blood sugar is on a rollercoaster. Cutting calories harder doesn't fix it. Steady blood sugar does.",
    fiveHabitReset: [
      "[Sonali to write — Habit 1]",
      "[Sonali to write — Habit 2]",
      "[Sonali to write — Habit 3]",
      "[Sonali to write — Habit 4]",
      "[Sonali to write — Habit 5]",
    ],
    firstSevenDays: [
      "[Sonali to write — Day 1–2 focus]",
      "[Sonali to write — Day 3–4 focus]",
      "[Sonali to write — Day 5–7 focus]",
    ],
    closing: "[Sonali to write — closing nudge + next step]",
  },
  cortisol: {
    headline: "Your block is cortisol.",
    intro:
      "Wired-but-tired, can't switch off, weight settling around the middle — your body is running a stress program 24/7. The fix isn't more discipline. It's giving the system permission to come down.",
    fiveHabitReset: [
      "[Sonali to write — Habit 1]",
      "[Sonali to write — Habit 2]",
      "[Sonali to write — Habit 3]",
      "[Sonali to write — Habit 4]",
      "[Sonali to write — Habit 5]",
    ],
    firstSevenDays: [
      "[Sonali to write — Day 1–2 focus]",
      "[Sonali to write — Day 3–4 focus]",
      "[Sonali to write — Day 5–7 focus]",
    ],
    closing: "[Sonali to write — closing nudge + next step]",
  },
  "muscle-loss": {
    headline: "Your block is muscle loss.",
    intro:
      "The slow loss of strength and tone after midlife isn't a story about how much you eat — it's about what your body still has to work with. The good news: it's the most fixable of the four blocks, and the change shows up fast.",
    fiveHabitReset: [
      "[Sonali to write — Habit 1]",
      "[Sonali to write — Habit 2]",
      "[Sonali to write — Habit 3]",
      "[Sonali to write — Habit 4]",
      "[Sonali to write — Habit 5]",
    ],
    firstSevenDays: [
      "[Sonali to write — Day 1–2 focus]",
      "[Sonali to write — Day 3–4 focus]",
      "[Sonali to write — Day 5–7 focus]",
    ],
    closing: "[Sonali to write — closing nudge + next step]",
  },
};
