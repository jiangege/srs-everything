import { Comprehension } from "./types.js";
import { DEFAULT_PARAMS_IR } from "./const.js";

export const skipInterval = (k: number): number =>
  Math.min(30, Math.round(Math.pow(k, 1.5)));

export const nextInterval = (
  comp: Comprehension,
  readCount: number,
  priority: number,
  params: Readonly<typeof DEFAULT_PARAMS_IR> = DEFAULT_PARAMS_IR
): number => {
  if (comp === Comprehension.Mastered) return Infinity; // never schedule again

  let base;

  if (comp === Comprehension.Unread) {
    base = params.baseSteps[0];
  } else if (comp === Comprehension.Browsed) {
    base = params.baseSteps[1];
  } else if (comp === Comprehension.Partial) {
    base = params.baseSteps[2];
  } else {
    base = params.baseSteps[3];
  }

  const growth = 1 + readCount * params.baseGrowthFactor; // seen-times factor
  const priorityFactor = params.basePriorityFactor + priority / 100; // 0.5 … 1.5

  return Math.ceil(base * growth * priorityFactor); // whole days
};
