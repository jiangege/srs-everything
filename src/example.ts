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

import { CardType, CardState, FsrsCard, Rating } from "./types.js";

import { createCard } from "./card.js";
import { applyPriority } from "./priority.js";
import { grade } from "./grade.js";

const card = createCard("9999", CardType.FSRS, 50);

const updateCard = grade(card, Rating.EASY, {
  reviewTime: Date.now(),
});

console.log(applyPriority(updateCard, 80));
