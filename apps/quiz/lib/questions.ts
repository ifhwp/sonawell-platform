export const ARCHETYPES = ["hormone", "insulin", "cortisol", "muscle-loss"] as const;
export type Archetype = (typeof ARCHETYPES)[number];

export const TIE_BREAKER: Archetype[] = ["hormone", "cortisol", "insulin", "muscle-loss"];

export type Score = Partial<Record<Archetype, number>>;

export type QuestionOption = {
  id: string;
  label: string;
  hint?: string;
  score?: Score;
  redirect?: "under-38";
};

export type Question = {
  id: string;
  step: number;
  title: string;
  kind: "single" | "multi";
  scored: boolean;
  options: QuestionOption[];
};

export const QUESTIONS: Question[] = [
  {
    id: "q1-age",
    step: 1,
    title: "How old are you?",
    kind: "single",
    scored: false,
    options: [
      { id: "under-38", label: "Under 38", hint: "Not target — gentle redirect to YouTube", redirect: "under-38" },
      { id: "38-44", label: "38–44" },
      { id: "45-50", label: "45–50" },
      { id: "51-55", label: "51–55" },
      { id: "56-plus", label: "56+" },
    ],
  },
  {
    id: "q2-cycle",
    step: 2,
    title: "Where are you in your cycle?",
    kind: "single",
    scored: true,
    options: [
      { id: "regular", label: "Still regular, no major changes", score: { insulin: 1, cortisol: 1 } },
      { id: "irregular", label: "Cycle is irregular, symptoms starting", score: { hormone: 2 } },
      { id: "stopped-recent", label: "Periods stopped within last 5 years", score: { hormone: 2 } },
      { id: "post-5plus", label: "Postmenopausal (5+ years)", score: { "muscle-loss": 2 } },
      { id: "untracked", label: "I don't track / hysterectomy / IUD" },
    ],
  },
  {
    id: "q3-energy",
    step: 3,
    title: "What does your energy crash look like?",
    kind: "single",
    scored: true,
    options: [
      { id: "after-lunch", label: "I hit a wall after lunch", score: { insulin: 2 } },
      { id: "wired-tired", label: "I'm tired all day but wired at night", score: { cortisol: 2 } },
      { id: "wake-exhausted", label: "I wake up exhausted no matter how much I sleep", score: { hormone: 2 } },
      { id: "stamina-gone", label: "I feel weak, like my stamina just disappeared", score: { "muscle-loss": 2 } },
    ],
  },
  {
    id: "q4-weight-pattern",
    step: 4,
    title: "What's the #1 weight pattern you're noticing?",
    kind: "single",
    scored: true,
    options: [
      { id: "belly", label: "Belly weight that wasn't there before", score: { cortisol: 2 } },
      { id: "unchanged-eating", label: "Weight gain even though my eating hasn't changed", score: { hormone: 2 } },
      { id: "bloating", label: "Bloating + weight that comes and goes", score: { insulin: 2 } },
      { id: "less-tone", label: "Less tone, smaller frame but softer", score: { "muscle-loss": 2 } },
    ],
  },
  {
    id: "q5-sleep",
    step: 5,
    title: "What about sleep?",
    kind: "single",
    scored: true,
    options: [
      { id: "wake-3am", label: "I fall asleep fine but wake at 3am", score: { cortisol: 1, hormone: 1 } },
      { id: "racing-mind", label: "I can't fall asleep, mind racing", score: { cortisol: 2 } },
      { id: "sweaty", label: "I wake up sweaty or hot", score: { hormone: 2 } },
      { id: "unrested", label: "I sleep okay but never feel rested", score: { "muscle-loss": 1, hormone: 1 } },
    ],
  },
  {
    id: "q6-cravings",
    step: 6,
    title: "Cravings — be honest:",
    kind: "single",
    scored: true,
    options: [
      { id: "sugar-pm", label: "Sugar or carbs in afternoon", score: { insulin: 2 } },
      { id: "salty-night", label: "Salty + carby late at night", score: { cortisol: 2 } },
      { id: "cycle-cravings", label: "Cravings change with my cycle", score: { hormone: 2 } },
      { id: "not-hungry", label: "I'm not hungry but my weight isn't moving", score: { "muscle-loss": 2 } },
    ],
  },
  {
    id: "q7-workout",
    step: 7,
    title: "How do you feel after a workout?",
    kind: "single",
    scored: true,
    options: [
      { id: "sore-3days", label: "Sore for 3+ days, takes forever to recover", score: { hormone: 1, "muscle-loss": 1 } },
      { id: "wiped-out", label: "Wiped out, like it drained me", score: { cortisol: 2 } },
      { id: "no-results", label: "Pretty good, but I'm not seeing results", score: { insulin: 2 } },
      { id: "havent", label: "I haven't worked out in a long time", score: { "muscle-loss": 2 } },
    ],
  },
  {
    id: "q8-tried",
    step: 8,
    title: "What have you tried that hasn't worked?",
    kind: "multi",
    scored: false,
    options: [
      { id: "cutting-calories", label: "Cutting calories or smaller portions" },
      { id: "intermittent-fasting", label: "Intermittent fasting" },
      { id: "keto", label: "Cutting carbs / keto" },
      { id: "more-cardio", label: "More cardio" },
      { id: "coach-program", label: "A coach or program" },
      { id: "nothing", label: "Nothing yet — I'm starting now" },
    ],
  },
];

