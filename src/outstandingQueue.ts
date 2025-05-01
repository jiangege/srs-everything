import {
  Card,
  CardState,
  CardType,
  OutstandingQueueParams,
  FsrsCard,
} from "./types";

import { algorithm } from "./fsrs/index.js";
import { mulberry32, hashStringToNumber } from "./utils/rand.ts";
import { computeElapsedDays } from "./utils/cardHelper.js";

export const filterCards = (
  cards: readonly Card[],
  state: CardState
): readonly Card[] => {
  return cards.filter((card) => card.state === state);
};

export const calcOddsRatio = (card: FsrsCard, now: number): number => {
  const elapsedDays = computeElapsedDays(card, now);
  const rCurrent = algorithm.retrievability.forgettingCurve(
    elapsedDays,
    card.stability
  );
  const rDesired = card.desiredRetention;

  return (1 / rCurrent - 1) / (1 / rDesired - 1) - 1;
};

export const sortCards = (
  cards: readonly Card[],
  seed: number,
  params: OutstandingQueueParams
): readonly Card[] => {
  // —— 1. 预扫描 priority 和 FSRS oddsRatio 范围 —— //
  let minP = Infinity,
    maxP = -Infinity;
  const fsrsOdds: number[] = [];

  for (const c of cards) {
    // priority 范围
    if (c.priority < minP) minP = c.priority;
    if (c.priority > maxP) maxP = c.priority;

    // oddsRatio 范围（只针对 FSRS）
    if (c.type === CardType.FSRS) {
      const o = calcOddsRatio(c as FsrsCard);
      fsrsOdds.push(o);
    }
  }

  const rangeP = maxP - minP || 1;
  const minO = fsrsOdds.length ? Math.min(...fsrsOdds) : 0;
  const maxO = fsrsOdds.length ? Math.max(...fsrsOdds) : 1;
  const rangeO = maxO - minO || 1;

  // odds vs (priority+rand) 的混合权重，默认 0.5
  const oddsWeight = params.oddsVsPriorityRandRatio ?? 0.5;

  // —— 2. 计算每张卡片的综合打分 —— //
  const scored = cards.map((c, idx) => {
    // 2.1 归一化优先级 ∈ [0,1]
    const normP = (c.priority - minP) / rangeP;

    const rawId = hashStringToNumber(c.id);
    const cardSeed = seed ^ rawId;
    const rand = mulberry32(cardSeed)();

    // 2.3 “优先级 vs 随机”混合分 mixPR
    const prWeight =
      c.type === CardType.FSRS
        ? params.itemPriorityVsRandRatio
        : params.topicPriorityVsRandRatio;

    let mixPR: number;
    if (prWeight <= 0) {
      mixPR = rand;
    } else if (prWeight >= 1) {
      mixPR = normP;
    } else {
      mixPR = prWeight * normP + (1 - prWeight) * rand;
    }

    // 2.4 最终 score
    let score: number;
    if (c.type === CardType.FSRS) {
      // 实时计算 oddsRatio 并归一化
      const o = calcOddsRatio(c as FsrsCard);
      const normO = (o - minO) / rangeO;
      score = oddsWeight * normO + (1 - oddsWeight) * mixPR;
    } else {
      score = mixPR;
    }

    return { card: c, score, originalIndex: idx };
  });

  // —— 3. 按 score 升序、同分按原始顺序稳定排序 —— //
  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.originalIndex - b.originalIndex;
  });

  // —— 4. 输出排序后的卡片列表 —— //
  return scored.map((x) => x.card);
};
