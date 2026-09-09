import {
  ARCHETYPES,
  ARCHETYPE_RESULT,
  QUESTIONS,
  TIE_BREAKER,
  type Archetype,
  type ResultType,
  type Score,
} from "./questions";

export type Answer = { questionId: string; optionIds: string[] };

export type ScoringResult = {
  scores: Record<Archetype, number>;
  winner: Archetype;
  runnerUp: Archetype;
  margin: number;
  tiedAtTop: boolean;
  redirectUnder38: boolean;
};

export function scoreAnswers(answers: Answer[]): ScoringResult {
  const scores: Record<Archetype, number> = {
    hormone: 0,
    insulin: 0,
    cortisol: 0,
    "muscle-loss": 0,
  };
  let redirectUnder38 = false;

  for (const answer of answers) {
    const question = QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;
    for (const optionId of answer.optionIds) {
      const option = question.options.find((o) => o.id === optionId);
      if (!option) continue;
      if (option.redirect === "under-38") redirectUnder38 = true;
      if (!question.scored || !option.score) continue;
      addScore(scores, option.score);
    }
  }

  const winner = pickWinner(scores);
  const runnerUp = pickRunnerUp(scores, winner);
  const margin = scores[winner] - scores[runnerUp];
  const tiedAtTop = countAtTopScore(scores) > 1;
  return { scores, winner, runnerUp, margin, tiedAtTop, redirectUnder38 };
}

// A single question is worth 2 points. A winner leading by less than one
// full question is a mixed read, not a verdict — send her to the
// open-ended result instead of forcing a call.
export const CLEAR_WINNER_MARGIN = 2;

export function resolveResultType(result: ScoringResult): ResultType {
  if (result.tiedAtTop || result.margin < CLEAR_WINNER_MARGIN) {
    return "dont-know-how-i-feel";
  }
  return ARCHETYPE_RESULT[result.winner];
}

export function scoreToRoute(
  answers: Answer[],
): { path: string; archetype?: Archetype; resultType?: ResultType } {
  const result = scoreAnswers(answers);
  if (result.redirectUnder38) return { path: "/under-38" };
  const resultType = resolveResultType(result);
  return {
    path: `/result/${resultType}`,
    archetype: result.winner,
    resultType,
  };
}

function addScore(into: Record<Archetype, number>, delta: Score): void {
  for (const archetype of ARCHETYPES) {
    const v = delta[archetype];
    if (typeof v === "number") into[archetype] += v;
  }
}

function pickWinner(scores: Record<Archetype, number>): Archetype {
  let best: Archetype = TIE_BREAKER[0];
  let bestScore = scores[best];
  for (const archetype of TIE_BREAKER) {
    if (scores[archetype] > bestScore) {
      best = archetype;
      bestScore = scores[archetype];
    }
  }
  return best;
}

function pickRunnerUp(
  scores: Record<Archetype, number>,
  winner: Archetype,
): Archetype {
  let best: Archetype | null = null;
  for (const archetype of TIE_BREAKER) {
    if (archetype === winner) continue;
    if (best === null || scores[archetype] > scores[best]) {
      best = archetype;
    }
  }
  return best as Archetype;
}

function countAtTopScore(scores: Record<Archetype, number>): number {
  const top = Math.max(...Object.values(scores));
  return Object.values(scores).filter((s) => s === top).length;
}
