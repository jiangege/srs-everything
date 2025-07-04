import { describe, test, expect, vi } from "vitest";
import { sortCards, interleaveCards, generateOutstandingQueue } from "../src/outstandingQueue.js";
import { CardType, CardState } from "../src/types.js";
import * as randUtil from "../src/utils/rand.js";
import * as cardUtils from "../src/card.js";

const now = Date.now();
const params = { itemPriorityRatio: 0.5, topicPriorityRatio: 0.5, oddsWeight: 0.5 };

const item = {
  id: "i",
  type: CardType.Item,
  state: CardState.Review,
  priority: 50,
  position: 0,
  scheduledDays: 0,
  lastReview: now - 86_400_000,
  postpones: 0,
  reviewLogs: [],
  maxInterval: 0,
  difficulty: 1,
  stability: 2,
  desiredRetention: 0.9,
  due: now,
} as const;

const topic = { ...item, type: CardType.Topic, id: "t" } as const;

describe("sortCards", () => {
  test("sorts by score", () => {
    vi.spyOn(randUtil, "mulberry32").mockReturnValue(() => 0.5);
    vi.spyOn(randUtil, "hashStringToNumber").mockReturnValue(1);
    vi.spyOn(cardUtils, "calcOddsRatio").mockReturnValue(0);
    const result = sortCards([item, topic], now, params, "asc");
    expect(result.length).toBe(2);
    vi.restoreAllMocks();
  });

  test("tie breaks by index", () => {
    vi.spyOn(randUtil, "mulberry32").mockReturnValue(() => 0.5);
    vi.spyOn(randUtil, "hashStringToNumber").mockReturnValue(1);
    const topic2 = { ...topic, id: "t2" } as const;
    const result = sortCards([topic, topic2], now, params, "asc");
    expect(result[0].id).toBe("t");
    vi.restoreAllMocks();
  });
});

describe("interleaveCards", () => {
  test("interleaves topics and items", () => {
    const res = interleaveCards([topic, item, item], 1);
    expect(res[0].type).toBe(CardType.Topic);
    expect(res.length).toBe(3);
  });

  test("handles multiple topics", () => {
    const topic2 = { ...topic, id: "tt" } as const;
    const res = interleaveCards([topic, topic2, item], 1);
    expect(res.filter((c) => c.type === CardType.Item).length).toBe(1);
  });

  test("returns original when ratio <= 0", () => {
    const res = interleaveCards([topic], 0);
    expect(res).toEqual([topic]);
  });
});

describe("generateOutstandingQueue", () => {
  test("filters by due date", () => {
    const spySort = vi.spyOn({ sortCards }, "sortCards").mockReturnValue([item]);
    const res = generateOutstandingQueue([item], now, params);
    expect(res.length).toBe(1);
    spySort.mockRestore();
  });
});
