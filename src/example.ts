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

const now = Date.now();

const card = grade(createCard("1", CardType.Item, 50), Rating.Easy, now);
const dueCard = { ...card, due: now, stability: 10 };

const card2 = createCard("2", CardType.Topic, 50);
const dueCard2 = { ...card2, due: now, stability: 10, lastReview: now };

const card3 = createCard("3", CardType.Item, 40);
const dueCard3 = { ...card3, due: now, stability: 10 };

const card4 = createCard("4", CardType.Topic, 60);
const dueCard4 = { ...card4, due: now, stability: 10, lastReview: now };

const outstandingQueue = generateOutstandingQueue(
  [dueCard, dueCard2, dueCard3, dueCard4],
  now,
  {
    itemPriorityRatio: 0.8,
    topicPriorityRatio: 0.8,
    oddsWeight: 0.8,
  }
);

console.log(
  "generateOutstandingQueue",
  outstandingQueue.map((c) => c.id)
);

console.log(
  "interleaveCards",
  interleaveCards(outstandingQueue, 1).map((c) => c.id)
);

// console.log(filterSafePostponableCards(outstandingQueue, now));

// console.log(outstandingQueue);
// const postponedQueue2 = postpone(postponedQueue, now);

// console.log(outstandingQueue);
// console.log(postponedQueue2);
