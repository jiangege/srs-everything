import { describe, test, expect, vi } from "vitest";
import { addDays, startOfDay, endOfDay } from "./dateHelper.js";

describe("dateHelper", () => {
  describe("addDays", () => {
    test("should correctly add days", () => {
      const now = 1609459200000; // 2021-01-01 00:00:00 UTC
      const result = addDays(now, 1);
      expect(result).toBe(now + 86_400_000); // add one day
    });

    test("should subtract date when using negative days", () => {
      const now = 1609459200000; // 2021-01-01 00:00:00 UTC
      const result = addDays(now, -1);
      expect(result).toBe(now - 86_400_000); // subtract one day
    });

    test("should return the same time when adding zero days", () => {
      const now = 1609459200000;
      const result = addDays(now, 0);
      expect(result).toBe(now);
    });
  });

  describe("startOfDay", () => {
    test("should return the start time of the day", () => {
      // 2021-01-01 12:30:45 UTC
      const date = new Date(2021, 0, 1, 12, 30, 45);
      const timestamp = date.getTime();

      const result = startOfDay(timestamp);

      // Create date in UTC to match implementation
      const expected = new Date(timestamp);
      expected.setUTCHours(0, 0, 0, 0);

      expect(result).toBe(expected.valueOf());
    });

    test("should use current time when no parameter is provided", () => {
      // Mock Date.now()
      const originalDateNow = Date.now;
      const mockNow = new Date(2021, 0, 1, 12, 30, 45).getTime();
      Date.now = vi.fn(() => mockNow);

      const result = startOfDay();

      // Create date in UTC to match implementation
      const expected = new Date(mockNow);
      expected.setUTCHours(0, 0, 0, 0);

      expect(result).toBe(expected.valueOf());

      // Restore original function
      Date.now = originalDateNow;
    });
  });

  describe("endOfDay", () => {
    test("should return the end time of the day", () => {
      // 2021-01-01 12:30:45 UTC
      const date = new Date(2021, 0, 1, 12, 30, 45);
      const timestamp = date.getTime();

      const result = endOfDay(timestamp);

      // Create date in UTC to match implementation
      const expected = new Date(timestamp);
      expected.setUTCHours(23, 59, 59, 999);

      expect(result).toBe(expected.valueOf());
    });

    test("should use current time when no parameter is provided", () => {
      // Mock Date.now()
      const originalDateNow = Date.now;
      const mockNow = new Date(2021, 0, 1, 12, 30, 45).getTime();
      Date.now = vi.fn(() => mockNow);

      const result = endOfDay();

      // Create date in UTC to match implementation
      const expected = new Date(mockNow);
      expected.setUTCHours(23, 59, 59, 999);

      expect(result).toBe(expected.valueOf());

      // Restore original function
      Date.now = originalDateNow;
    });
  });
});
