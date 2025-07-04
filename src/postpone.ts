import { Card, CardState, CardType, ItemCard } from "./types.js";
import { mulberry32, hashStringToNumber } from "./utils/rand.js";
import { calcElapsedDays, calcOddsRatio } from "./card.js";
import { addDays } from "./utils/date.js";

export const postpone = (
  cards: readonly Card[],
  now: number
): readonly Card[] => {
  return cards.map((card) => {
    const scheduledDays = card.scheduledDays ?? 0;
    const rand = mulberry32(hashStringToNumber(card.id + scheduledDays))();
    const elapsedDays = calcElapsedDays(card, now);

    const delay = elapsedDays - scheduledDays;

    const newScheduledDays = Math.min(
      Math.max(1, Math.ceil(scheduledDays * (1.05 + 0.05 * rand)) + delay),
      card.maxInterval
    );

    return {
      ...card,
      postpones: card.postpones + 1,
      scheduledDays: newScheduledDays,
      due: card.due ? addDays(card.due, newScheduledDays) : null,
    };
  });
};

export const filterSafePostponableCards = (
  cards: readonly Card[],
  now: number
): readonly Card[] => {
  return cards.filter((card) => {
    if (card.type === CardType.Item) {
      if (card.state === CardState.New) {
        return true;
      } else {
        const oddsRatio = calcOddsRatio(card as ItemCard, now);
        return oddsRatio < 0.15;
      }
    } else {
      return true;
    }
  });
};
