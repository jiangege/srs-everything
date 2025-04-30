import { DEFAULT_PARAMS_FSRS5, algorithm } from "./fsrs/index.js";
import { Card, FsrsCard, CardState, ReviewLog, Rating } from "./types.js";

import { appendReviewLog } from "./reviewLog.js";

export const grade = (
  card: Readonly<Card>,
  rating: Rating,
  log: Readonly<Partial<ReviewLog>>,
  params: readonly number[] = DEFAULT_PARAMS_FSRS5
): Readonly<Card> => {
  const originalCard = card as FsrsCard;
  const newCard = { ...card } as FsrsCard;
  const { difficulty: newDifficulty, stability: newStability } =
    algorithm.stability.updateStability(
      originalCard.difficulty,
      originalCard.stability,
      originalCard.elapsedDays,
      rating,
      params
    );

  if (rating === Rating.AGAIN) {
    if (originalCard.state === CardState.REVIEW) {
      newCard.state = CardState.RELEARNING;
    }
  } else {
    newCard.state = CardState.REVIEW;
  }
  newCard.difficulty = newDifficulty;
  newCard.stability = newStability;

  newCard.scheduledDays = algorithm.retrievability.nextInterval(
    originalCard.desiredRetention,
    newStability
  );

  newCard.currentRetention = algorithm.retrievability.forgettingCurve(
    originalCard.elapsedDays,
    newCard.stability
  );

  newCard.elapsedDays = 0;

  if (typeof log.reviewTime === "number") {
    newCard.lastReview = log.reviewTime;
    newCard.due = log.reviewTime + newCard.scheduledDays * 24 * 60 * 60 * 1000;
    newCard.reviewLogs = [
      ...appendReviewLog(originalCard.reviewLogs, {
        ...log,
        id: newCard.id,
        state: newCard.state,
        rating,
        reviewTime: log.reviewTime,
      }),
    ];
  }

  return { ...newCard };
};

export const predictRatingIntervals = (
  card: FsrsCard,
  params: readonly number[] = DEFAULT_PARAMS_FSRS5
): Readonly<Record<Rating, number>> => {
  const result: Partial<Record<Rating, number>> = {};

  for (const rating of [Rating.AGAIN, Rating.HARD, Rating.GOOD, Rating.EASY]) {
    const { stability: newStability } = algorithm.stability.updateStability(
      card.difficulty,
      card.stability,
      card.elapsedDays,
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
