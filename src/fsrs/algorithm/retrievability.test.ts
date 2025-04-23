import { describe, test, expect } from "vitest";
import { forgettingCurve, nextInterval } from "./retrievability";

describe("forgettingCurve", () => {
  test("returns 0 when stability is 0 or negative", () => {
    expect(forgettingCurve(1, 0)).toBe(0);
    expect(forgettingCurve(1, -1)).toBe(0);
  });

  test("handles negative elapsed time by using 0 instead", () => {
    const stability = 5;
    expect(forgettingCurve(-1, stability)).toEqual(
      forgettingCurve(0, stability)
    );
  });

  test("returns correct retrievability values", () => {
    expect(forgettingCurve(0, 1)).toBeCloseTo(1);
    expect(forgettingCurve(1, 1)).toBeCloseTo(0.9);
  });

  test("returns smaller values for longer elapsed times with same stability", () => {
    const stability = 5;
    const r1 = forgettingCurve(1, stability);
    const r2 = forgettingCurve(2, stability);
    const r3 = forgettingCurve(5, stability);
    expect(r1).toBeGreaterThan(r2);
    expect(r2).toBeGreaterThan(r3);
  });

  test("returns larger values for larger stability with same elapsed time", () => {
    const elapsedTime = 5;
    const r1 = forgettingCurve(elapsedTime, 5);
    const r2 = forgettingCurve(elapsedTime, 10);
    const r3 = forgettingCurve(elapsedTime, 20);
    expect(r1).toBeLessThan(r2);
    expect(r2).toBeLessThan(r3);
  });
});

describe("nextInterval", () => {
  test("calculates correct intervals", () => {
    expect(nextInterval(0.9, 1)).toBeCloseTo(1);
  });

  test("returns smaller intervals for higher retrievability with same stability", () => {
    const stability = 10;
    const i1 = nextInterval(0.7, stability);
    const i2 = nextInterval(0.8, stability);
    const i3 = nextInterval(0.9, stability);
    expect(i1).toBeGreaterThan(i2);
    expect(i2).toBeGreaterThan(i3);
  });

  test("returns proportionally larger intervals for larger stability with same retrievability", () => {
    const retrievability = 0.8;
    const i1 = nextInterval(retrievability, 5);
    const i2 = nextInterval(retrievability, 10);
    expect(i2).toBeCloseTo(i1 * 2);
  });
});
