import { IR_PARAMS } from "./const.js";

export const nextInterval = (
  repHistoryCount: number,
  params = IR_PARAMS
): number => {
  return Math.ceil(params.MULTIPLIER ** Math.max(repHistoryCount, 1));
};
