import { Card, CardType, CardState, IrCard } from "./types.js";
import { applyPriority } from "./priority.js";
import { DEFAULT_DESIRED_RETENTION } from "./fsrs/const.js";
import { appendReviewLog } from "./reviewLog.js";
import { msToDays } from "./utils/dateHelper.js";
import { algorithm as fsrsAlgorithm } from "./fsrs/index.js";

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
      newCard.desiredRetention = DEFAULT_DESIRED_RETENTION;
      break;
    case CardType.IR:
      newCard = baseCard as IrCard;
      break;
  }

  const updatedCard = applyPriority(newCard, priority);
  return updatedCard;
};

export const computeForgettingCurve = (
  card: Readonly<FsrsCard>,
  now: number
): number => {
  const elapsedDays = card.lastReview ? msToDays(now - card.lastReview) : 0;
  return fsrsAlgorithm.retrievability.forgettingCurve(
    elapsedDays,
    card.stability
  );
};
