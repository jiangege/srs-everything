import { describe, test, expect } from "vitest";
import { jitter, hashStringToNumber, mulberry32 } from "./rand.js";

describe("jitter", () => {
  test("should produce expected hash values for known inputs", () => {
    const testCases = [{ input: "node.js", expected: 0.7216069353744388 }];

    testCases.forEach(({ input, expected }) => {
      const result = jitter(input);
      expect(result).toBeCloseTo(expected);
    });
  });
});

// Test the mulberry32 random number generator
describe("mulberry32", () => {
  it("should generate random numbers between 0 and 1", () => {
    const rng = mulberry32(42); // Using 42 as a seed

    // Generate 5 random numbers
    const numbers = Array(5)
      .fill(0)
      .map(() => rng());

    // Each number should be between 0 and 1
    numbers.forEach((num) => {
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThan(1);
    });
  });

  it("should generate the same sequence when using the same seed", () => {
    const rng1 = mulberry32(123);
    const rng2 = mulberry32(123);

    // Both generators should produce the same sequence
    for (let i = 0; i < 10; i++) {
      expect(rng1()).toEqual(rng2());
    }
  });

  it("should generate different sequences when using different seeds", () => {
    const rng1 = mulberry32(123);
    const rng2 = mulberry32(456);

    // At least one number in the sequence should be different
    let allSame = true;
    for (let i = 0; i < 10; i++) {
      if (rng1() !== rng2()) {
        allSame = false;
        break;
      }
    }

    expect(allSame).toBe(false);
  });
});

describe("hashStringToNumber", () => {
  test("should return consistent hash", () => {
    const v1 = hashStringToNumber("hello");
    const v2 = hashStringToNumber("hello");
    expect(v1).toBe(v2);
  });

  test("should produce different hashes for different inputs", () => {
    const h1 = hashStringToNumber("a");
    const h2 = hashStringToNumber("b");
    expect(h1).not.toBe(h2);
  });
});
