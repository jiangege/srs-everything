import { algorithm, IR_PARAMS } from "./ir/index.js";
import { TopicCard, CardState, ReviewLog } from "./types.js";
import { appendReviewLog } from "./reviewLog.js";
import { addDays } from "./utils/date.js";

export const next = (
  card: Readonly<TopicCard>,
  reviewTime: number,
  log?: Readonly<Partial<ReviewLog>>,
  params: typeof IR_PARAMS = IR_PARAMS
): Readonly<TopicCard> => {
  const newCard = { ...card };

  newCard.state = CardState.Learning;

  const repHistoryCount = card.reviewLogs.filter(
    (record) => record.state > CardState.New
  ).length;

  newCard.scheduledDays = algorithm.nextInterval(repHistoryCount, params);

  newCard.lastReview = reviewTime;
  newCard.due = addDays(reviewTime, newCard.scheduledDays);
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
