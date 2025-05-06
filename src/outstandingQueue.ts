import {
  Card,
  CardState,
  CardType,
  OutstandingQueueParams,
  FsrsCard,
} from "./types.js";

import { algorithm } from "./fsrs/index.js";
import { mulberry32, hashStringToNumber } from "./utils/rand.js";
import { endOfDay } from "./utils/dateHelper.js";
import { computeElapsedDays } from "./utils/cardHelper.js";

export const filterCards = (
  cards: readonly Card[],
  state: CardState
): readonly Card[] => {
  return cards.filter((card) => card.state === state);
};

export const calcOddsRatio = (card: FsrsCard, now: number): number => {
  const elapsedDays = computeElapsedDays(card, now);
  if (!card.stability) {
    return 0;
  }
  const rCurrent = algorithm.retrievability.forgettingCurve(
    elapsedDays,
    card.stability
  );
  const rDesired = card.desiredRetention;

  return (1 / rCurrent - 1) / (1 / rDesired - 1) - 1;
};

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
    // ①-A priority
    minP = Math.min(minP, c.priority);
    maxP = Math.max(maxP, c.priority);

    // ①-B oddsRatio（仅 FSRS 卡）
    if (c.type === CardType.FSRS) {
      const o = calcOddsRatio(c as FsrsCard, now);
      minO = Math.min(minO, o);
      maxO = Math.max(maxO, o);
    }
  }
  if (minO === Infinity) {
    // 没有 FSRS 卡
    minO = 0;
    maxO = 1;
  }
  const rangeP = maxP - minP || 1;
  const rangeO = maxO - minO || 1;
  const oddsWeight = params.oddsWeight ?? 0.5;

  /* ② 计算 score */
  const scored = cards.map((c, idx) => {
    // ②-A priority ↦ mixPR
    const normP = (c.priority - minP) / rangeP;
    const rand = mulberry32(now ^ hashStringToNumber(c.id))();
    const prW =
      c.type === CardType.FSRS
        ? params.itemPriorityRatio
        : params.topicPriorityRatio;
    const mixPR =
      prW <= 0 ? rand : prW >= 1 ? normP : prW * normP + (1 - prW) * rand;

    // ②-B oddsRatio ↦ 1-normO（只算一次）
    let score = mixPR;
    if (c.type === CardType.FSRS) {
      const o = calcOddsRatio(c as FsrsCard, now);
      const normO = (o - minO) / rangeO; // 0 … 1（越大说明赔率比值越大）

      score = oddsWeight * (1 - normO) + (1 - oddsWeight) * mixPR;
    }

    return { card: c, score, idx };
  });

  const result = scored
    .sort((a, b) => {
      if (a.score !== b.score)
        return sort === "asc" ? a.score - b.score : b.score - a.score;
      return a.idx - b.idx; // 稳定排序
    })
    .map(({ card }) => card);

  return result;
};

export const generateOutstandingQueue = (
  cards: readonly Card[],
  now: number,
  params: OutstandingQueueParams
): readonly [Card[], Card[]] => {
  const outstanding: Card[] = [];
  const postponed: Card[] = [];

  const endToday = endOfDay(now);

  // —— 1. 筛选出今日可候选的卡 —— //
  const candidates = cards.filter(
    (c) => c.state === CardState.NEW || (c.due != null && c.due <= endToday)
  );

  // —— 2. 第一阶段排序：紧急度优先 —— //
  const baseSorted = sortCards(
    candidates,
    now,
    {
      itemPriorityRatio: params.itemPriorityRatio,
      topicPriorityRatio: params.topicPriorityRatio,
      oddsWeight: params.oddsWeight,
    },
    "desc"
  );

  // —— 3. 拆分 FSRS(item) 与 IR(topic) 两路 —— //
  const items = baseSorted.filter((c) => c.type === CardType.FSRS);
  const topics = baseSorted.filter((c) => c.type !== CardType.FSRS);

  // —— 4. 第二阶段合并：按 topicToItemRatio 交叉 —— //
  const ratio = params.topicToItemRatio;

  // 计算合并节奏，保证 ratio = topicCount / itemCount
  // 限制极端比例值，防止 quota 过大导致的不平衡
  const MAX_QUOTA = 10; // 设置合理的最大配额限制

  // 添加安全检查，防止除以零或极小值
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

  // 处理任一数组为空的情况
  if (items.length === 0) {
    // 如果没有 items，直接返回所有 topics
    const outstanding = topics.slice(0, params.maxTopicsPerDay);
    const postponed = topics.slice(params.maxTopicsPerDay);
    return [outstanding, postponed];
  }
  if (topics.length === 0) {
    // 如果没有 topics，直接返回所有 items
    const outstanding = items.slice(0, params.maxItemsPerDay);
    const postponed = items.slice(params.maxItemsPerDay);
    return [outstanding, postponed];
  }

  // 基于 topicToItemRatio 确定主要和次要卡片类型
  // 当 ratio <= 1 时，items 是主要类型，topics 是次要类型
  // 当 ratio > 1 时，topics 是主要类型，items 是次要类型
  const primary = ratio <= 1 ? items : topics;
  const secondary = ratio <= 1 ? topics : items;

  // 确定每组插入的主要类型卡片数量
  // 当 ratio <= 1 时，使用 itemsPerTopic (每个topic间应插入多少个item)
  // 当 ratio > 1 时，使用 topicsPerItem (每个item间应插入多少个topic)
  const quota = ratio <= 1 ? itemsPerTopic : topicsPerItem;

  // 用于存储合并后的卡片序列
  const merged: Card[] = [];
  let pi = 0, // 主要类型卡片的当前索引
    si = 0; // 次要类型卡片的当前索引

  // 使用改进的交叉合并算法
  while (pi < primary.length || si < secondary.length) {
    // 如果主要类型已用完但次要类型还有剩余，添加所有剩余的次要类型
    if (pi >= primary.length) {
      merged.push(...secondary.slice(si));
      break;
    }

    // 如果次要类型已用完但主要类型还有剩余，添加所有剩余的主要类型
    if (si >= secondary.length) {
      merged.push(...primary.slice(pi));
      break;
    }

    // 正常情况：先插入quota张主要类型的卡片
    const toInsert = Math.min(quota, primary.length - pi);
    for (let cnt = 0; cnt < toInsert; cnt++) {
      merged.push(primary[pi++]);
    }

    // 再插入1张次要类型的卡片
    if (si < secondary.length) {
      merged.push(secondary[si++]);
    }
  }

  // —— 5. 限额分流 —— //
  const counter = { item: 0, topic: 0, newItem: 0, newTopic: 0 };

  for (const c of merged) {
    const isItem = c.type === CardType.FSRS;
    const isNew = c.state === CardState.NEW;

    // 当日总量 & 当日新卡量
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
