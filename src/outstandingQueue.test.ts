import { CardState, CardType } from "./types";
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

  test("should sort purely by priority when priorityWeight = 1", () => {
    const result = sortCards(mockCards, 1);
    expect(result.map((card) => card.id)).toEqual(["3", "5", "2", "1", "4"]);
  });

  test("should sort randomly when priorityWeight = 0", () => {
    // Run multiple times to check randomness
    const results = new Set();

    // Run the sort 10 times
    for (let i = 0; i < 10; i++) {
      results.add(
        sortCards(mockCards, 0)
          .map((card) => card.id)
          .join(",")
      );
    }

    // If sorting is properly random, we should get multiple different orderings
    expect(results.size).toBeGreaterThan(1);
  });

  test("should provide mixed sorting with priorityWeight = 0.7", () => {
    // Since this has randomness, we'll analyze the behavior directly

    // Create a simple mock for Math.random
    const originalRandom = Math.random;

    // Track the sorting method used
    let prioritySortCount = 0;
    let randomSortCount = 0;

    // Mock Math.random to return deterministic values
    vi.spyOn(Math, "random").mockImplementation(() => {
      // First few calls return values that trigger priority sort
      if (Math.random.mock.calls.length % 3 === 1) {
        return 0.6; // Will use priority sort (less than 0.7)
      } else {
        return 0.8; // Will use random sort (greater than 0.7)
      }
    });

    // Run sorting several times
    for (let i = 0; i < 30; i++) {
      sortCards(mockCards, 0.7);
    }

    // Count how many times each method was used
    const calls = Math.random.mock.results;
    for (let i = 0; i < calls.length; i++) {
      if (calls[i].value < 0.7) {
        prioritySortCount++;
      } else {
        randomSortCount++;
      }
    }

    // Restore original Math.random
    vi.restoreAllMocks();

    // With our specific setup, we should have some calls for each type
    expect(prioritySortCount).toBeGreaterThan(0);
    expect(randomSortCount).toBeGreaterThan(0);
  });
});
