import { describe, test, expect } from "vitest";
import { nextInterval } from "../src/ir/algorithm.js";
import { IR_PARAMS } from "../src/ir/const.js";

describe("ir algorithm", () => {
  test("nextInterval uses multiplier", () => {
    const params = { MULTIPLIER: 2 };
    const result = nextInterval(3, params);
    expect(result).toBe(Math.ceil(2 ** 3));
  });

  test("default params used when not provided", () => {
    const result = nextInterval(1);
    expect(result).toBe(Math.ceil(IR_PARAMS.MULTIPLIER ** 1));
  });
});
