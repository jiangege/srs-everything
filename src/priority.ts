import { Card } from "./types.js";
import { jitter } from "./utils/rand.js";

export const setPriority = (
  cards: readonly Card[],
  id: string,
  newPriority: number // 0–100 range
): readonly [readonly Card[], Readonly<Card>] => {
  // Epsilon value 0.9999 for jitter range [0.0000, +0.9999]
  const ε = 0.9999;

  // 1. Update target card priority with upward jitter
  const updated = cards.map((c) =>
    c.id === id
      ? {
          ...c,
          // hashToFrac(id) * ε creates a consistent pseudo-random jitter in [0, ε)
          // newPriority + jitter ∈ [newPriority, newPriority + 0.9999)
          priority: Math.max(0, Math.min(100, newPriority + jitter(c.id) * ε)),
        }
      : { ...c }
  );

  // 2. Sort by priority only
  const sorted = [...updated].sort((a, b) => a.priority - b.priority);

  // 3. Regenerate position values
  return [
    sorted.map((c, idx) => ({
      ...c,
      position: idx,
    })),
    updated.find((c) => c.id === id) as Readonly<Card>,
  ];
};
