import { describe, test, expect, vi } from "vitest";
import { grade, predictRatingIntervals } from "../src/grade.js";
import { Rating } from "../src/fsrs/index.js";
import { CardState, CardType } from "../src/types.js";
import * as stab from "../src/fsrs/algorithm/stability.js";
import * as retr from "../src/fsrs/algorithm/retrievability.js";

const baseItem = {
  id: "g",
  type: CardType.Item,
  priority: 0,
  position: 0,
  scheduledDays: 1,
  lastReview: Date.now() - 86_400_000,
  postpones: 0,
  reviewLogs: [],
  maxInterval: 1000,
  difficulty: 1,
  stability: 2,
  desiredRetention: 0.9,
  due: Date.now(),
  state: CardState.Review,
} as const;

describe("grade", () => {
  test("updates card state and logs", () => {
    const mockUpdate = vi.spyOn(stab, "updateStability").mockReturnValue({
      difficulty: 2,
      stability: 3,
    });
    const mockNext = vi.spyOn(retr, "nextInterval").mockReturnValue(5);

    const result = grade(baseItem, Rating.Good, Date.now());
    expect(result.state).toBe(CardState.Review);
    expect(result.difficulty).toBe(2);
    expect(result.scheduledDays).toBe(5);
    expect(result.reviewLogs.length).toBe(1);

    mockUpdate.mockRestore();
    mockNext.mockRestore();
  });

  test("handles relearning state", () => {
    const mockUpdate = vi.spyOn(stab, "updateStability").mockReturnValue({
      difficulty: 2,
      stability: 3,
    });
    const mockNext = vi.spyOn(retr, "nextInterval").mockReturnValue(5);
    const result = grade({ ...baseItem }, Rating.Again, Date.now());
    expect(result.state).toBe(CardState.ReLearning);
    mockUpdate.mockRestore();
    mockNext.mockRestore();
  });

  test("handles learning state", () => {
    const mockUpdate = vi.spyOn(stab, "updateStability").mockReturnValue({
      difficulty: 2,
      stability: 3,
    });
    const mockNext = vi.spyOn(retr, "nextInterval").mockReturnValue(5);
    const learningCard = { ...baseItem, state: CardState.New } as any;
    const result = grade(learningCard, Rating.Hard, Date.now());
    expect(result.state).toBe(CardState.Learning);
    mockUpdate.mockRestore();
    mockNext.mockRestore();
  });
});

describe("predictRatingIntervals", () => {
  test("returns intervals for each rating", () => {
    const mockUpdate = vi.spyOn(stab, "updateStability").mockReturnValue({
      difficulty: 2,
      stability: 3,
    });
    const mockNext = vi.spyOn(retr, "nextInterval").mockReturnValue(5);

    const result = predictRatingIntervals({ ...baseItem }, Date.now());
    expect(result[Rating.Again]).toBe(5);
    expect(result[Rating.Easy]).toBe(5);

    mockUpdate.mockRestore();
    mockNext.mockRestore();
  });
});
