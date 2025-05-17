import {
  Card,
  CardState,
  CardType,
  OutstandingQueueParams,
  ItemCard,
} from "./types.js";

import { mulberry32, hashStringToNumber } from "./utils/rand.js";
import { endOfDay } from "./utils/date.js";
import { calcOddsRatio } from "./card.js";

export const sortCards = (
  cards: readonly Card[],
  now: number,
  params: OutstandingQueueParams,
  sort: "asc" | "desc" = "asc" // ④ Select ascending/descending order, default ascending
): readonly Card[] => {
  const scoredCards = cards.map((c, idx) => {
    const normP = c.priority / 100;
    const rand = mulberry32(now ^ hashStringToNumber(c.id))();
    const pWeight =
      c.type === CardType.Item
        ? params.itemPriorityRatio
        : params.topicPriorityRatio;
    const baseScore = pWeight * normP + (1 - pWeight) * rand;
    if (c.type === CardType.Item && c.state !== CardState.New) {
      const o = calcOddsRatio(c as ItemCard, now);
      const normO = (-o / (1 + Math.abs(o)) + 1) / 2 / 0.75;
      const finalScore =
        (1 - params.oddsWeight) * baseScore + params.oddsWeight * normO;
      return {
        card: c,
        score: finalScore,
        idx,
      };
    } else {
      return {
        card: c,
        score: baseScore,
        idx,
      };
    }
  });

  return scoredCards
    .sort((a, b) => {
      if (a.score !== b.score) {
        return sort === "asc" ? a.score - b.score : b.score - a.score;
      }
      return a.idx - b.idx;
    })
    .map(({ card }) => card);
};

export const interleaveCards = (
  cards: readonly Card[],
  ratio: number
): readonly Card[] => {
  if (cards.length <= 1 || ratio <= 0) return cards;

  const topics: Card[] = [];
  const items: Card[] = [];
  let itemFirst = false;

  for (const c of cards) {
    if (c.type === CardType.Topic) {
      topics.push(c);
    } else if (c.type === CardType.Item) {
      items.push(c);
      if (topics.length === 0 && items.length === 1) itemFirst = true;
    }
  }

  if (topics.length === 0 || items.length === 0) return cards;

  const result: Card[] = [];
  let t = 0,
    i = 0;

  let debt = itemFirst ? ratio : 0;

  while (t < topics.length && i < items.length) {
    if (debt <= 0) {
      result.push(topics[t++]);
      debt += 1;
    } else if (debt > 0) {
      result.push(items[i++]);
      debt -= ratio;
    }
  }

  while (t < topics.length) result.push(topics[t++]);
  while (i < items.length) result.push(items[i++]);

  return result;
};

/**
 * Generate queues of outstanding and postponed cards
 */
export const generateOutstandingQueue = (
  cards: readonly Card[],
  now: number,
  params: OutstandingQueueParams
): readonly Card[] => {
  const endToday = endOfDay(now);
  const candidates = cards.filter(
    (c) => c.state === CardState.New || (c.due != null && c.due <= endToday)
  );

  return sortCards(candidates, now, params, "asc");
};
