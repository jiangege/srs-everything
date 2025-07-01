import { describe, expect, test } from "vitest";
import {
  sameDayStability,
  initStability,
  recallStability,
  forgetStability,
  updateStability,
} from "../../src/fsrs/algorithm/stability.js";
import { initDifficulty } from "../../src/fsrs/algorithm/difficulty.js";
import { forgettingCurve } from "../../src/fsrs/algorithm/retrievability.js";
import { Rating } from "../../src/fsrs/types.js";
import { DEFAULT_PARAMS_FSRS6 } from "../../src/fsrs/const.js";

describe("stability", () => {
  test("same-day review increases stability", () => {
    const S = 2;
    const newS = sameDayStability(S, Rating.Good, DEFAULT_PARAMS_FSRS6);
    expect(newS).toBeGreaterThan(S);
  });

  test("init stability matches parameters", () => {
    for (const rating of [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]) {
      expect(initStability(rating, DEFAULT_PARAMS_FSRS6)).toBe(
        DEFAULT_PARAMS_FSRS6[rating - 1],
      );
    }
  });

  test("same-day stability formula", () => {
    const S = 2;
    const rating = Rating.Good;
    const exponent = DEFAULT_PARAMS_FSRS6[17] * (rating - 3 + DEFAULT_PARAMS_FSRS6[18]);
    const sInc = Math.exp(exponent) * Math.pow(S, -DEFAULT_PARAMS_FSRS6[19]);
    const expected = S * sInc;
    const result = sameDayStability(S, rating, DEFAULT_PARAMS_FSRS6);
    expect(result).toBeCloseTo(expected, 8);
  });

  test("recall and forget stability formulas", () => {
    const difficulty = 4;
    const stability = 3;
    const R = 0.9;
    const rating = Rating.Good;
    const hardPenalty = 1;
    const easyBonus = 1;
    const expectedRecall =
      stability *
        (Math.exp(DEFAULT_PARAMS_FSRS6[8]) *
          (11 - difficulty) *
          Math.pow(stability, -DEFAULT_PARAMS_FSRS6[9]) *
          (Math.exp(DEFAULT_PARAMS_FSRS6[10] * (1 - R)) - 1) *
          hardPenalty *
          easyBonus +
          1);

    const recall = recallStability(
      difficulty,
      stability,
      R,
      rating,
      DEFAULT_PARAMS_FSRS6,
    );
    expect(recall).toBeCloseTo(expectedRecall, 8);

    const expectedForget =
      DEFAULT_PARAMS_FSRS6[11] *
      Math.pow(difficulty, -DEFAULT_PARAMS_FSRS6[12]) *
      (Math.pow(stability + 1, DEFAULT_PARAMS_FSRS6[13]) - 1) *
      Math.exp(DEFAULT_PARAMS_FSRS6[14] * (1 - R));
    const forget = forgetStability(
      difficulty,
      stability,
      R,
      DEFAULT_PARAMS_FSRS6,
    );
    expect(forget).toBeCloseTo(expectedForget, 8);
  });

  test("update stability handles different cases", () => {
    // new card
    const init = updateStability(0, 0, 0, Rating.Good, DEFAULT_PARAMS_FSRS6);
    expect(init.difficulty).toBeCloseTo(
      initDifficulty(Rating.Good, DEFAULT_PARAMS_FSRS6),
      8,
    );
    expect(init.stability).toBeCloseTo(
      initStability(Rating.Good, DEFAULT_PARAMS_FSRS6),
      8,
    );

    // same day review
    const sameDay = updateStability(5, 10, 0.5, Rating.Good, DEFAULT_PARAMS_FSRS6);
    const sameDayExpected = sameDayStability(10, Rating.Good, DEFAULT_PARAMS_FSRS6);
    expect(sameDay.stability).toBeCloseTo(sameDayExpected, 8);

    // recall
    const recallCase = updateStability(5, 10, 5, Rating.Good, DEFAULT_PARAMS_FSRS6);
    const R = forgettingCurve(5, 10, DEFAULT_PARAMS_FSRS6);
    const recallExpected = recallStability(5, 10, R, Rating.Good, DEFAULT_PARAMS_FSRS6);
    expect(recallCase.stability).toBeCloseTo(recallExpected, 8);

    // forget
    const forgetCase = updateStability(5, 10, 5, Rating.Again, DEFAULT_PARAMS_FSRS6);
    const Rf = forgettingCurve(5, 10, DEFAULT_PARAMS_FSRS6);
    const forgetExpected = forgetStability(5, 10, Rf, DEFAULT_PARAMS_FSRS6);
    expect(forgetCase.stability).toBeCloseTo(forgetExpected, 8);
  });
});
