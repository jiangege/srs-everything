import { Card } from "./types.js";
import { mulberry32, hashStringToNumber } from "./utils/rand.js";
import { computeElapsedDays } from "./utils/cardHelper.js";
import { addDays } from "./utils/dateHelper.js";

export const postpone = (cards: readonly Card[], now: number) => {
  return cards.map((card) => {
    const rand = mulberry32(hashStringToNumber(card.id + card.scheduledDays))();
    const elapsedDays = computeElapsedDays(card, now);
    const delay = elapsedDays - card.scheduledDays;

    const newScheduledDays = Math.min(
      Math.max(1, Math.ceil(card.scheduledDays * (1.05 + 0.05 * rand)) + delay),
      card.maxScheduledDays
    );

    return {
      ...card,
      scheduledDays: newScheduledDays,
      due: card.due ? addDays(card.due, newScheduledDays) : null,
    };
  });
};
