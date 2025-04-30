import {
  Card,
  CardType,
  CardState,
  FsrsCard,
  IrCard,
  Comprehension,
} from "./types.js";
import { applyPriority } from "./priority.js";
import { DEFAULT_DESIRED_RETENTION } from "./fsrs/const.js";
import { appendReviewLog } from "./reviewLog.js";

export const createCard = (
  id: string,
  type: CardType,
  priority: number
): Readonly<Card> => {
  let newCard: Card;
  const baseCard: Partial<Card> = {
    id,
    type,
    due: null,
    state: CardState.NEW,
    elapsedDays: 0,
    scheduledDays: 0,
    lastReview: null,
    postpones: 0,
    reviewLogs: [
      ...appendReviewLog([], {
        id,
        state: CardState.NEW,
        reviewTime: Date.now(),
      }),
    ],
  };

  switch (type) {
    case CardType.FSRS:
      newCard = baseCard as FsrsCard;
      newCard.difficulty = 0;
      newCard.stability = 0;
      newCard.currentRetention = 0;
      newCard.desiredRetention = DEFAULT_DESIRED_RETENTION;
      break;
    case CardType.IR:
      newCard = baseCard as IrCard;
      newCard.comp = Comprehension.Unread;
      break;
  }

  const updatedCard = applyPriority(newCard, priority);
  return updatedCard;
};
