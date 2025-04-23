import { RatingValue } from "../types.js";
import {
  DEFAULT_PARAMS_FSRS5,
  MAX_DIFFICULTY,
  MIN_DIFFICULTY,
} from "../const.js";

function constrainDifficulty(difficulty: number): number {
  return Math.min(Math.max(difficulty, MIN_DIFFICULTY), MAX_DIFFICULTY);
}

export function initDifficulty(
  rating: RatingValue,
  params: number[] = DEFAULT_PARAMS_FSRS5
): number {
  // 计算初始难度 D₀(G) = w4 - exp( w5 * (G - 1) ) + 1
  const exponent = params[5] * (rating - 1);
  return constrainDifficulty(params[4] - Math.exp(exponent) + 1);
}

export function updateDifficulty(
  difficulty: number,
  rating: RatingValue,
  params: number[] = DEFAULT_PARAMS_FSRS5
): number {
  // 计算线性阻尼：ΔD = -w6 * (G - 3)
  const deltaD = -params[6] * (rating - 3);

  // 初步更新：D′ = D + ΔD * (10 - D)/9
  const primeDifficulty = difficulty + deltaD * ((10 - difficulty) / 9);

  // 计算初始难度 D₀(4)：
  // D₀(G) = w4 - exp( w5 * (G - 1) ) + 1，当 G=4 时：
  // D₀(4) = w4 - exp( 3*w5 ) + 1
  const d0 = initDifficulty(4, params);

  // 均值回归：D″ = w7 * D₀(4) + (1 - w7) * D′
  const doublePrimeDifficulty =
    params[7] * d0 + (1 - params[7]) * primeDifficulty;

  return constrainDifficulty(doublePrimeDifficulty);
}
