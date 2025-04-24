export enum CardState {
  NEW = 0,
  LEARNING = 1,
}

export interface Card {
  id: string;
  due: number | null;
  priority: number;
  state: CardState;
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
}
