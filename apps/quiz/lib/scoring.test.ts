import { describe, expect, it } from "vitest";
import {
  resolveResultType,
  scoreAnswers,
  scoreToRoute,
  type Answer,
} from "./scoring";
import { isResultType } from "./questions";

function answer(qid: string, optId: string): Answer {
  return { questionId: qid, optionIds: [optId] };
}

describe("scoreAnswers", () => {
  it("flags under-38 redirect and skips scoring on Q1", () => {
    const result = scoreAnswers([answer("q1-age", "under-38")]);
    expect(result.redirectUnder38).toBe(true);
    expect(result.scores).toEqual({ hormone: 0, insulin: 0, cortisol: 0, "muscle-loss": 0 });
  });

  it("does not flag under-38 for in-range ages", () => {
    const result = scoreAnswers([answer("q1-age", "45-50")]);
    expect(result.redirectUnder38).toBe(false);
  });

  it("ignores unscored Q1 ages", () => {
    const result = scoreAnswers([answer("q1-age", "51-55")]);
    expect(result.scores.hormone).toBe(0);
  });

  it("ignores unscored Q8 multi-select answers", () => {
    const result = scoreAnswers([
      { questionId: "q8-tried", optionIds: ["cutting-calories", "keto", "more-cardio"] },
    ]);
    expect(result.scores).toEqual({ hormone: 0, insulin: 0, cortisol: 0, "muscle-loss": 0 });
  });

  it("scores a clear Hormone winner", () => {
    const result = scoreAnswers([
      answer("q2-cycle", "irregular"),
      answer("q3-energy", "wake-exhausted"),
      answer("q4-weight-pattern", "unchanged-eating"),
      answer("q5-sleep", "sweaty"),
      answer("q6-cravings", "cycle-cravings"),
      answer("q7-workout", "sore-3days"),
    ]);
    expect(result.winner).toBe("hormone");
    expect(result.scores.hormone).toBeGreaterThan(result.scores.insulin);
    expect(result.scores.hormone).toBeGreaterThan(result.scores.cortisol);
    expect(result.scores.hormone).toBeGreaterThan(result.scores["muscle-loss"]);
  });

  it("scores a clear Insulin winner", () => {
    const result = scoreAnswers([
      answer("q3-energy", "after-lunch"),
      answer("q4-weight-pattern", "bloating"),
      answer("q6-cravings", "sugar-pm"),
      answer("q7-workout", "no-results"),
    ]);
    expect(result.winner).toBe("insulin");
  });

  it("scores a clear Cortisol winner", () => {
    const result = scoreAnswers([
      answer("q3-energy", "wired-tired"),
      answer("q4-weight-pattern", "belly"),
      answer("q5-sleep", "racing-mind"),
      answer("q6-cravings", "salty-night"),
      answer("q7-workout", "wiped-out"),
    ]);
    expect(result.winner).toBe("cortisol");
  });

  it("scores a clear Muscle-Loss winner", () => {
    const result = scoreAnswers([
      answer("q2-cycle", "post-5plus"),
      answer("q3-energy", "stamina-gone"),
      answer("q4-weight-pattern", "less-tone"),
      answer("q6-cravings", "not-hungry"),
      answer("q7-workout", "havent"),
    ]);
    expect(result.winner).toBe("muscle-loss");
  });

  it("applies tie-breaker order Hormone > Cortisol > Insulin > Muscle-Loss", () => {
    // Hormone vs Cortisol tie at 2 each
    expect(
      scoreAnswers([
        answer("q3-energy", "wake-exhausted"),
        answer("q4-weight-pattern", "belly"),
      ]).winner
    ).toBe("hormone");

    // Cortisol vs Insulin tie at 2 each
    expect(
      scoreAnswers([
        answer("q4-weight-pattern", "belly"),
        answer("q4-weight-pattern", "bloating"),
      ]).winner
    ).toBe("cortisol");

    // Insulin vs Muscle-Loss tie at 2 each
    expect(
      scoreAnswers([
        answer("q3-energy", "after-lunch"),
        answer("q3-energy", "stamina-gone"),
      ]).winner
    ).toBe("insulin");

    // All zero -> tie-breaker picks Hormone
    expect(scoreAnswers([]).winner).toBe("hormone");
  });

  it("handles the half-point split (Q5 wake-3am gives 1 each to cortisol+hormone)", () => {
    const result = scoreAnswers([answer("q5-sleep", "wake-3am")]);
    expect(result.scores.cortisol).toBe(1);
    expect(result.scores.hormone).toBe(1);
    // tie-breaker picks hormone first
    expect(result.winner).toBe("hormone");
  });

  it("Q2 still-regular adds 1 each to insulin and cortisol", () => {
    const result = scoreAnswers([answer("q2-cycle", "regular")]);
    expect(result.scores.insulin).toBe(1);
    expect(result.scores.cortisol).toBe(1);
  });

  it("ignores unknown question and option ids gracefully", () => {
    const result = scoreAnswers([
      { questionId: "nope", optionIds: ["whatever"] },
      { questionId: "q3-energy", optionIds: ["nonexistent"] },
    ]);
    expect(result.scores).toEqual({ hormone: 0, insulin: 0, cortisol: 0, "muscle-loss": 0 });
  });
});

