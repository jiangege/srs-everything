import { describe, test, expect, vi } from "vitest";
import { next } from "../src/read.js";
import { CardType, CardState } from "../src/types.js";
import * as irAlgo from "../src/ir/algorithm.js";
import * as dateUtil from "../src/utils/date.js";

const baseTopic = {
  id: "t",
  type: CardType.Topic,
  priority: 0,
  position: 0,
  scheduledDays: 0,
  lastReview: null,
  postpones: 0,
  reviewLogs: [],
  maxInterval: 1000,
  due: null,
  state: CardState.New,
} as const;

describe("read next", () => {
  test("updates topic card", () => {
    vi.spyOn(irAlgo, "nextInterval").mockReturnValue(3);
    vi.spyOn(dateUtil, "addDays").mockReturnValue(123);
    const result = next(baseTopic, Date.now());
    expect(result.state).toBe(CardState.Learning);
    expect(result.scheduledDays).toBe(3);
    expect(result.due).toBe(123);
    expect(result.reviewLogs.length).toBe(1);
    vi.restoreAllMocks();
  });

  test("clamps interval using maxInterval", () => {
    vi.spyOn(irAlgo, "nextInterval").mockReturnValue(10);
    const result = next({ ...baseTopic, maxInterval: 5 }, Date.now());
    expect(result.scheduledDays).toBe(5);
    vi.restoreAllMocks();
  });
});
