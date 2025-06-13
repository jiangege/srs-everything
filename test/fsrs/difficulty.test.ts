import { describe, expect, test } from "vitest";
import { initDifficulty } from "../../src/fsrs/algorithm/difficulty.js";
import { Rating } from "../../src/fsrs/types.js";
import { DEFAULT_PARAMS_FSRS6 } from "../../src/fsrs/const.js";

describe("difficulty", () => {
  test("init difficulty returns value within range", () => {
    const d = initDifficulty(Rating.Good, DEFAULT_PARAMS_FSRS6);
    expect(d).toBeGreaterThanOrEqual(1);
    expect(d).toBeLessThanOrEqual(10);
  });
});
