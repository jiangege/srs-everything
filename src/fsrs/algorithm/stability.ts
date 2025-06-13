import { Rating } from "../types.js";
import { initDifficulty, updateDifficulty } from "./difficulty.js";
import { forgettingCurve } from "./retrievability.js";

import {
  DEFAULT_PARAMS_FSRS6,
  MIN_STABILITY,
  MAX_STABILITY,
} from "../const.js";

const constrainStability = (stability: number): number =>
  Math.min(Math.max(stability, MIN_STABILITY), MAX_STABILITY);

export const initStability = (
  rating: Rating,
  params: readonly number[] = DEFAULT_PARAMS_FSRS6
): number => {
  // In FSRS, the initial stability is directly taken from the parameters w[0] to w[3]
  // based on the rating value (1-indexed)
  return constrainStability(params[rating - 1]);
};

export const sameDayStability = (
  stability: number,
  rating: Rating,
  params: readonly number[] = DEFAULT_PARAMS_FSRS6
): number => {
  // S′(S,G) = S · e^(w17 · (G - 3 + w18)) · S^{-w19}
  const exponent = params[17] * (rating - 3 + params[18]);
  const sInc = Math.exp(exponent) * Math.pow(stability, -params[19]);
  return constrainStability(stability * sInc);
};

export const recallStability = (
  difficulty: number,
  stability: number,
  retrievability: number,
  rating: Rating,
  params: readonly number[] = DEFAULT_PARAMS_FSRS6
): number => {
  // Apply modifier based on rating (Hard or Easy)
  const hardPenalty = rating === Rating.Hard ? params[15] : 1;
  const easyBonus = rating === Rating.Easy ? params[16] : 1;

  // Calculate the increase in stability (SInc)
  // S′_r(D,S,R,G) = S · (e^w8 · (11-D) · S^(-w9) · (e^(w10·(1-R))-1) · hardPenalty · easyBonus + 1)
  const expTerm = Math.exp(params[8]);
  const difficultyTerm = 11 - difficulty;
  const stabilityTerm = Math.pow(stability, -params[9]);
  const retrievabilityTerm = Math.exp(params[10] * (1 - retrievability)) - 1;

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
};

export const forgetStability = (
  difficulty: number,
  stability: number,
  retrievability: number,
  params: readonly number[] = DEFAULT_PARAMS_FSRS6
): number => {
  // S′_f(D,S,R) = w11 · D^(-w12) · ((S+1)^w13 - 1) · e^(w14·(1-R))
  const difficultyTerm = Math.pow(difficulty, -params[12]);
  const stabilityTerm = Math.pow(stability + 1, params[13]) - 1;
  const retrievabilityTerm = Math.exp(params[14] * (1 - retrievability));

  return constrainStability(
    params[11] * difficultyTerm * stabilityTerm * retrievabilityTerm
  );
};

export const updateStability = (
  difficulty: number,
  stability: number,
  elapsedDays: number,
  rating: Rating,
  params: readonly number[] = DEFAULT_PARAMS_FSRS6
): Readonly<{ difficulty: number; stability: number }> => {
  if (!difficulty || !stability) {
    return {
      difficulty: initDifficulty(rating, params),
      stability: initStability(rating, params),
    };
  }

  const retrievability = forgettingCurve(elapsedDays, stability, params);

  const newDifficulty = updateDifficulty(difficulty, rating, params);

  let newStability;
  if (elapsedDays < 1) {
    newStability = sameDayStability(stability, rating, params);
  } else if (rating > 1) {
    newStability = recallStability(
      difficulty,
      stability,
      retrievability,
      rating,
      params
    );
  } else {
    newStability = forgetStability(
      difficulty,
      stability,
      retrievability,
      params
    );
  }

  return {
    difficulty: newDifficulty,
    stability: newStability,
  };
};
