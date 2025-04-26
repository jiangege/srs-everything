import { Rating } from "./fsrs/types.js";
import { Comprehension } from "./ir/types.js";

export enum CardType {
  FSRS = "fsrs",
  IR = "ir",
}

export enum CardState {
  NEW = "new",
  LEARNING = "learning",
  REVIEW = "review",
  DONE = "done",
}

export interface BaseCard {
  id: string;
  due: number | null;
  state: CardState;
  type: CardType;
  priority: number;
  position: number;
  elapsedDays: number;
  scheduledDays: number;
  lastReview: number | null;
  postpones: number;
  reviewLogs: ReviewLog[];
}

export interface ReviewLog {
  id: string;
  reviewTime: number;
  state: CardState;
  duration?: number;
  rating?: Rating;
}

export interface FsrsCard extends BaseCard {
  difficulty: number;
  stability: number;
  currentRetention: number;
  desiredRetention: number;
}

export interface IrCard extends BaseCard {
  comp: Comprehension;
}

export type Card = FsrsCard | IrCard;
