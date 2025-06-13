import { describe, expect, test } from "vitest";
import { sameDayStability } from "../../src/fsrs/algorithm/stability.js";
import { Rating } from "../../src/fsrs/types.js";
import { DEFAULT_PARAMS_FSRS6 } from "../../src/fsrs/const.js";

describe("stability", () => {
  test("same-day review increases stability", () => {
    const S = 2;
    const newS = sameDayStability(S, Rating.Good, DEFAULT_PARAMS_FSRS6);
    expect(newS).toBeGreaterThan(S);
  });
});
