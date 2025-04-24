import { Card, CardType } from "./types.js";
import * as ir from "./ir/index.js";
import * as fsrs from "./fsrs/index.js";

export function createCard(id: string, type: CardType): Card {
  if (type === CardType.FSRS) {
    return { ...fsrs.createCard(id), type };
  } else if (type === CardType.IR) {
    return { ...ir.createCard(id), type };
  } else {
    throw new Error(`Invalid card type: ${type}`);
  }
}

export function getDueCards(cards: Card[], now: number): Card[] {
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startOfDayTimestamp = startOfDay.getTime();

  const endOfDay = new Date(now);
  endOfDay.setUTCHours(23, 59, 59, 999);
  const endOfDayTimestamp = endOfDay.getTime();

  return cards.filter(
    (card) =>
      card.due &&
      card.due >= startOfDayTimestamp &&
      card.due <= endOfDayTimestamp
  );
}
