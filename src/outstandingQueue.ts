import { Card, CardState, CardType, OutstandingQueueOptions } from "./types";

import { endOfDay } from "./utils/dateHelper.ts";
import { seededRandom } from "./utils/rand.ts";

export const filterCards = (
  cards: readonly Card[],
  state: CardState
): readonly Card[] => {
  return cards.filter((card) => card.state === state);
};

export const sortCards = (
  cards: readonly Card[],
  priorityWeight: number,
  seed: number
): readonly Card[] => {
  if (priorityWeight <= 0) {
    // Full randomness
    return [...cards].sort(() => Math.random() - 0.5);
  }

  if (priorityWeight >= 1) {
    // Sort purely by priority (ascending)
    return [...cards].sort((a, b) => a.priority - b.priority);
  }

  // Create a copy to avoid mutating the original array
  const sortedCards = [...cards];

  // Apply weighted sorting
  return sortedCards.sort((a, b) => {
    // Use priority for sorting based on the weight
    if (seededRandom(seed) < priorityWeight) {
      return a.priority - b.priority;
    }
    // Add randomness for the remaining portion
    return seededRandom(seed) - 0.5;
  });
};

export const computeOutstandingQueue = (
  cards: readonly Card[],
  now: number,
  options: OutstandingQueueOptions
) => {
  const dueItemCards: Card[] = [];
  const dueTopicCards: Card[] = [];
  const newItemCards: Card[] = [];
  const newTopicCards: Card[] = [];

  // Get end of current day to consider all cards due today as expired
  const todayEnd = endOfDay(now);

  for (const card of cards) {
    if (card.due && card.due <= todayEnd) {
      const isFsrs = card.type === CardType.FSRS;
      const isNew = card.state === CardState.NEW;

      if (isFsrs) {
        dueItemCards.push(card);
        if (isNew) {
          newItemCards.push(card);
        }
      } else {
        dueTopicCards.push(card);
        if (isNew) {
          newTopicCards.push(card);
        }
      }
    }
  }

  return [];
};
