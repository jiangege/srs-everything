export const addDays = (when: number, days: number): number =>
  when + days * 86_400_000;

export const startOfDay = (when = Date.now()): number => {
  const d = new Date(when);
  d.setUTCHours(0, 0, 0, 0);
  return d.valueOf();
};

export const endOfDay = (when = Date.now()): number => {
  const d = new Date(when);
  d.setUTCHours(23, 59, 59, 999);
  return d.valueOf();
};

export const msToDays = (ms: number): number => {
  return ms / 86_400_000;
};

export const daysToMs = (days: number): number => {
  return days * 86_400_000;
};
