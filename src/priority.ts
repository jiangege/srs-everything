import { Card } from "./types.js";
import { jitter } from "./utils/rand.js";

export const applyPriority = (
  card: Readonly<Card>,
  newPriority: number // 0–100 range
): Readonly<Card> => {
  const ε = 0.9999;

  // Calculate jittered priority
  const jitteredPriority = Math.max(
    0,
    Math.min(100, newPriority + jitter(card.id) * ε)
  );

  const updatedCard = {
    ...card,
    priority: jitteredPriority,
  };

  return updatedCard;
};
