import { describe, expect, test } from "vitest";
import { initDifficulty, updateDifficulty } from "../../src/fsrs/algorithm/difficulty.js";
import { Rating } from "../../src/fsrs/types.js";
import { DEFAULT_PARAMS_FSRS6 } from "../../src/fsrs/const.js";

describe("difficulty", () => {
  test("init difficulty returns value within range", () => {
    const d = initDifficulty(Rating.Good, DEFAULT_PARAMS_FSRS6);
    expect(d).toBeGreaterThanOrEqual(1);
    expect(d).toBeLessThanOrEqual(10);
  });

  test("init difficulty matches formula", () => {
    for (const rating of [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]) {
      const exponent = DEFAULT_PARAMS_FSRS6[5] * (rating - 1);
      const expected = Math.min(
        Math.max(
          DEFAULT_PARAMS_FSRS6[4] - Math.exp(exponent) + 1,
          1,
        ),
        10,
      );
      const d = initDifficulty(rating, DEFAULT_PARAMS_FSRS6);
      expect(d).toBeCloseTo(expected, 8);
    }
  });

  test("update difficulty reacts to rating", () => {
    const initial = 5;
    const harder = updateDifficulty(initial, Rating.Again, DEFAULT_PARAMS_FSRS6);
    const easier = updateDifficulty(initial, Rating.Easy, DEFAULT_PARAMS_FSRS6);
    expect(harder).toBeGreaterThan(initial);
    expect(easier).toBeLessThan(initial);
  });

  test("update difficulty matches formula", () => {
    const initial = 4;
    for (const rating of [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]) {
      const deltaD = -DEFAULT_PARAMS_FSRS6[6] * (rating - 3);
      const prime = initial + deltaD * ((10 - initial) / 9);
      const d0 = initDifficulty(Rating.Easy, DEFAULT_PARAMS_FSRS6);
      const expected = Math.min(
        Math.max(
          DEFAULT_PARAMS_FSRS6[7] * d0 + (1 - DEFAULT_PARAMS_FSRS6[7]) * prime,
          1,
        ),
        10,
      );
      const result = updateDifficulty(initial, rating, DEFAULT_PARAMS_FSRS6);
      expect(result).toBeCloseTo(expected, 8);
    }
  });
});
