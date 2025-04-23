import * as fsrs from "./fsrs/index.js";

const card = fsrs.createCard("dwwd");

const newCard = fsrs.grade(card, fsrs.Rating.AGAIN, {
  id: card.id,
  reviewTime: Date.now(),
  rating: fsrs.Rating.AGAIN,
  duration: 5,
  state: fsrs.CardState.NEW,
});

console.log(card, newCard);

console.log("初始卡到期", new Date(card.due ?? 0).toLocaleString());
console.log("今天", new Date().toLocaleString());
console.log("复习卡到期", new Date(newCard.due ?? 0).toLocaleString());

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
