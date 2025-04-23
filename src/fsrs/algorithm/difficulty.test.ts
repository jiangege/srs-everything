import { describe, expect, test } from "vitest";
import { initDifficulty, updateDifficulty } from "./difficulty";
import { DEFAULT_PARAMS_FSRS5 } from "../const";

// Helper test functions: manual implementation of formulas for verification
function manualInitDifficulty(
  rating: number,
  params = DEFAULT_PARAMS_FSRS5
): number {
  // D₀(G) = w₄ - e^(w₅ · (G - 1)) + 1
  const w4 = params[4];
  const w5 = params[5];
  const exponent = w5 * (rating - 1);
  const result = w4 - Math.exp(exponent) + 1;
  return Math.min(Math.max(result, 1), 10);
}

function manualUpdateDifficulty(
  difficulty: number,
  rating: number,
  params = DEFAULT_PARAMS_FSRS5
): number {
  // Linear damping: ΔD = -w6 * (G - 3)
  const w6 = params[6];
  const w7 = params[7];
  const deltaD = -w6 * (rating - 3);

  // Initial update: D′ = D + ΔD * (10 - D)/9
  const primeDifficulty = difficulty + (deltaD * (10 - difficulty)) / 9;

  // Calculate baseline difficulty D₀(4)
  const d0 = manualInitDifficulty(4, params);

  // Mean regression: D″ = w7 * D₀(4) + (1 - w7) * D′
  const doublePrimeDifficulty = w7 * d0 + (1 - w7) * primeDifficulty;

  return Math.min(Math.max(doublePrimeDifficulty, 1), 10);
}

describe("FSRS Difficulty Functions", () => {
  describe("initDifficulty", () => {
    test("should calculate initial difficulty according to formula D₀(G) = w₄ - e^(w₅ · (G - 1)) + 1", () => {
      // Test initial difficulty for different ratings
      for (const rating of [1, 2, 3, 4]) {
        const expected = manualInitDifficulty(rating);
        const actual = initDifficulty(rating);
        expect(actual).toBeCloseTo(expected, 6);
      }
    });

    test("should ensure difficulty values are within valid range [1, 10]", () => {
      // Test boundary cases
      const minRating = 1;
      const maxRating = 4;

      const minDifficulty = initDifficulty(minRating);
      const maxDifficulty = initDifficulty(maxRating);

      expect(minDifficulty).toBeGreaterThanOrEqual(1);
      expect(maxDifficulty).toBeLessThanOrEqual(10);
    });
  });

  describe("updateDifficulty", () => {
    test("should correctly calculate linear damping ΔD = -w₆ · (G - 3)", () => {
      const currentDifficulty = 5;
      const testParams = [...DEFAULT_PARAMS_FSRS5];

      // Test different ratings
      for (const rating of [1, 2, 3, 4]) {
        const expected = manualUpdateDifficulty(currentDifficulty, rating);
        const actual = updateDifficulty(currentDifficulty, rating);
        expect(actual).toBeCloseTo(expected, 6);
      }
    });

    test("should correctly implement mean regression D″ = w₇ · D₀(4) + (1 - w₇) · D′", () => {
      // Test different difficulty and rating combinations
      const testCases = [
        { difficulty: 3, rating: 1 },
        { difficulty: 5, rating: 2 },
        { difficulty: 7, rating: 3 },
        { difficulty: 4, rating: 4 },
      ];

      for (const { difficulty, rating } of testCases) {
        const expected = manualUpdateDifficulty(difficulty, rating);
        const actual = updateDifficulty(difficulty, rating);
        expect(actual).toBeCloseTo(expected, 6);
      }
    });

    test("should ensure updated difficulty values are within valid range [1, 10]", () => {
      // Test boundary cases
      const lowDifficulty = 1.5;
      const highDifficulty = 9.5;

      // Rating 1 might increase difficulty, rating 4 might decrease it
      const increasedDifficulty = updateDifficulty(lowDifficulty, 1);
      const decreasedDifficulty = updateDifficulty(highDifficulty, 4);

      expect(increasedDifficulty).toBeGreaterThanOrEqual(1);
      expect(increasedDifficulty).toBeLessThanOrEqual(10);
      expect(decreasedDifficulty).toBeGreaterThanOrEqual(1);
      expect(decreasedDifficulty).toBeLessThanOrEqual(10);
    });

    test("should correctly handle extreme cases", () => {
      // Test minimum difficulty with minimum rating
      const minCase = updateDifficulty(1, 1);
      expect(minCase).toBeGreaterThanOrEqual(1);

      // Test maximum difficulty with maximum rating
      const maxCase = updateDifficulty(10, 4);
      expect(maxCase).toBeLessThanOrEqual(10);
    });
  });
});
