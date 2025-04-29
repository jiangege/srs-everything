import { Card } from "./types.js";
import { jitter } from "./utils/rand.js";

export const setPriority = (
  cards: readonly Card[],
  id: string,
  newPriority: number // 0–100 range
): readonly [readonly Card[], number] => {
  const ε = 0.9999;

  // 使用findIndex快速找到目标卡片
  const targetIndex = cards.findIndex((card) => card.id === id);

  if (targetIndex === -1) {
    return [cards, newPriority];
  }

  const targetCard = cards[targetIndex];

  // 计算抖动后的优先级
  const jitteredPriority = Math.max(
    0,
    Math.min(100, newPriority + jitter(targetCard.id) * ε)
  );

  // 使用现代JS的数组方法拆分数组并处理position
  // 1. 移除目标卡片
  // 2. 按优先级分组
  // 3. 在正确位置插入更新后的目标卡片
  const otherCards = cards.filter((_, i) => i !== targetIndex);

  // 使用reduce进行分组 - 比多次.filter()调用更高效
  const { lower, higher } = otherCards.reduce(
    (acc, card) => {
      if (card.priority <= jitteredPriority) {
        acc.lower.push(card);
      } else {
        acc.higher.push(card);
      }
      return acc;
    },
    { lower: [] as Card[], higher: [] as Card[] }
  );

  // 更新后的目标卡片
  const updatedTargetCard = {
    ...targetCard,
    priority: jitteredPriority,
    position: lower.length,
  };

  // 构建结果数组 - 使用现代数组方法和箭头函数
  const result = [
    // 更新较低优先级卡片的position
    ...lower.map((card, i) =>
      card.position !== i ? { ...card, position: i } : card
    ),
    // 插入目标卡片
    updatedTargetCard,
    // 更新较高优先级卡片的position
    ...higher.map((card, i) => {
      const newPos = lower.length + 1 + i;
      return card.position !== newPos ? { ...card, position: newPos } : card;
    }),
  ];

  return [result, jitteredPriority];
};
