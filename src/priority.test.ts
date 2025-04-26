import { describe, test, expect } from "vitest";
import { setPriority } from "./priority.js";
import { CardType } from "./types.js";

// Helper function to create test cards with correct type
function createTestCards(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `card-${i + 1}`,
    type: CardType.FSRS,
    priority: (i / (count - 1 || 1)) * 100,
    position: i,
    // FSRS card properties
    due: new Date().getTime(),
    state: 0, // CardState.NEW
    difficulty: 0,
    stability: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    lastReview: null,
    currentRetention: 0,
    desiredRetention: 0,
    postpones: 0,
    reviewLogs: [],
  })) as any[]; // Cast to any[] to avoid type errors
}

describe("setPriority", () => {
  test("should update the priority of the target card", () => {
    const cards = createTestCards(5);
    const targetId = "card-3";
    const newPriority = 75;

    const result = setPriority(cards, targetId, newPriority);

    // Find the updated card
    const updatedCard = result.find((c) => c.id === targetId);
    expect(updatedCard).toBeDefined();
    expect(updatedCard?.priority).toBeGreaterThanOrEqual(newPriority);
    expect(updatedCard?.priority).toBeLessThan(newPriority + 1); // Less than newPriority + jitter max
  });

  test("should sort cards by priority", () => {
    const cards = createTestCards(5);
    const targetId = "card-1"; // First card
    const newPriority = 99; // Move to end

    const result = setPriority(cards, targetId, newPriority);

    // Check sorting
    for (let i = 1; i < result.length; i++) {
      expect(result[i].priority).toBeGreaterThanOrEqual(result[i - 1].priority);
    }
  });

  test("should update position values correctly", () => {
    const cards = createTestCards(5);
    const result = setPriority(cards, "card-2", 80);

    // Check positions match index
    result.forEach((card, index) => {
      expect(card.position).toBe(index);
    });
  });

  test("should handle boundary values", () => {
    const cards = createTestCards(3);

    // Test with priority = 0
    let result = setPriority(cards, "card-1", 0);
    expect(
      result.find((c) => c.id === "card-1")?.priority
    ).toBeGreaterThanOrEqual(0);

    // Test with priority = 100
    result = setPriority(cards, "card-2", 100);
    expect(
      result.find((c) => c.id === "card-2")?.priority
    ).toBeGreaterThanOrEqual(100);
    expect(result.find((c) => c.id === "card-2")?.priority).toBeLessThanOrEqual(
      101
    );
  });

  test("should not modify other cards' priority values", () => {
    const cards = createTestCards(5);
    const originalPriorities = cards.reduce((acc, card) => {
      if (card.id !== "card-3") {
        acc[card.id] = card.priority;
      }
      return acc;
    }, {} as Record<string, number>);

    const result = setPriority(cards, "card-3", 50);

    // Check other cards maintain their priorities
    Object.entries(originalPriorities).forEach(([id, priority]) => {
      const card = result.find((c) => c.id === id);
      expect(card?.priority).toBe(priority);
    });
  });
});
