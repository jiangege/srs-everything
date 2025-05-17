import { Card, CardType, CardState, TopicCard, ItemCard } from "./types.js";
import { applyPriority } from "./priority.js";
import { appendReviewLog } from "./reviewLog.js";
import { msToDays } from "./utils/date.js";
import {
  algorithm as fsrsAlgorithm,
  DEFAULT_DESIRED_RETENTION,
} from "./fsrs/index.js";

export const DEFAULT_MAX_INTERVAL = 1000 * 60 * 60 * 24 * 1000;

export const createCard = <T extends CardType>(
  id: string,
  type: T,
  priority: number,
  now: number,
  defaultAttrs?: Partial<Card>
): Readonly<T extends CardType.Item ? ItemCard : TopicCard> => {
  const baseCard: Partial<Card> = {
    id,
    type,
    due: null,
    state: CardState.New,
    scheduledDays: 0,
    lastReview: null,
    postpones: 0,
    maxInterval: DEFAULT_MAX_INTERVAL,
    reviewLogs: [
      ...appendReviewLog([], {
        id,
        state: CardState.New,
        reviewTime: now,
      }),
    ],
    ...defaultAttrs,
  };

  let newCard: Card = baseCard as Card;

  switch (type) {
    case CardType.Item: {
      const itemCard = baseCard as ItemCard;
      itemCard.difficulty = 0;
      itemCard.stability = 0;
      newCard = itemCard;
      if (itemCard.desiredRetention === undefined) {
        itemCard.desiredRetention = DEFAULT_DESIRED_RETENTION;
      }
      break;
    }
    case CardType.Topic:
      newCard = baseCard as TopicCard;
      break;
  }

  return applyPriority(newCard, priority) as Readonly<
    T extends CardType.Item ? ItemCard : TopicCard
  >;
};

export const calcElapsedDays = (
  card: Readonly<Card>,
  reviewTime: number
): number => {
  return card.lastReview ? msToDays(reviewTime - card.lastReview) : 0;
};

export const calcForgettingCurve = (
  card: Readonly<ItemCard>,
  now: number
): number => {
  const elapsedDays = calcElapsedDays(card, now);
  const stability = card.stability ?? 0;

  return fsrsAlgorithm.retrievability.forgettingCurve(elapsedDays, stability);
};

export const calcOddsRatio = (card: ItemCard, now: number): number => {
  const rCurrent = calcForgettingCurve(card, now);
  const rDesired = card.desiredRetention ?? 0.9;

  return (1 / rCurrent - 1) / (1 / rDesired - 1) - 1;
};
