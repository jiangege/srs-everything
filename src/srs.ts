import { Card, CardType } from "./types.js";
// import * as ir from "./ir/index.js";
import * as fsrs from "./fsrs/index.js";

// export function createCard(id: string, type: CardType): Card {
//   switch (type) {
//     case CardType.FSRS:
//       return { ...fsrs.createCard(id), type, priority: 0, parentId: null };
//     case CardType.IR:
//       return { ...ir.createCard(id), type, priority: 0, parentId: null };
//     default:
//       throw new Error(`Invalid card type: ${type}`);
//   }
// }

// export const grade = (
//   card: Card,
//   rating: fsrs.Rating,
//   reviewLog: Readonly<Pick<fsrs.ReviewLog, "reviewTime" | "duration">>,
//   params: readonly number[] = fsrs.DEFAULT_PARAMS_FSRS5
// ): Card => {
//   const
// };
// export function getDueCards(cards: Card[], now: number): Card[] {
//   const startOfDayTimestamp = dateHelper.startOfDay(now);
//   const endOfDayTimestamp = dateHelper.endOfDay(now);

//   return cards.filter(
//     (card) =>
//       card.due &&
//       card.due >= startOfDayTimestamp &&
//       card.due <= endOfDayTimestamp
//   );
// }
