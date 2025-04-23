const DECAY = -0.5;
const FACTOR = 19 / 81;

export function forgettingCurve(
  elapsedDays: number,
  stability: number
): number {
  if (stability <= 0) {
    return 0;
  }
  elapsedDays = Math.max(0, elapsedDays);
  return Math.pow(1 + FACTOR * (elapsedDays / stability), DECAY);
}

export function nextInterval(
  retrievability: number,
  stability: number
): number {
  return (stability / FACTOR) * (retrievability ** (1 / DECAY) - 1);
}
