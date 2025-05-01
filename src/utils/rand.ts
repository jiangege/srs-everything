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

export const mulberry32 = (a: number): (() => number) => {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};
