import { ReviewLog } from "./types.js";

export function addReviewLog(
  reviewLogs: ReviewLog[],
  log: ReviewLog
): ReviewLog[] {
  return [...reviewLogs, log];
}

export function deleteReviewLog(
  reviewLogs: ReviewLog[],
  id: string
): ReviewLog[] {
  return reviewLogs.filter((log) => log.id !== id);
}
