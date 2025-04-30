export const jitter = (s: string): number => {
  let hash = 0x811c9dc5; // FNV offset basis
  if (s.length)
    for (let i = 0; i < s.length; i++) {
      hash = hash ^ s.charCodeAt(i);
      hash +=
        (hash << 24) + (hash << 8) + (hash << 7) + (hash << 4) + (hash << 1);
    }
  return (hash >>> 0) / 0x100000000;
};

/**
 * Generates a random number between 0 and 1 using a specified seed
 * @param seed - The seed value for random number generation
 * @returns A number between 0 and 1
 */
export const seededRandom = (seed: number): number => {
  // Use a linear congruential generator algorithm
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  // Calculate new seed value
  const newSeed = (a * seed + c) % m;

  // Return normalized value between 0 and 1
  return newSeed / m;
};
