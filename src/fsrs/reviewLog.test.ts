import { describe, test, expect } from "vitest";
import { addReviewLog, deleteReviewLog } from "./reviewLog.js";
import { CardState, Rating } from "./types.js";

describe("reviewLog", () => {
  describe("addReviewLog", () => {
    test("should add a new log to an empty array", () => {
      const reviewLogs = [];
      const newLog = {
        id: "log1",
        state: CardState.NEW,
        reviewTime: Date.now(),
        rating: Rating.GOOD,
        duration: 10,
      };

      const result = addReviewLog(reviewLogs, newLog);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(newLog);
      // Should not modify the original array
      expect(reviewLogs).toHaveLength(0);
    });

    test("should add a new log to an existing array", () => {
      const existingLog = {
        id: "log1",
        state: CardState.NEW,
        reviewTime: Date.now() - 1000,
        rating: Rating.GOOD,
        duration: 5,
      };

      const reviewLogs = [existingLog];

      const newLog = {
        id: "log2",
        state: CardState.LEARNING,
        reviewTime: Date.now(),
        rating: Rating.EASY,
        duration: 10,
      };

      const result = addReviewLog(reviewLogs, newLog);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(existingLog);
      expect(result[1]).toEqual(newLog);
      // Should not modify the original array
      expect(reviewLogs).toHaveLength(1);
    });
  });

  describe("deleteReviewLog", () => {
    test("should delete a log when it exists", () => {
      const log1 = {
        id: "log1",
        state: CardState.NEW,
        reviewTime: Date.now() - 1000,
        rating: Rating.GOOD,
        duration: 5,
      };

      const log2 = {
        id: "log2",
        state: CardState.LEARNING,
        reviewTime: Date.now(),
        rating: Rating.EASY,
        duration: 10,
      };

      const reviewLogs = [log1, log2];

      const result = deleteReviewLog(reviewLogs, "log1");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(log2);
      // Should not modify the original array
      expect(reviewLogs).toHaveLength(2);
    });

    test("should return the original array when log id doesn't exist", () => {
      const log1 = {
        id: "log1",
        state: CardState.NEW,
        reviewTime: Date.now(),
        rating: Rating.GOOD,
        duration: 5,
      };

      const reviewLogs = [log1];

      const result = deleteReviewLog(reviewLogs, "nonexistent");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(log1);
      // Should not be the same array reference
      expect(result).not.toBe(reviewLogs);
    });

    test("should handle empty arrays", () => {
      const reviewLogs = [];
      const result = deleteReviewLog(reviewLogs, "log1");

      expect(result).toHaveLength(0);
      expect(result).not.toBe(reviewLogs);
    });
  });
});
