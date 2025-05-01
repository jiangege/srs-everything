import { CardState, CardType, OutstandingQueueParams } from "./types";
import { sortCards } from "./outstandingQueue";
import { describe, test, expect, vi } from "vitest";

describe("sortCards", () => {
  const mockCards = [
    {
      id: "1",
      priority: 5,
      type: CardType.FSRS,
      state: CardState.NEW,
      position: 1,
      scheduledDays: 0,
      postpones: 0,
      reviewLogs: [],
      due: Date.now(),
    },
    {
      id: "2",
      priority: 3,
      type: CardType.FSRS,
      state: CardState.REVIEW,
      position: 2,
      scheduledDays: 0,
      postpones: 0,
      reviewLogs: [],
      due: Date.now(),
    },
    {
      id: "3",
      priority: 1,
      type: CardType.FSRS,
      state: CardState.LEARNING,
      position: 3,
      scheduledDays: 0,
      postpones: 0,
      reviewLogs: [],
      due: Date.now(),
    },
    {
      id: "4",
      priority: 7,
      type: CardType.IR,
      state: CardState.RELEARNING,
      position: 4,
      scheduledDays: 0,
      postpones: 0,
      reviewLogs: [],
      due: Date.now(),
    },
    {
      id: "5",
      priority: 2,
      type: CardType.IR,
      state: CardState.NEW,
      position: 5,
      scheduledDays: 0,
      postpones: 0,
      reviewLogs: [],
      due: Date.now(),
    },
  ];

  test("should sort cards by priority when weight=1", () => {
    const params = {
      itemPriorityVsRandRatio: 1,
      topicPriorityVsRandRatio: 1,
    };

    const sorted = sortCards(mockCards, 42, params);

    // Should be sorted by priority (ascending)
    expect(sorted[0].id).toBe("3"); // priority 1
    expect(sorted[1].id).toBe("5"); // priority 2
    expect(sorted[2].id).toBe("2"); // priority 3
    expect(sorted[3].id).toBe("1"); // priority 5
    expect(sorted[4].id).toBe("4"); // priority 7
  });

  test("should sort cards randomly when weight=0", () => {
    const params = {
      itemPriorityVsRandRatio: 0,
      topicPriorityVsRandRatio: 0,
    };

    // With the same seed, sorting should be consistent but not based on priority
    const sorted1 = sortCards(mockCards, 42, params);
    const sorted2 = sortCards(mockCards, 42, params);

    // Same seed should give same order
    expect(sorted1.map((c) => c.id)).toEqual(sorted2.map((c) => c.id));

    // Different seed should give different order
    const sorted3 = sortCards(mockCards, 43, params);
    expect(sorted1.map((c) => c.id)).not.toEqual(sorted3.map((c) => c.id));
  });

  test("should consider card type when sorting with mixed weights", () => {
    const params = {
      itemPriorityVsRandRatio: 0.7, // FSRS cards: 70% priority, 30% random
      topicPriorityVsRandRatio: 0.3, // IR cards: 30% priority, 70% random
    };

    // First, verify deterministic behavior with same seed
    const sorted1 = sortCards(mockCards, 42, params);
    const sorted2 = sortCards(mockCards, 42, params);
    expect(sorted1.map((c) => c.id)).toEqual(sorted2.map((c) => c.id));

    // Testing with multiple seeds to ensure FSRS cards are more influenced by priority
    // than IR cards with the same priority, on average
    let fsrsFollowsPriorityCount = 0;
    let irFollowsPriorityCount = 0;

    // Run multiple sorts with different seeds
    for (let seed = 1; seed <= 100; seed++) {
      const sorted = sortCards(mockCards, seed, params);

      // Find positions of FSRS cards
      const fsrsIndices = sorted
        .map((card, index) => ({ id: card.id, index, type: card.type }))
        .filter((item) => item.type === CardType.FSRS);

      // Check if the two FSRS cards with priorities 1 and 3 are in order
      const hasCard3 = fsrsIndices.find((item) => item.id === "3");
      const hasCard2 = fsrsIndices.find((item) => item.id === "2");

      if (hasCard3 && hasCard2 && hasCard3.index < hasCard2.index) {
        fsrsFollowsPriorityCount++;
      }

      // Check IR cards similarly
      const irIndices = sorted
        .map((card, index) => ({ id: card.id, index, type: card.type }))
        .filter((item) => item.type === CardType.IR);

      const hasCard5 = irIndices.find((item) => item.id === "5");
      const hasCard4 = irIndices.find((item) => item.id === "4");

      if (hasCard5 && hasCard4 && hasCard5.index < hasCard4.index) {
        irFollowsPriorityCount++;
      }
    }

    // With our parameters, FSRS cards should follow priority more often than IR cards
    expect(fsrsFollowsPriorityCount).toBeGreaterThan(irFollowsPriorityCount);
  });
});
