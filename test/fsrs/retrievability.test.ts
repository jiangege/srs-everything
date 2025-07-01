import { describe, expect, test } from "vitest";
import { forgettingCurve, nextInterval } from "../../src/fsrs/algorithm/retrievability.js";
import { DEFAULT_PARAMS_FSRS6 } from "../../src/fsrs/const.js";

describe("retrievability", () => {
  test("R(S,S) should be 0.9", () => {
    const S = 100;
    const r = forgettingCurve(S, S, DEFAULT_PARAMS_FSRS6);
    expect(r).toBeCloseTo(0.9, 5);
  });

  test("next interval with r=0.9 returns stability", () => {
    const S = 100;
    const i = nextInterval(0.9, S, DEFAULT_PARAMS_FSRS6);
    expect(i).toBeCloseTo(S, 5);
  });

  test("forgetting curve monotonicity and boundary", () => {
    const S = 100;
    const r0 = forgettingCurve(0, S, DEFAULT_PARAMS_FSRS6);
    const rHalf = forgettingCurve(S / 2, S, DEFAULT_PARAMS_FSRS6);
    const rFull = forgettingCurve(S, S, DEFAULT_PARAMS_FSRS6);
    expect(r0).toBeCloseTo(1, 8);
    expect(rHalf).toBeGreaterThan(rFull);
    expect(rHalf).toBeLessThan(1);
  });

  test("next interval respects retention", () => {
    const S = 100;
    const i80 = nextInterval(0.8, S, DEFAULT_PARAMS_FSRS6);
    expect(i80).toBeGreaterThan(S);
  });
});
