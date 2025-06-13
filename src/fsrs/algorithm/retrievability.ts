import { DEFAULT_PARAMS_FSRS6 } from "../const.js";

const getFactor = (w20: number): number => Math.pow(0.9, -1 / w20) - 1;

export const forgettingCurve = (
  elapsedDays: number,
  stability: number,
  params: readonly number[] = DEFAULT_PARAMS_FSRS6
): number => {
  if (stability <= 0) {
    return 0;
  }
  elapsedDays = Math.max(0, elapsedDays);
  const w20 = params[20];
  const factor = getFactor(w20);
  return Math.pow(1 + factor * (elapsedDays / stability), -w20);
};

export const nextInterval = (
  retrievability: number,
  stability: number,
  params: readonly number[] = DEFAULT_PARAMS_FSRS6
): number => {
  const w20 = params[20];
  const factor = getFactor(w20);
  return (stability / factor) * (Math.pow(retrievability, -1 / w20) - 1);
};
