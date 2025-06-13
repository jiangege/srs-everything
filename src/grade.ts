import { DEFAULT_PARAMS_FSRS6, algorithm, Rating } from "./fsrs/index.js";
import { ItemCard, CardState, ReviewLog } from "./types.js";
import { appendReviewLog } from "./reviewLog.js";
import { calcElapsedDays } from "./card.js";

export const grade = (
  card: Readonly<ItemCard>,
  rating: Rating,
  reviewTime: number,
  log?: Readonly<Partial<ReviewLog>>,
  params?: typeof DEFAULT_PARAMS_FSRS6
): Readonly<ItemCard> => {
  const newCard = { ...card };

  const elapsedDays = calcElapsedDays(card, reviewTime);

  const { difficulty: newDifficulty, stability: newStability } =
    algorithm.stability.updateStability(
      card.difficulty,
      card.stability,
      elapsedDays,
      rating,
      params
    );

  if (rating < Rating.Good) {
    if (card.state > CardState.Learning) {
      newCard.state = CardState.ReLearning;
    } else {
      newCard.state = CardState.Learning;
    }
  } else {
    newCard.state = CardState.Review;
  }

  newCard.difficulty = newDifficulty;
  newCard.stability = newStability;

  newCard.scheduledDays = algorithm.retrievability.nextInterval(
    card.desiredRetention,
    newStability
  );

  newCard.lastReview = reviewTime;
  newCard.due = reviewTime + newCard.scheduledDays * 24 * 60 * 60 * 1000;
  newCard.reviewLogs = [
    ...appendReviewLog(card.reviewLogs, {
      ...log,
      id: newCard.id,
      state: newCard.state,
      rating,
      reviewTime,
    }),
  ];

  return { ...newCard };
};

export const predictRatingIntervals = (
  card: ItemCard,
  reviewTime: number,
  params?: typeof DEFAULT_PARAMS_FSRS6
): Readonly<Record<Rating, number>> => {
  const result: Partial<Record<Rating, number>> = {};

  const elapsedDays = calcElapsedDays(card, reviewTime);

  for (const rating of [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]) {
    const { stability: newStability } = algorithm.stability.updateStability(
      card.difficulty,
      card.stability,
      elapsedDays,
      rating,
      params
    );

    const scheduledDays = algorithm.retrievability.nextInterval(
      card.desiredRetention,
      newStability
    );

    result[rating] = scheduledDays;
  }

  return result as Record<Rating, number>;
};
