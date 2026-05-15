import { describe, expect, it } from "vitest";
import { scoreAnswers, type Answer } from "./scoring";

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
