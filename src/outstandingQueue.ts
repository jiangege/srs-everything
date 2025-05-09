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
  params: Pick<
    OutstandingQueueParams,
    "itemPriorityRatio" | "topicPriorityRatio" | "oddsWeight"
  >,
  sort: "asc" | "desc" = "asc" // ④ 选升/降序，默认升序
): readonly Card[] => {
  /* ① 预扫 priority 与 oddsRatio 的范围 */
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

    // 优先级越高，分数越高
    const mixPR =
      prW <= 0 ? rand : prW >= 1 ? normP : prW * normP + (1 - prW) * rand;

    let score = mixPR;
    if (c.type === CardType.Item) {
      const o = calcOddsRatio(c as ItemCard, now);
      const normO = (o - minO) / rangeO;

      // 赔值越高，分数越高
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

/**
 * Check if either category is empty and return appropriate queue
 * Returns [empty array, empty array] if both categories have items
 */
const getQueuesIfCategoryEmpty = (
  items: Card[],
  topics: Card[],
  params: OutstandingQueueParams
): readonly [Card[], Card[]] => {
  if (items.length === 0) {
    // If no items, return all topics up to max limit
    const outstanding = topics.slice(0, params.maxTopicsPerDay);
    const postponed = topics.slice(params.maxTopicsPerDay);
    return [outstanding, postponed];
  }
  if (topics.length === 0) {
    // If no topics, return all items up to max limit
    const outstanding = items.slice(0, params.maxItemsPerDay);
    const postponed = items.slice(params.maxItemsPerDay);
    return [outstanding, postponed];
  }

  return [[], []]; // Empty result to indicate no special case handled
};

export const interleaveCards = (
  items: readonly Card[],
  topics: readonly Card[],
  ratio: number
): readonly Card[] => {
  const MAX_QUOTA = 10;
  const itemsPerTopic =
    ratio <= 0
      ? MAX_QUOTA
      : ratio <= 1
      ? Math.min(MAX_QUOTA, Math.max(1, Math.round(1 / ratio)))
      : 1;

  const topicsPerItem =
    ratio <= 0
      ? 1
      : ratio > 1
      ? Math.min(MAX_QUOTA, Math.max(1, Math.round(ratio)))
      : 1;

  // Determine primary and secondary card types based on ratio
  const primary = ratio <= 1 ? items : topics;
  const secondary = ratio <= 1 ? topics : items;
  const quota = ratio <= 1 ? itemsPerTopic : topicsPerItem;

  // Merge the two card types
  const merged: Card[] = [];
  let pi = 0, // primary index
    si = 0; // secondary index

  while (pi < primary.length || si < secondary.length) {
    // If primary is exhausted but secondary remains
    if (pi >= primary.length) {
      merged.push(...secondary.slice(si));
      break;
    }

    // If secondary is exhausted but primary remains
    if (si >= secondary.length) {
      merged.push(...primary.slice(pi));
      break;
    }

    // Normal case: insert quota cards from primary
    const toInsert = Math.min(quota, primary.length - pi);
    for (let cnt = 0; cnt < toInsert; cnt++) {
      merged.push(primary[pi++]);
    }

    // Then insert 1 card from secondary
    if (si < secondary.length) {
      merged.push(secondary[si++]);
    }
  }

  return merged;
};

/**
 * Apply daily limits to cards and split into outstanding and postponed queues
 */
export const applyDailyLimits = (
  cards: readonly Card[],
  params: OutstandingQueueParams
): readonly [Card[], Card[]] => {
  const outstanding: Card[] = [];
  const postponed: Card[] = [];
  const counter = { item: 0, topic: 0, newItem: 0, newTopic: 0 };

  for (const c of cards) {
    const isItem = c.type === CardType.Item;
    const isNew = c.state === CardState.New;

    // Daily total & new card limits
    const dayCap = isItem ? params.maxItemsPerDay : params.maxTopicsPerDay;
    const newCap = isItem
      ? params.maxNewItemsPerDay
      : params.maxNewTopicsPerDay;

    const used = isItem ? counter.item : counter.topic;
    const usedNew = isItem ? counter.newItem : counter.newTopic;

    if (used < dayCap && (!isNew || usedNew < newCap)) {
      outstanding.push(c);
      if (isItem) {
        counter.item++;
        if (isNew) counter.newItem++;
      } else {
        counter.topic++;
        if (isNew) counter.newTopic++;
      }
    } else {
      postponed.push(c);
    }
  }

  return [outstanding, postponed];
};

/**
 * Generate queues of outstanding and postponed cards
 */
export const generateOutstandingQueue = (
  cards: readonly Card[],
  now: number,
  params: OutstandingQueueParams
): readonly [Card[], Card[]] => {
  const endToday = endOfDay(now);

  // Step 1: Filter eligible cards for today
  const candidates = cards.filter(
    (c) => c.state === CardState.New || (c.due != null && c.due <= endToday)
  );

  // Step 2: Initial sorting by urgency
  const baseSorted = sortCards(
    candidates,
    now,
    {
      itemPriorityRatio: params.itemPriorityRatio,
      topicPriorityRatio: params.topicPriorityRatio,
      oddsWeight: params.oddsWeight,
    },
    "asc"
  );

  // Step 3: Split into FSRS (items) and IR (topics)
  const items = baseSorted.filter((c) => c.type === CardType.Item);
  const topics = baseSorted.filter((c) => c.type === CardType.Topic);

  // Step 4: Handle special cases (empty categories)
  const [emptyOutstanding, emptyPostponed] = getQueuesIfCategoryEmpty(
    items,
    topics,
    params
  );
  if (emptyOutstanding.length > 0 || emptyPostponed.length > 0) {
    return [emptyOutstanding, emptyPostponed];
  }

  // Step 5: Interleave items and topics based on ratio
  const merged = interleaveCards(items, topics, params.topicToItemRatio);

  // Step 6: Apply daily limits and split into outstanding and postponed
  return applyDailyLimits(merged, params);
};
