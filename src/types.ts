import { Rating } from "./fsrs/index.js";

export enum CardType {
  FSRS = "fsrs",
  IR = "ir",
}

export enum CardState {
  NEW = 0,
  LEARNING = 1,
  REVIEW = 2,
  RELEARNING = 3,
}

export interface BaseCard {
  id: string;
  due: number | null;
  state: CardState;
  type: CardType;
  priority: number;
  position: number;
  scheduledDays: number;
  maxScheduledDays: number;
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
  desiredRetention: number;
}

export interface IrCard extends BaseCard {}

export type Card = FsrsCard | IrCard;

export interface OutstandingQueueParams {
  maxNewItemsPerDay: number;
  maxNewTopicsPerDay: number;
  itemPriorityRatio: number;
  topicPriorityRatio: number;
  maxItemsPerDay: number;
  maxTopicsPerDay: number;
  topicToItemRatio: number;
  oddsWeight: number;
}