describe("ScoringResult derived fields", () => {
  it("exposes runnerUp, margin, and tiedAtTop on a clear win", () => {
    const result = scoreAnswers([
      answer("q3-energy", "after-lunch"),
      answer("q4-weight-pattern", "bloating"),
      answer("q6-cravings", "sugar-pm"),
      answer("q7-workout", "no-results"),
    ]);
    expect(result.winner).toBe("insulin");
    expect(result.scores.insulin).toBe(8);
    expect(result.margin).toBe(8);
    expect(result.tiedAtTop).toBe(false);
    expect(result.runnerUp).toBe("hormone");
  });

  it("flags tiedAtTop when two archetypes share the top score", () => {
    const result = scoreAnswers([
      answer("q3-energy", "wake-exhausted"),
      answer("q4-weight-pattern", "belly"),
    ]);
    expect(result.winner).toBe("hormone");
    expect(result.tiedAtTop).toBe(true);
    expect(result.margin).toBe(0);
    expect(result.runnerUp).toBe("cortisol");
  });

  it("all-zero scores: hormone wins, cortisol is runner-up, tied at top, margin 0", () => {
    const result = scoreAnswers([]);
    expect(result.winner).toBe("hormone");
    expect(result.runnerUp).toBe("cortisol");
    expect(result.margin).toBe(0);
    expect(result.tiedAtTop).toBe(true);
  });

  it("computes margin as #1 minus #2 across mixed scores", () => {
    const result = scoreAnswers([
      answer("q3-energy", "wired-tired"),
      answer("q4-weight-pattern", "belly"),
      answer("q5-sleep", "wake-3am"),
    ]);
    expect(result.winner).toBe("cortisol");
    expect(result.scores.cortisol).toBe(5);
    expect(result.scores.hormone).toBe(1);
    expect(result.runnerUp).toBe("hormone");
    expect(result.margin).toBe(4);
    expect(result.tiedAtTop).toBe(false);
  });
});

describe("scoreToRoute", () => {
  it("routes to /under-38 when under-38 is selected", () => {
    expect(scoreToRoute([answer("q1-age", "under-38")])).toEqual({ path: "/under-38" });
  });

  it("routes a decisive winner to its feeling slug", () => {
    expect(
      scoreToRoute([
        answer("q3-energy", "after-lunch"),
        answer("q4-weight-pattern", "bloating"),
        answer("q6-cravings", "sugar-pm"),
      ]),
    ).toEqual({
      path: "/result/overweight-and-bloated",
      archetype: "insulin",
      resultType: "overweight-and-bloated",
    });
  });

  it("routes all-zero (flat) scores to the open-ended result", () => {
    expect(scoreToRoute([])).toEqual({
      path: "/result/dont-know-how-i-feel",
      archetype: "hormone",
      resultType: "dont-know-how-i-feel",
    });
  });
});

describe("resolveResultType", () => {
  it("maps each decisive archetype win to its feeling result", () => {
    const cases: Array<[Answer[], string]> = [
      [[answer("q2-cycle", "irregular"), answer("q3-energy", "wake-exhausted")], "not-myself"],
      [[answer("q3-energy", "wired-tired"), answer("q5-sleep", "racing-mind")], "always-tired"],
      [[answer("q3-energy", "after-lunch"), answer("q6-cravings", "sugar-pm")], "overweight-and-bloated"],
      [[answer("q3-energy", "stamina-gone"), answer("q7-workout", "havent")], "dont-know-how-i-feel"],
    ];
    for (const [answers, expected] of cases) {
      expect(resolveResultType(scoreAnswers(answers))).toBe(expected);
    }
  });

  it("sends a tie at the top to the open-ended result", () => {
    const result = scoreAnswers([
      answer("q3-energy", "wired-tired"),
      answer("q6-cravings", "cycle-cravings"),
    ]);
    expect(result.tiedAtTop).toBe(true);
    expect(resolveResultType(result)).toBe("dont-know-how-i-feel");
  });

  it("sends a narrow lead (margin < 2) to the open-ended result", () => {
    const result = scoreAnswers([
      answer("q5-sleep", "wake-3am"),
      answer("q3-energy", "wake-exhausted"),
    ]);
    expect(result.winner).toBe("hormone");
    expect(result.margin).toBe(2);
    expect(resolveResultType(result)).toBe("not-myself");

    const narrow = scoreAnswers([answer("q5-sleep", "wake-3am"), answer("q7-workout", "sore-3days")]);
    expect(narrow.margin).toBeLessThan(2);
    expect(resolveResultType(narrow)).toBe("dont-know-how-i-feel");
  });

  it("every resolved result is a valid page slug", () => {
    expect(isResultType(resolveResultType(scoreAnswers([])))).toBe(true);
  });
});
