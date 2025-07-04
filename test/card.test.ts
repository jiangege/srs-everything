import { describe, test, expect } from "vitest";
import { createCard, calcElapsedDays, calcForgettingCurve, calcOddsRatio } from "../src/card.js";
import { CardType, CardState } from "../src/types.js";
import { algorithm } from "../src/fsrs/index.js";

const now = Date.now();

describe("card helpers", () => {
  test("createCard initializes item fields", () => {
    const card = createCard("1", CardType.Item, 50, now);
    expect(card.id).toBe("1");
    expect(card.type).toBe(CardType.Item);
    expect(card.difficulty).toBe(0);
    expect(card.stability).toBe(0);
    expect(card.desiredRetention).toBeDefined();
    expect(card.priority).toBeGreaterThanOrEqual(0);
  });

  test("createCard handles topic type", () => {
    const card = createCard("topic", CardType.Topic, 30, now);
    expect(card.type).toBe(CardType.Topic);
    expect(card.priority).toBeGreaterThanOrEqual(0);
  });

  test("calcElapsedDays computes difference", () => {
    const card = {
      id: "a",
      type: CardType.Item,
      state: CardState.Review,
      due: null,
      priority: 1,
      position: 0,
      scheduledDays: 0,
      lastReview: now - 2 * 86_400_000,
      postpones: 0,
      reviewLogs: [],
      maxInterval: 0,
      difficulty: 0,
      stability: 0,
      desiredRetention: 0.9,
    } as const;
    expect(calcElapsedDays(card, now)).toBe(2);
  });

  test("calcForgettingCurve wraps algorithm", () => {
    const card = createCard("2", CardType.Item, 50, now);
    const r = calcForgettingCurve(card, now);
    const expected = algorithm.retrievability.forgettingCurve(0, 0);
    expect(r).toBe(expected);
  });

  test("calcOddsRatio computes based on retention", () => {
    const card = createCard("3", CardType.Item, 50, now);
    (card as any).stability = 10;
    const result = calcOddsRatio(card as any, now);
    expect(result).toBeCloseTo(-1, 5);
  });
});
