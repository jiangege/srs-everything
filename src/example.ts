import {
  createCard,
  CardType,
  grade,
  Rating,
  predictRatingIntervals,
  generateOutstandingQueue,
  postpone,
} from "./index.js";

const now = Date.now();

const card = grade(createCard("1", CardType.Item, 10), Rating.Easy, now);
const dueCard = { ...card, due: now, stability: 10 };

const card2 = createCard("2", CardType.Item, 0);

const dueCard2 = { ...card2, due: now, stability: 10, lastReview: now };

const [outstandingQueue, postponedQueue] = generateOutstandingQueue(
  [dueCard, dueCard2],
  now,
  {
    maxNewItemsPerDay: 10,
    maxNewTopicsPerDay: 10,
    itemPriorityRatio: 0.8,
    topicPriorityRatio: 0.8,
    maxItemsPerDay: 1,
    maxTopicsPerDay: 1,
    topicToItemRatio: 0.25,
    oddsWeight: 0.8,
  }
);

const postponedQueue2 = postpone(postponedQueue, now);

console.log(outstandingQueue);
console.log(postponedQueue2);
