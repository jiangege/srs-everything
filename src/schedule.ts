import { Card } from "./types.js";
import { msToDays } from "./utils/date.js";

/**
 * Manually set the due date of a card.
 * The `scheduledDays` field will be updated based on the new due date
 * and the card's last review time if available, otherwise `now`.
 */
export const setDueDate = <T extends Card>(
  card: Readonly<T>,
  due: number,
  now: number
): Readonly<T> => {
  const newCard = { ...card } as T;
  const baseTime = card.lastReview ?? now;
  const days = msToDays(due - baseTime);
  newCard.scheduledDays = Math.max(0, Math.round(days));
  newCard.due = due;
  return newCard;
};
