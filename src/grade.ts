import { DEFAULT_PARAMS_FSRS5, algorithm, Rating } from "./fsrs/index.js";
import { Card, FsrsCard, CardState, ReviewLog } from "./types.js";
import { appendReviewLog } from "./reviewLog.js";
import { computeElapsedDays } from "./utils/cardHelper.js";

export const grade = (
  card: Readonly<FsrsCard>,
  rating: Rating,
  reviewTime: number,
  log?: Readonly<Partial<ReviewLog>>,
  params?: typeof DEFAULT_PARAMS_FSRS5
): Readonly<FsrsCard> => {
  const newCard = { ...card };

  const elapsedDays = computeElapsedDays(card, reviewTime);

  const { difficulty: newDifficulty, stability: newStability } =
    algorithm.stability.updateStability(
      card.difficulty,
      card.stability,
      elapsedDays,
      rating,
      params
    );

  if (rating < Rating.GOOD) {
    if (card.state > CardState.LEARNING) {
      newCard.state = CardState.RELEARNING;
    } else {
      newCard.state = CardState.LEARNING;
    }
  } else {
    newCard.state = CardState.REVIEW;
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
  card: FsrsCard,
  reviewTime: number,
  params?: typeof DEFAULT_PARAMS_FSRS5
): Readonly<Record<Rating, number>> => {
  const result: Partial<Record<Rating, number>> = {};

  const elapsedDays = computeElapsedDays(card, reviewTime);

  for (const rating of [Rating.AGAIN, Rating.HARD, Rating.GOOD, Rating.EASY]) {
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
