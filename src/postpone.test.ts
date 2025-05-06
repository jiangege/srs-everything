import { describe, it, expect, vi, beforeEach } from "vitest";
import { postpone } from "./postpone";
import { Card, CardState, CardType } from "./types";
import * as randUtils from "./utils/rand";

describe("postpone", () => {
  // Mock the random function to return predictable values
  const mockRand = vi.fn();
  vi.spyOn(randUtils, "mulberry32").mockImplementation(() => mockRand);

  // Setup helper function to create test cards
  const createTestCard = (overrides = {}): Card => ({
    id: "test-card-1",
    due: Date.now() + 86400000, // Due tomorrow
    state: CardState.REVIEW,
    type: CardType.FSRS,
    priority: 1,
    position: 0,
    scheduledDays: 5,
    maxScheduledDays: 100,
    lastReview: Date.now() - 86400000 * 5, // Last reviewed 5 days ago
    postpones: 0,
    reviewLogs: [],
    difficulty: 0.5,
    stability: 0.5,
    desiredRetention: 0.9,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should postpone cards with expected delay calculation", () => {
    // Setup random value
    mockRand.mockReturnValue(0.5);

    const now = Date.now();
    const originalDue = now + 86400000;

    const card = createTestCard({
      id: "test-card-1",
      scheduledDays: 10,
      lastReview: now - 86400000 * 15, // 15 days ago (5 days overdue)
      due: originalDue,
    });

    const result = postpone([card], now);

    // Expected calculation:
    // elapsedDays = 15, scheduledDays = 10, delay = 5
    // newScheduledDays = Math.ceil(10 * (1.05 + 0.05 * 0.5)) + 5 = Math.ceil(10 * 1.075) + 5 = 16
    expect(result[0].scheduledDays).toBe(16);
    expect(result[0].due).toBe(originalDue + 86400000 * 16);
  });

  it("should respect maxScheduledDays limit", () => {
    mockRand.mockReturnValue(1.0); // Maximum random value

    const now = Date.now();
    const card = createTestCard({
      scheduledDays: 90,
      maxScheduledDays: 100,
      lastReview: now - 86400000 * 90,
      due: now,
    });

    const result = postpone([card], now);

    // Expected calculation:
    // newScheduledDays would be Math.ceil(90 * 1.1) + 0 = 100 (实际结果显示为100)
    expect(result[0].scheduledDays).toBe(100);
  });

  it("should cap at maxScheduledDays when calculated value exceeds limit", () => {
    mockRand.mockReturnValue(1.0);

    const now = Date.now();
    const card = createTestCard({
      scheduledDays: 95,
      maxScheduledDays: 30,
      lastReview: now - 86400000 * 95,
      due: now + 86400000,
    });

    const result = postpone([card], now);

    expect(result[0].scheduledDays).toBe(30);
  });

  it("should handle cards with null due date", () => {
    mockRand.mockReturnValue(0.5);

    const now = Date.now();
    const card = createTestCard({
      scheduledDays: 10,
      lastReview: now - 86400000 * 10,
      due: null,
    });

    const result = postpone([card], now);

    // Calculated new scheduledDays but due remains null
    expect(result[0].scheduledDays).toBe(11);
    expect(result[0].due).toBeNull();
  });

  it("should process multiple cards correctly", () => {
    mockRand.mockReturnValueOnce(0.3).mockReturnValueOnce(0.7);

    const now = Date.now();

    const card1 = createTestCard({
      id: "card-1",
      scheduledDays: 5,
      lastReview: now - 86400000 * 5,
    });

    const card2 = createTestCard({
      id: "card-2",
      scheduledDays: 10,
      lastReview: now - 86400000 * 12,
    });

    const results = postpone([card1, card2], now);

    // card1: newScheduledDays = Math.ceil(5 * 1.065) + 0 = 6
    // card2: newScheduledDays = Math.ceil(10 * 1.085) + 2 = 13
    expect(results[0].scheduledDays).toBe(6);
    expect(results[1].scheduledDays).toBe(13);
  });
});
