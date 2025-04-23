import { Card, CardState, RatingValue, ReviewLog, Rating } from "./types.js";
import { DEFAULT_DESIRED_RETENTION, DEFAULT_PARAMS_FSRS5 } from "./const.js";

import * as algorithm from "./algorithm/index.js";
import * as reviewLog from "./reviewLog.js";

export function createCard(
  cardId: string,
  customProperties?: Partial<Card>
): Card {
  const defaultCard: Card = {
    id: cardId,
    due: null,
    priority: 0,
    state: CardState.NEW,
    difficulty: 0,
    stability: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    lastReview: null,
    currentRetention: 0,
    desiredRetention: DEFAULT_DESIRED_RETENTION,
    postpones: 0,
    reviewLogs: [],
  };
  return { ...defaultCard, ...customProperties };
}

export function grade(
  card: Card,
  rating: RatingValue,
  log: ReviewLog,
  fsrsParams: number[] = DEFAULT_PARAMS_FSRS5
): Card {
  const newCard = { ...card };
  const { difficulty: newDifficulty, stability: newStability } =
    algorithm.stability.updateStability(
      card.difficulty,
      card.stability,
      card.elapsedDays,
      rating,
      fsrsParams
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

  newCard.reviewLogs = reviewLog.addReviewLog(card.reviewLogs, log);

  return newCard;
}

export function predictRatingIntervals(
  card: Card,
  fsrsParams: number[] = DEFAULT_PARAMS_FSRS5
): Record<RatingValue, number> {
  const result: Partial<Record<RatingValue, number>> = {};

  // For each possible rating (Again, Hard, Good, Easy)
  for (const rating of [Rating.AGAIN, Rating.HARD, Rating.GOOD, Rating.EASY]) {
    // Calculate what the new stability would be with this rating
    const { stability: newStability } = algorithm.stability.updateStability(
      card.difficulty,
      card.stability,
      card.elapsedDays,
      rating,
      fsrsParams
    );

    // Calculate what the next interval would be with the new stability
    const scheduledDays = algorithm.retrievability.nextInterval(
      card.desiredRetention,
      newStability
    );

    result[rating] = scheduledDays;
  }

  return result as Record<RatingValue, number>;
}
