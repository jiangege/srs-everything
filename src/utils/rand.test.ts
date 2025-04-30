import { describe, test, expect } from "vitest";
import { jitter } from "./rand.js";
import { seededRandom } from "./rand";

describe("jitter", () => {
  test("should produce expected hash values for known inputs", () => {
    const testCases = [{ input: "node.js", expected: 0.7216069353744388 }];

    testCases.forEach(({ input, expected }) => {
      const result = jitter(input);
      expect(result).toBeCloseTo(expected);
    });
  });
});

/**
 * Tests for the seededRandom function
 */
describe("seededRandom", () => {
  it("returns the same value for the same seed", () => {
    const seed = 12345;
    const result1 = seededRandom(seed);
    const result2 = seededRandom(seed);

    expect(result1).toBe(result2);
  });

  it("returns a value between 0 and 1", () => {
    const seed = 67890;
    const result = seededRandom(seed);

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(1);
  });

  it("returns different values for different seeds", () => {
    const seed1 = 12345;
    const seed2 = 67890;

    const result1 = seededRandom(seed1);
    const result2 = seededRandom(seed2);

    expect(result1).not.toBe(result2);
  });
});
