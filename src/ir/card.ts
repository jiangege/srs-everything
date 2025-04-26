import {
  Comprehension,
  Card,
  CardState,
  ActionType,
  ReadingAction,
  ActionSkip,
  ActionPartial,
  ActionDone,
} from "./types.js";
import { addDays } from "../utils/dateHelper.js";
import { appendReviewLog } from "./reviewLog.js";

export const skipInterval = (k: number): number =>
  Math.min(30, Math.round(Math.pow(k, 1.5)));

export const nextInterval = (
  comp: Comprehension,
  readCount: number,
  priority: number
): number => {
  if (comp === Comprehension.Mastered) return Infinity; // never schedule again

  const base =
    comp === Comprehension.Unread ? 1 : comp === Comprehension.Browsed ? 2 : 4; // Partial

  const growth = 1 + readCount * 0.5; // seen-times factor
  const prioFactor = 0.5 + priority / 100; // 0.5 … 1.5

  return Math.ceil(base * growth * prioFactor); // whole days
};

export const createCard = (
  id: string,
  customProperties?: Readonly<Partial<Card>>
): Card => {
  const defaultCard: Card = {
    id,
    parentId: null,
    due: null,
    state: CardState.NEW,
    elapsedDays: 0,
    scheduledDays: 0,
    lastReview: null,
    postpones: 0,
    reviewLogs: [],
    comp: Comprehension.Unread,
  };
  return { ...defaultCard, ...customProperties };
};

export const applyAction = (
  card: Readonly<Card>,
  action: Readonly<ReadingAction>
): Readonly<Card> | readonly Card[] => {
  const now = Date.now();

  switch (action.type) {
    case ActionType.Skip: {
      const next = { ...card };
      next.postpones += 1;
      next.due = addDays(now, skipInterval(next.postpones));
      next.reviewLogs = [
        ...appendReviewLog(next.reviewLogs, {
          id: next.id,
          reviewTime: now,
          state: next.state,
          duration: 0,
        }),
      ];
      return next;
    }
    case ActionType.Partial: {
      const next = { ...card };
      next.comp = action.comp;
      next.due = addDays(
        now,
        nextInterval(next.comp, next.reviewLogs.length, next.priority)
      );
      next.reviewLogs = [
        ...appendReviewLog(next.reviewLogs, {
          id: next.id,
          reviewTime: now,
          state: next.state,
          duration: 0,
        }),
      ];
      return next;
    }
    case ActionType.Done: {
      const next = { ...card };
      next.comp = Comprehension.Mastered;
      next.due = null;
      return next;
    }
  }
};
