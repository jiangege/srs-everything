import { Rating } from "./fsrs/index.js";

export enum CardType {
  Topic = "topic",
  Item = "item",
}

export enum CardState {
  New = 0,
  Learning = 1,
  Review = 2,
  ReLearning = 3,
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

export interface ItemCard extends BaseCard {
  difficulty: number;
  stability: number;
  desiredRetention: number;
}

export interface TopicCard extends BaseCard {}

export type Card = TopicCard | ItemCard;

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
