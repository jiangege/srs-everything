import { describe, test, expect } from "vitest";
import { jitter } from "./rand.js";

describe("jitter", () => {
  test("should produce expected hash values for known inputs", () => {
    const testCases = [{ input: "node.js", expected: 0.7216069353744388 }];

    testCases.forEach(({ input, expected }) => {
      const result = jitter(input);
      expect(result).toBeCloseTo(expected);
    });
  });
});
