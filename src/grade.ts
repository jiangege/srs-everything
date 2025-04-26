import {
  DEFAULT_PARAMS_FSRS5,
  Rating,
  ReviewLog as FsrsReviewLog,
  CardState,
  algorithm,
  reviewLog,
} from "./fsrs/index.js";
import { Card, CardType } from "./types.js";

export const grade = (
  card: Card,
  rating: Rating,
  log: Readonly<Pick<FsrsReviewLog, "reviewTime" | "duration">>,
  params: readonly number[] = DEFAULT_PARAMS_FSRS5
): Readonly<Card> => {
  if (card.type !== CardType.FSRS) {
    throw new Error("Card is not a FSRS card");
  }
  const newCard = { ...card };
  const { difficulty: newDifficulty, stability: newStability } =
    algorithm.stability.updateStability(
      card.difficulty,
      card.stability,
      card.elapsedDays,
      rating,
      params
    );

  newCard.state = CardState.LEARNING;
  newCard.difficulty = newDifficulty;
  newCard.stability = newStability;

  newCard.scheduledDays = algorithm.retrievability.nextInterval(
    card.desiredRetention,
    newStability
  );

  newCard.lastReview = log.reviewTime;

  newCard.currentRetention = algorithm.retrievability.forgettingCurve(
    card.elapsedDays,
    newCard.stability
  );

  newCard.elapsedDays = 0;

  newCard.due = log.reviewTime + newCard.scheduledDays * 24 * 60 * 60 * 1000;

  newCard.reviewLogs = [
    ...reviewLog.appendReviewLog(card.reviewLogs, {
      ...log,
      id: newCard.id,
      state: newCard.state,
      rating,
    }),
  ];

  return { ...newCard };
};

export const predictRatingIntervals = (
  card: Card,
  params: readonly number[] = DEFAULT_PARAMS_FSRS5
): Readonly<Record<Rating, number>> => {
  if (card.type !== CardType.FSRS) {
    throw new Error("Card is not a FSRS card");
  }

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
