import { RatingValue, Rating } from "../types.js";
import { initDifficulty, updateDifficulty } from "./difficulty.js";
import { forgettingCurve } from "./retrievability.js";

import {
  DEFAULT_PARAMS_FSRS5,
  MIN_STABILITY,
  MAX_STABILITY,
} from "../const.js";

function constrainStability(stability: number): number {
  return Math.min(Math.max(stability, MIN_STABILITY), MAX_STABILITY);
}

export function initStability(
  rating: RatingValue,
  fsrsParams: number[] = DEFAULT_PARAMS_FSRS5
): number {
  // In FSRS, the initial stability is directly taken from the parameters w[0] to w[3]
  // based on the rating value (1-indexed)
  return constrainStability(fsrsParams[rating - 1]);
}

export function sameDayStability(
  stability: number,
  rating: RatingValue,
  fsrsParams: number[] = DEFAULT_PARAMS_FSRS5
): number {
  // S′(S,G) = S · e^(w17 · (G - 3 + w18))
  const exponent = fsrsParams[17] * (rating - 3 + fsrsParams[18]);
  return constrainStability(stability * Math.exp(exponent));
}

export function recallStability(
  difficulty: number,
  stability: number,
  retrievability: number,
  rating: RatingValue,
  fsrsParams: number[] = DEFAULT_PARAMS_FSRS5
): number {
  // Apply modifier based on rating (Hard or Easy)
  const hardPenalty = rating === Rating.HARD ? fsrsParams[15] : 1;
  const easyBonus = rating === Rating.EASY ? fsrsParams[16] : 1;

  // Calculate the increase in stability (SInc)
  // S′_r(D,S,R,G) = S · (e^w8 · (11-D) · S^(-w9) · (e^(w10·(1-R))-1) · hardPenalty · easyBonus + 1)
  const expTerm = Math.exp(fsrsParams[8]);
  const difficultyTerm = 11 - difficulty;
  const stabilityTerm = Math.pow(stability, -fsrsParams[9]);
  const retrievabilityTerm =
    Math.exp(fsrsParams[10] * (1 - retrievability)) - 1;

  // Combine all terms to get the stability increase factor
  const stabilityIncrease =
    expTerm *
      difficultyTerm *
      stabilityTerm *
      retrievabilityTerm *
      hardPenalty *
      easyBonus +
    1;

  // Apply the increase to the current stability
  return constrainStability(stability * stabilityIncrease);
}

export function forgetStability(
  difficulty: number,
  stability: number,
  retrievability: number,
  fsrsParams: number[] = DEFAULT_PARAMS_FSRS5
): number {
  // S′_f(D,S,R) = w11 · D^(-w12) · ((S+1)^w13 - 1) · e^(w14·(1-R))
  const difficultyTerm = Math.pow(difficulty, -fsrsParams[12]);
  const stabilityTerm = Math.pow(stability + 1, fsrsParams[13]) - 1;
  const retrievabilityTerm = Math.exp(fsrsParams[14] * (1 - retrievability));

  return constrainStability(
    fsrsParams[11] * difficultyTerm * stabilityTerm * retrievabilityTerm
  );
}

export function updateStability(
  difficulty: number,
  stability: number,
  elapsedDays: number,
  rating: RatingValue,
  fsrsParams: number[] = DEFAULT_PARAMS_FSRS5
) {
  if (!difficulty || !stability) {
    return {
      difficulty: initDifficulty(rating, fsrsParams),
      stability: initStability(rating, fsrsParams),
    };
  }

  const retrievability = forgettingCurve(elapsedDays, stability);

  const newDifficulty = updateDifficulty(difficulty, rating, fsrsParams);

  let newStability;
  if (elapsedDays < 1) {
    newStability = sameDayStability(stability, rating, fsrsParams);
  } else if (rating > 1) {
    newStability = recallStability(
      difficulty,
      stability,
      retrievability,
      rating,
      fsrsParams
    );
  } else {
    newStability = forgetStability(
      difficulty,
      stability,
      retrievability,
      fsrsParams
    );
  }

  return {
    difficulty: newDifficulty,
    stability: newStability,
  };
}