export const TOTAL_STEPS = QUESTIONS.length;

export function getQuestion(step: number): Question | undefined {
  return QUESTIONS.find((q) => q.step === step);
}

// The four user-facing result types — the feeling in her own words, and
// the URL slug she lands on. The internal Archetype keys stay physiological
// because scoring, Kit tags, and env vars (KIT_TAG_*) are keyed on them.
//
// "dont-know-how-i-feel" is the open-ended result: it fires when muscle-loss
// is the quiet winner OR when no single pattern clearly leads (mixed signals).
export const RESULT_TYPES = [
  "not-myself",
  "always-tired",
  "overweight-and-bloated",
  "dont-know-how-i-feel",
] as const;
export type ResultType = (typeof RESULT_TYPES)[number];

export function isResultType(s: string): s is ResultType {
  return (RESULT_TYPES as readonly string[]).includes(s);
}

export const RESULT_LABELS: Record<ResultType, string> = {
  "not-myself": "I don't feel myself",
  "always-tired": "I always feel tired",
  "overweight-and-bloated": "I feel overweight and bloated",
  "dont-know-how-i-feel": "I just don't know how I feel",
};

// Which result page a decisive archetype win maps to. Muscle-loss maps to
// the open-ended result — the quiet strength pattern that presents as
// "I don't know how I feel" — which also catches mixed/flat scores.
export const ARCHETYPE_RESULT: Record<Archetype, ResultType> = {
  hormone: "not-myself",
  cortisol: "always-tired",
  insulin: "overweight-and-bloated",
  "muscle-loss": "dont-know-how-i-feel",
};

// The reveal under the feeling headline: the pattern her answers point to.
export const RESULT_SUMMARIES: Record<ResultType, string> = {
  "not-myself":
    "Your answers point to a hormonal pattern — sleep disruption, cycle changes, a body playing by new rules.",
  "always-tired":
    "Your answers point to a stress pattern — wired-but-tired, can't switch off, weight settling at the middle.",
  "overweight-and-bloated":
    "Your answers point to a blood-sugar pattern — energy crashes, sugar pull, bloat that comes and goes.",
  "dont-know-how-i-feel":
    "Your answers don't point to one loud pattern — the signals are mixed. That's a real result: the quiet driver underneath is often strength, and it's the most fixable place to start.",
};
