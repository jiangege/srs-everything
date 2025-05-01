import { FsrsCard } from "../types.js";
import { msToDays } from "./dateHelper.js";

export const computeElapsedDays = (
  card: Readonly<FsrsCard>,
  reviewTime: number
): number => {
  return card.lastReview ? msToDays(reviewTime - card.lastReview) : 0;
};
