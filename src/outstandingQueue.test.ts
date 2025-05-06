import {
  CardState,
  CardType,
  Card,
  FsrsCard,
  OutstandingQueueParams,
} from "./types.js";
import {
  sortCards,
  calcOddsRatio,
  filterCards,
  generateOutstandingQueue,
} from "./outstandingQueue";
import { describe, test, expect, vi, beforeEach } from "vitest";

describe("filterCards", () => {
  test("should filter cards by state", () => {
    const cards: Card[] = [
      { id: "1", state: CardState.NEW, type: CardType.FSRS } as Card,
      { id: "2", state: CardState.LEARNING, type: CardType.FSRS } as Card,
      { id: "3", state: CardState.NEW, type: CardType.IR } as Card,
      { id: "4", state: CardState.REVIEW, type: CardType.FSRS } as Card,
    ];

    const newCards = filterCards(cards, CardState.NEW);
    expect(newCards.length).toBe(2);
    expect(newCards[0].id).toBe("1");
    expect(newCards[1].id).toBe("3");

    const learningCards = filterCards(cards, CardState.LEARNING);
    expect(learningCards.length).toBe(1);
    expect(learningCards[0].id).toBe("2");

    const reviewCards = filterCards(cards, CardState.REVIEW);
    expect(reviewCards.length).toBe(1);
    expect(reviewCards[0].id).toBe("4");
  });
});

describe("calcOddsRatio", () => {
  test("should calculate odds ratio", () => {
    const now = new Date("2023-01-01").getTime();
    const card: FsrsCard = {
      id: "calcOddsRatio",
      type: CardType.FSRS,
      state: CardState.REVIEW,
      stability: 10,
      desiredRetention: 0.9,
      lastReview: now - 86400000 * 5, // 5 days ago
    } as FsrsCard;

    const oddsRatio = calcOddsRatio(card, now);
    expect(oddsRatio).toBeCloseTo(-0.486, 2);
  });

  test("should calculate odds ratio for IR card", () => {
    const now = new Date("2023-01-01").getTime();
    const card = {
      id: "calcOddsRatio",
      type: CardType.IR,
      state: CardState.REVIEW,
    } as FsrsCard;

    const oddsRatio = calcOddsRatio(card, now);
    console.log(oddsRatio);
  });
});

describe("sortCards", () => {
  test("should sort cards in ascending order by default", () => {
    const now = new Date("2025-05-05").getTime();
    const cards: Card[] = [
      {
        id: "1",
        type: CardType.FSRS,
        priority: 50,
        state: CardState.REVIEW,
        stability: 20,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 3, // 3 days ago
      } as FsrsCard,
      {
        id: "2",
        type: CardType.FSRS,
        priority: 80,
        state: CardState.REVIEW,
        stability: 10,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 3, // 3 days ago
      } as FsrsCard,
    ];

    const params = {
      itemPriorityRatio: 1,
      topicPriorityRatio: 1,
      oddsWeight: 1,
    };

    const sortedCards = sortCards(cards, now, params);

    // Cards should be sorted based on priority, oddsRatio and randomness
    expect(sortedCards.length).toBe(2);
    expect(sortedCards.map((c) => c.id)).toContain("1");
    expect(sortedCards.map((c) => c.id)).toContain("2");
  });

  test("should sort cards in descending order when specified", () => {
    const now = new Date("2025-05-05").getTime();
    const cards: Card[] = [
      {
        id: "1",
        type: CardType.FSRS,
        priority: 50,
        state: CardState.REVIEW,
        stability: 20,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 3, // 3 days ago
      } as FsrsCard,
      {
        id: "2",
        type: CardType.FSRS,
        priority: 80,
        state: CardState.REVIEW,
        stability: 10,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 3, // 3 days ago
      } as FsrsCard,
    ];

    const params = {
      itemPriorityRatio: 1,
      topicPriorityRatio: 1,
      oddsWeight: 1,
    };

    const sortedCards = sortCards(cards, now, params, "desc");

    // Cards should be sorted in descending order
    expect(sortedCards.length).toBe(2);
    expect(sortedCards.map((c) => c.id)).toContain("1");
    expect(sortedCards.map((c) => c.id)).toContain("2");
  });

  test("should handle mix of FSRS and IR cards", () => {
    const now = new Date("2025-05-05").getTime();
    const cards: Card[] = [
      {
        id: "1",
        type: CardType.FSRS,
        priority: 50,
        state: CardState.REVIEW,
        stability: 20,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 3, // 3 days ago
      } as FsrsCard,
      {
        id: "2",
        type: CardType.IR,
        priority: 80,
        state: CardState.REVIEW,
      } as Card,
    ];

    const params = {
      itemPriorityRatio: 1,
      topicPriorityRatio: 1,
      oddsWeight: 0.5,
    };

    const sortedCards = sortCards(cards, now, params);

    // Both card types should be sorted
    expect(sortedCards.length).toBe(2);
    expect(sortedCards.map((c) => c.type)).toContain(CardType.FSRS);
    expect(sortedCards.map((c) => c.type)).toContain(CardType.IR);
  });
});

describe("generateOutstandingQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should generate outstanding and postpone queues", () => {
    const now = new Date("2025-05-05").getTime();

    const cards: Card[] = [
      // New FSRS card
      {
        id: "1",
        type: CardType.FSRS,
        state: CardState.NEW,
        priority: 80,
        due: null,
      } as Card,
      {
        id: "11",
        type: CardType.FSRS,
        state: CardState.NEW,
        priority: 60,
        due: null,
      } as Card,
      // Due FSRS card
      {
        id: "2",
        type: CardType.FSRS,
        state: CardState.REVIEW,
        priority: 70,
        due: now - 1000, // Due in the past
      } as Card,
      // New IR card
      {
        id: "3",
        type: CardType.IR,
        state: CardState.NEW,
        priority: 90,
        due: null,
      } as Card,
      // Due IR card
      {
        id: "4",
        type: CardType.IR,
        state: CardState.REVIEW,
        priority: 60,
        due: now - 2000, // Due in the past
      } as Card,
      {
        id: "5",
        type: CardType.FSRS,
        state: CardState.REVIEW,
        priority: 100,
        due: now + 2000, // Due in the future
      } as Card,
    ];

    const params: OutstandingQueueParams = {
      maxNewItemsPerDay: 1,
      maxNewTopicsPerDay: 1,
      maxItemsPerDay: 2,
      maxTopicsPerDay: 2,
      itemPriorityRatio: 1,
      topicPriorityRatio: 1,
      oddsWeight: 0.5,
      topicToItemRatio: 0.5,
    };

    const [outstanding, postpone] = generateOutstandingQueue(
      cards,
      now,
      params
    );

    // Should have 4 outstanding cards (maxItemPerDay + maxTopicPerDay)
    expect(outstanding.length).toBe(4);
    // Should include IDs 1-4 (sorted by priority and due status)
    expect(outstanding.map((c) => c.id).sort()).toEqual(["1", "2", "3", "4"]);

    // None should be postponed
    expect(postpone.length).toBe(2);
    expect(postpone[0].id).toBe("11");
  });
});
