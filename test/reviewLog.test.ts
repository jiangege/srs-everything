import { describe, test, expect } from "vitest";
import { appendReviewLog, withoutReviewLog } from "../src/reviewLog.js";
import { CardState } from "../src/types.js";

describe("reviewLog helpers", () => {
  test("appendReviewLog appends log", () => {
    const logs = [];
    const result = appendReviewLog(logs, {
      id: "1",
      reviewTime: 1,
      state: CardState.New,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  test("withoutReviewLog removes by id", () => {
    const logs = [
      { id: "1", reviewTime: 1, state: CardState.New },
      { id: "2", reviewTime: 2, state: CardState.New },
    ];
    const result = withoutReviewLog(logs, "1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });
});
