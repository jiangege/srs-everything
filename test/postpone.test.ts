import { describe, test, expect, vi } from "vitest";
import { postpone, filterSafePostponableCards } from "../src/postpone.js";
import { CardType, CardState } from "../src/types.js";
import * as randUtil from "../src/utils/rand.js";
import * as cardUtils from "../src/card.js";

const baseItem = {
  id: "p1",
  type: CardType.Item,
  priority: 0,
  position: 0,
  scheduledDays: 2,
  lastReview: Date.now() - 2 * 86_400_000,
  postpones: 0,
  reviewLogs: [],
  maxInterval: 1000,
  difficulty: 1,
  stability: 2,
  desiredRetention: 0.9,
  due: Date.now(),
  state: CardState.Review,
} as const;

describe("postpone", () => {
  test("updates scheduledDays and due", () => {
    vi.spyOn(randUtil, "mulberry32").mockReturnValue(() => 0.5);
    const result = postpone([baseItem], Date.now())[0];
    expect(result.postpones).toBe(1);
    expect(result.scheduledDays).toBeGreaterThan(baseItem.scheduledDays);
    expect(result.due).not.toBeNull();
    vi.restoreAllMocks();
  });
});

describe("filterSafePostponableCards", () => {
  test("filters based on oddsRatio", () => {
    vi.spyOn(cardUtils, "calcOddsRatio").mockReturnValue(0.1);
    const result = filterSafePostponableCards([baseItem], Date.now());
    expect(result.length).toBe(1);
    vi.restoreAllMocks();
  });

  test("allows new item", () => {
    const newItem = { ...baseItem, state: CardState.New } as any;
    const res = filterSafePostponableCards([newItem], Date.now());
    expect(res.length).toBe(1);
  });

  test("allows topic card", () => {
    const topic = { ...baseItem, type: CardType.Topic } as any;
    const res = filterSafePostponableCards([topic], Date.now());
    expect(res.length).toBe(1);
  });
});
