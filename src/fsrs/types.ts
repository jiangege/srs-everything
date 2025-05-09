export enum Rating {
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}

export interface ReviewLog {
  id: string;
  reviewTime: number;
  rating: Rating;
  state: CardState;
  duration?: number;
}

export interface Card {
  id: string;
  due: number | null;
  state: CardState;
  difficulty: number;
  stability: number;
  elapsedDays: number;
  scheduledDays: number;
  lastReview: number | null;
  currentRetention: number;
  desiredRetention: number;
  postpones: number;
  reviewLogs: ReviewLog[];
}
