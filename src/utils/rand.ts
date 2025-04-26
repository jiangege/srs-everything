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
