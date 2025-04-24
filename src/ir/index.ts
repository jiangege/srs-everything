import { Card, CardState } from "./types.js";
export function createCard(id: string): Card {
  return {
    id,
    due: null,
    priority: 0,
    state: CardState.NEW,
    elapsedDays: 0,
    scheduledDays: 0,
    lastReview: null,
    postpones: 0,
    reviewLogs: [],
  };
}
