import { describe, expect, test } from "vitest";
import { createCard } from "../src/card.js";
import { CardType } from "../src/types.js";
import { setDueDate } from "../src/schedule.js";

describe("setDueDate", () => {
  test("updates due and scheduledDays", () => {
    const now = Date.now();
    const card = createCard("1", CardType.Item, 50, now);
    const future = now + 3 * 86_400_000;
    const updated = setDueDate(card, future, now);
    expect(updated.due).toBe(future);
    expect(updated.scheduledDays).toBe(3);
  });
});
