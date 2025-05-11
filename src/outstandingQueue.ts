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
  /* ① Pre-scan priority and oddsRatio ranges */
  let minP = Infinity,
    maxP = -Infinity;
  let minO = Infinity,
    maxO = -Infinity;

  for (const c of cards) {
    minP = Math.min(minP, c.priority);
    maxP = Math.max(maxP, c.priority);

    if (c.type === CardType.Item) {
      const o = calcOddsRatio(c as ItemCard, now);
      minO = Math.min(minO, o);
      maxO = Math.max(maxO, o);
    }
  }
  if (minO === Infinity) {
    minO = 0;
    maxO = 1;
  }
  const rangeP = maxP - minP || 1;
  const rangeO = maxO - minO || 1;
  const oddsWeight = params.oddsWeight ?? 0.5;

  const scored = cards.map((c, idx) => {
    const normP = (c.priority - minP) / rangeP;
    const rand = mulberry32(now ^ hashStringToNumber(c.id))();
    const prW =
      c.type === CardType.Item
        ? params.itemPriorityRatio
        : params.topicPriorityRatio;

    // Higher priority, higher score
    const mixPR =
      prW <= 0 ? rand : prW >= 1 ? normP : prW * normP + (1 - prW) * rand;

    let score = mixPR;
    if (c.type === CardType.Item) {
      const o = calcOddsRatio(c as ItemCard, now);
      const normO = (o - minO) / rangeO;

      // Higher odds, higher score
      score = oddsWeight * normO + (1 - oddsWeight) * mixPR;
    }

    return { card: c, score, idx };
  });

  return scored
    .sort((a, b) => {
      if (a.score !== b.score)
        return sort === "asc" ? a.score - b.score : b.score - a.score;
      return a.idx - b.idx;
    })
    .map(({ card }) => card);
};

export const interleaveCards = (
  cards: readonly Card[],
  ratio: number
): readonly Card[] => {
  if (cards.length <= 1 || ratio < 0) {
    return cards;
  }

  // Separate cards into Topics and Items, and track which type appears first
  const topics: Card[] = [];
  const items: Card[] = [];
  let firstTopicIdx = -1;
  let firstItemIdx = -1;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (card.type === CardType.Topic) {
      topics.push(card);
      if (firstTopicIdx === -1) firstTopicIdx = i;
    } else if (card.type === CardType.Item) {
      items.push(card);
      if (firstItemIdx === -1) firstItemIdx = i;
    }
  }

  // If only one type of card exists, return original cards
  if (topics.length === 0 || items.length === 0 || ratio === 0) {
    return cards;
  }

  const result: Card[] = [];
  const itemFirst =
    firstItemIdx !== -1 &&
    (firstTopicIdx === -1 || firstItemIdx < firstTopicIdx);
  let t = 0,
    i = 0;

  // Handle first element (if item appears first)
  if (itemFirst) {
    const initialItems =
      ratio >= 1
        ? Math.min(Math.round(ratio), items.length) // For ratio >= 1, add ratio items
        : 1; // For ratio < 1, add 1 item

    for (let j = 0; j < initialItems && i < items.length; j++) {
      result.push(items[i++]);
    }
  }

  // Main loop: interleave cards according to ratio
  if (ratio >= 1) {
    // ratio≥1: Each topic is followed by ratio items
    const itemsPerTopic = Math.round(ratio);

    while (t < topics.length) {
      // Add 1 topic
      result.push(topics[t++]);

      // Add itemsPerTopic items
      for (let j = 0; j < itemsPerTopic && i < items.length; j++) {
        result.push(items[i++]);
      }
    }
  } else {
    // ratio<1: Every 1/ratio topics are followed by 1 item
    const topicsPerItem = Math.round(1 / ratio);

    while (t < topics.length && i < items.length) {
      // Add topicsPerItem topics
      const topicsToAdd = Math.min(topicsPerItem, topics.length - t);
      for (let j = 0; j < topicsToAdd; j++) {
        result.push(topics[t++]);
      }

      // Add 1 item
      result.push(items[i++]);
    }
  }

  // Add remaining cards
  while (t < topics.length) {
    result.push(topics[t++]);
  }

  while (i < items.length) {
    result.push(items[i++]);
  }

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
