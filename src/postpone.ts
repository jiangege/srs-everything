import { Card } from "./types.js";
import { mulberry32, hashStringToNumber } from "./utils/rand.js";
import { computeElapsedDays } from "./card.js";
import { addDays } from "./utils/date.js";

export const DEFAULT_MAX_SCHEDULED_DAYS = 1000;

export const postpone = (cards: readonly Card[], now: number) => {
  return cards.map((card) => {
    const scheduledDays = card.scheduledDays ?? 0;
    const rand = mulberry32(hashStringToNumber(card.id + scheduledDays))();
    const elapsedDays = computeElapsedDays(card, now);

    const delay = elapsedDays - scheduledDays;

    const newScheduledDays = Math.min(
      Math.max(1, Math.ceil(scheduledDays * (1.05 + 0.05 * rand)) + delay),
      card.maxScheduledDays ?? DEFAULT_MAX_SCHEDULED_DAYS
    );

    return {
      ...card,
      scheduledDays: newScheduledDays,
      due: card.due ? addDays(card.due, newScheduledDays) : null,
    };
  });
};
