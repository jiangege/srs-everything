export enum Rating {
  AGAIN = 1,
  HARD = 2,
  GOOD = 3,
  EASY = 4,
}

export enum CardState {
  NEW = 0,
  LEARNING = 1,
  REVIEW = 2,
  DONE = 3,
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
