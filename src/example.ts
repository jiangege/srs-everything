// import * as fsrs from "./fsrs/index.js";

// const card = fsrs.createCard("dwwd");

// // const newCard = fsrs.grade(card, fsrs.Rating.AGAIN, {
// //   reviewTime: Date.now(),
// // });

// console.log(fsrs.predictRatingIntervals(card));

// console.log(card, newCard);

// console.log("初始卡到期", new Date(card.due ?? 0).toLocaleString());
// console.log("今天", new Date().toLocaleString());
// console.log("复习卡到期", new Date(newCard.due ?? 0).toLocaleString());

// srs.importCards([
//   {
//     type: "item",
//     id: "log1",
//   },
// ]);

// srs.grade(card, 1)

// srs.next(card)

// srs.getDueCards(cards, new Date())

// srs.next(card)

// srs.postpones(cards)

// srs.generateOutstandingQueue()

// srs.getFinalDrillQueue()

// pipe(srs.importCards(), srs.grade(cardm 1))
// import { CardType } from "./types.js";
// import * as SRS from "./srs.js";

// const card = SRS.createCard("dwwd", CardType.IR);

// console.log(card);

// console.log(SRS.getDueCards([card], Date.now()));

import { CardType, CardState, FsrsCard, Comprehension } from "./types.js";

import { Rating } from "./fsrs/index.js";

import { createCard, computeForgettingCurve } from "./card.js";
import { applyPriority } from "./priority.js";
import { next } from "./read.js";
import { grade, predictRatingIntervals } from "./grade.js";
import { addDays } from "./utils/dateHelper.js";

const card = createCard("9999", CardType.IR, 50);

console.log("card", card);

let lastCard = card;

for (let i = 0; i < 10; i++) {
  const newCard = next(lastCard, lastCard.due ?? Date.now());
  console.log(
    i,
    new Date(newCard.lastReview ?? Date.now()).toLocaleString(),
    new Date(newCard.due ?? Date.now()).toLocaleString()
  );
  lastCard = newCard;
}

const d = (1 / 0.3 - 1) / (1 / 0.9 - 1) - 1;

console.log(d);

// const card2 = createCard("98888", CardType.FSRS, 50);

// const updateCard3 = grade(card2, Rating.HARD, Date.now());

// console.log(updateCard3);

// const updateCard = grade(card, Rating.HARD, Date.now());

// const updateCard2 = grade(updateCard, Rating.GOOD, addDays(Date.now(), 1));

// console.log(computeForgettingCurve(updateCard, Date.now()));
