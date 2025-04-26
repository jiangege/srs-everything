import { ReviewLog } from "./types.js";

export const appendReviewLog = (
  reviewLogs: readonly ReviewLog[],
  log: Readonly<ReviewLog>
): readonly ReviewLog[] => {
  return [...reviewLogs, log];
};

export const withoutReviewLog = (
  reviewLogs: readonly ReviewLog[],
  id: string
): readonly ReviewLog[] => {
  return reviewLogs.filter((log) => log.id !== id);
};
