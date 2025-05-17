import {
  createCard,
  CardType,
  grade,
  Rating,
  predictRatingIntervals,
  generateOutstandingQueue,
  filterSafePostponableCards,
  postpone,
  calcForgettingCurve,
  calcOddsRatio,
  next,
  interleaveCards,
} from "./index.js";
import { sortCards } from "./outstandingQueue.js";

const now = Date.now();

const cards = [];

for (let i = 0; i < 5; i++) {
  cards.push(createCard(`${i}`, CardType.Topic, 10, now));
  cards.push(createCard(`${i}`, CardType.Item, 10, now));
}

// console.log(
//   sortCards([card, card2, card3], now, {
//     itemPriorityRatio: 0.5,
//     topicPriorityRatio: 1,
//     oddsWeight: 0.8,
//   }).map((c) => c.id)
// );

console.log(interleaveCards(cards, 0.5).map((c) => c.type));

// console.log(calcOddsRatio(card, card.due! + 1000 * 60 * 60 * 24 * 30));

// console.log(
//   "interleaveCards",
//   interleaveCards(outstandingQueue, 0.5).map((c) => c.id)
// );

// console.log(filterSafePostponableCards(outstandingQueue, now));

// console.log(outstandingQueue);
// const postponedQueue2 = postpone(postponedQueue, now);

// console.log(outstandingQueue);
// console.log(postponedQueue2);
