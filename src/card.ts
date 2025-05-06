import { Card, CardType, CardState, IrCard, FsrsCard } from "./types.js";
import { applyPriority } from "./priority.js";
import { appendReviewLog } from "./reviewLog.js";
import { msToDays } from "./utils/dateHelper.js";
import {
  algorithm as fsrsAlgorithm,
  DEFAULT_DESIRED_RETENTION,
} from "./fsrs/index.js";

export const createCard = (
  id: string,
  type: CardType,
  priority: number,
  defaultAttrs?: Partial<Card>
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
    ...defaultAttrs,
  };

  switch (type) {
    case CardType.FSRS: {
      const fsrsCard = baseCard as FsrsCard;
      fsrsCard.difficulty = 0;
      fsrsCard.stability = 0;
      newCard = fsrsCard;
      if (fsrsCard.desiredRetention === undefined) {
        fsrsCard.desiredRetention = DEFAULT_DESIRED_RETENTION;
      }
      break;
    }
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
