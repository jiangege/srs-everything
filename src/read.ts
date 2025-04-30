import { algorithm, IR_PARAMS } from "./ir/index.js";
import { IrCard, CardState, ReviewLog } from "./types.js";
import { appendReviewLog } from "./reviewLog.js";

export const next = (
  card: Readonly<IrCard>,
  reviewTime: number,
  params: typeof IR_PARAMS = IR_PARAMS,
  log?: Readonly<Partial<ReviewLog>>
): Readonly<IrCard> => {
  const newCard = { ...card };

  newCard.state = CardState.LEARNING;

  const repHistoryCount = card.reviewLogs.filter(
    (record) => record.state > CardState.NEW
  ).length;

  newCard.scheduledDays = algorithm.nextInterval(repHistoryCount, params);

  newCard.lastReview = reviewTime;
  newCard.due = reviewTime + newCard.scheduledDays * 24 * 60 * 60 * 1000;
  newCard.reviewLogs = [
    ...appendReviewLog(card.reviewLogs, {
      ...log,
      id: newCard.id,
      state: newCard.state,
      reviewTime,
    }),
  ];

  return newCard;
};
