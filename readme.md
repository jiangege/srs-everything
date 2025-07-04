# srs-everything
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

A modern TypeScript implementation of Spaced Repetition Systems (SRS) with support for FSRS (Free Spaced Repetition Scheduler) and various scheduling algorithms. This library helps you build flashcard applications, language learning tools, or any educational software that benefits from spaced repetition.

## Installation

```bash
npm install srs-everything
```

Both ES Module and CommonJS builds are provided. Use `import` in ESM projects or `require` in CJS:

```typescript
import { createCard } from "srs-everything";
```

```javascript
const { createCard } = require("srs-everything");
```

## Quick start

```typescript
import { createCard, grade, Rating, CardType } from "srs-everything";

// Create cards
const now = Date.now();
const card = createCard("1", CardType.Item, 50, now); // id, type, priority, now

// Grade a review
const reviewedCard = grade(card, Rating.Good, now);

// Get updated card and next due date
console.log(`Next review: ${new Date(reviewedCard.due!)}`);
console.log(`New stability: ${reviewedCard.stability}`);
```

## Customizing parameters

You can override the default constants when scheduling cards.

```typescript
import {
  grade,
  Rating,
  DEFAULT_PARAMS_FSRS6,
  next,
  IR_PARAMS,
  CardType,
  createCard,
} from "srs-everything";

const now = Date.now();

const item = createCard("i1", CardType.Item, 50, now);
const customFSRS = [...DEFAULT_PARAMS_FSRS6];
customFSRS[8] = 2;
grade(item, Rating.Good, now, undefined, customFSRS);

const topic = createCard("t1", CardType.Topic, 50, now);
const customIR = { ...IR_PARAMS, MULTIPLIER: 2 };
next(topic, now, undefined, customIR);
```

## Features

- Full TypeScript support with type declarations
- FSRS (Free Spaced Repetition Scheduler) implementation
- Item and Topic card management
- Rating and grading system
- Forgetting curve calculation and odds ratio prediction
- Queue management for outstanding cards
- Card interleaving strategies
- Postpone functionality for review scheduling
- Manual scheduling to set specific due dates
- Per-card `maxInterval` to limit overly long review gaps
- Built with modern ES Modules

## API reference

### Card management

```typescript
import { createCard, CardType, CardState } from "srs-everything";
```

#### Types

- `CardType`: Enum for card types (`CardType.Topic = "topic"` | `CardType.Item = "item"`)
- `CardState`: Enum for card states (`CardState.New = 0` | `CardState.Learning = 1` | `CardState.Review = 2` | `CardState.ReLearning = 3`)
- `ItemCard`: Interface for item cards with scheduling properties like difficulty and stability
- `TopicCard`: Interface for topic cards

#### Functions

- `createCard(id, type, priority, now, defaultAttrs?)`
  Create a card of the specified `CardType`. `priority` should be between `0` and
  `100` and controls ordering in the review queue. `now` is the creation
  timestamp. Optional `defaultAttrs` lets you override default fields. The
  returned value is a read-only `ItemCard` or `TopicCard`. Each card includes a
  `maxInterval` property that limits generated intervals.
- `calcForgettingCurve(card, now)`  
  Given an `ItemCard` and a timestamp, return the retrieval probability based on
  its stability value.
- `calcOddsRatio(card, now)`  
  Compute the odds of forgetting relative to the card's desired retention. This
  metric is used when prioritising cards.

### Grading and rating

```typescript
import { grade, Rating, predictRatingIntervals } from "srs-everything";
```

- `Rating`: Enum for review ratings (`Rating.Again = 1` | `Rating.Hard = 2` | `Rating.Good = 3` | `Rating.Easy = 4`)
- `grade(card, rating, reviewTime, log?, params?)`
  Process a review and update card stability and difficulty according to FSRS.
  Optional `log` fields are merged into the generated review log.
  The `params` array defaults to `DEFAULT_PARAMS_FSRS6` and lets you override
  the 21 FSRS constants. Returns the updated `ItemCard`. The calculated interval
  will not exceed the card's `maxInterval`.
- `predictRatingIntervals(card, reviewTime, params?)`
  Predict the next interval in days for each rating. `params` shares the same
  array format as `grade`. Intervals beyond the card's `maxInterval` are capped.

### Queue management

```typescript
import { generateOutstandingQueue, interleaveCards } from "srs-everything";
```

- `generateOutstandingQueue(cards, now, options)`
  Return the cards due by `now` sorted using an `OutstandingQueueParams` object
  with `itemPriorityRatio`, `topicPriorityRatio` and `oddsWeight` fields.
- `interleaveCards(cards, ratio)`  
  Mix topic and item cards so roughly `ratio` items appear for each topic.
- `next(card, reviewTime, log?, params?)`
  Schedule the next interval for a `TopicCard` using incremental reading.
  `params` defaults to `IR_PARAMS` and supports a single `MULTIPLIER` option.
  The resulting interval is capped at the card's `maxInterval`.

### Review logs

```typescript
import { appendReviewLog, withoutReviewLog } from "srs-everything";
```

- `appendReviewLog(reviewLogs, log)`
  Append a review log entry to an array of logs and return the new array.
- `withoutReviewLog(reviewLogs, id)`
  Remove logs matching the card `id` and return the filtered array.

### Postponing

```typescript
import { postpone, filterSafePostponableCards } from "srs-everything";
```

- `postpone(cards, now)`
  Delay the due dates of the provided cards. New scheduled days are calculated
  with a small random factor and will not exceed `maxInterval`.
- `filterSafePostponableCards(cards, now)`
  Filter out cards that have a high chance of being forgotten if postponed.

### Manual scheduling

```typescript
import { setDueDate } from "srs-everything";
```

- `setDueDate(card, due, now)`
  Set a specific due time for a card and update its scheduled days accordingly.

### Priority

```typescript
import { applyPriority } from "srs-everything";
```

- `applyPriority(card, newPriority)`  
  Assign a priority value between `0` and `100` to a card. A small deterministic
  jitter is added based on the card id to avoid ties.

## Complete example

Here's a complete example of using this library with multiple cards:

```typescript
import {
  createCard,
  CardType,
  grade,
  Rating,
  generateOutstandingQueue,
  interleaveCards,
} from "srs-everything";

const now = Date.now();

// Create and grade some cards
const card1 = createCard("1", CardType.Item, 50, now);
const card2 = createCard("2", CardType.Topic, 50, now);
const card3 = createCard("3", CardType.Item, 40, now);
const card4 = createCard("4", CardType.Topic, 60, now);

// Generate a queue of cards due for review
const outstandingQueue = generateOutstandingQueue(
  [card1, card2, card3, card4],
  now,
  {
    itemPriorityRatio: 0.8,
    topicPriorityRatio: 0.8,
    oddsWeight: 0.8,
  }
);

// Interleave cards (e.g., mix topics and items)
const interleavedCards = interleaveCards(outstandingQueue, 1);

// Study flow
for (const card of interleavedCards) {
  // Present card to user...

  // Then process user's rating
  const updatedCard = grade(card, Rating.Good, Date.now());

  // Updated card with new scheduling information
  console.log(`Card ${updatedCard.id} next due:`, new Date(updatedCard.due!));
}
```

## Use cases

- Flashcard applications
- Language learning tools
- Educational software
- Knowledge retention systems
- Personalized learning platforms

## Parameter reference

### FSRS parameters

| Index | Name | Default | Description |
|------:|------|--------:|-------------|
| 0 | w0 | 0.2172 | Base stability when the first rating is **Again** |
| 1 | w1 | 1.1771 | Incremental stability when the first rating increases |
| 2 | w2 | 3.2602 | Base difficulty when the first rating is **Good** |
| 3 | w3 | 16.1507 | Slope controlling initial difficulty |
| 4 | w4 | 7.0114 | Constant used to compute initial difficulty `D₀(G)` |
| 5 | w5 | 0.57 | Decay factor in `D₀(G)` |
| 6 | w6 | 2.0966 | Linear damping coefficient `ΔD(G) = -w6*(G-3)` |
| 7 | w7 | 0.0069 | Mean reversion weight for difficulty |
| 8 | w8 | 1.5261 | Coefficient in the new stability formula |
| 9 | w9 | 0.112 | Exponent term used in difficulty and stability updates |
| 10 | w10 | 1.0178 | Coefficient of `exp(w10*(1-R))` in stability update |
| 11 | w11 | 1.849 | Factor for difficulty in post-lapse stability |
| 12 | w12 | 0.1133 | Multiplicative term in post-lapse stability |
| 13 | w13 | 0.3127 | Exponent of `(S+1)` in post-lapse stability |
| 14 | w14 | 2.2934 | Coefficient of `exp(w14*(1-R))` in post-lapse stability |
| 15 | w15 | 0.2191 | Bonus applied when the rating is **Hard** |
| 16 | w16 | 3.0004 | Bonus applied when the rating is **Easy** |
| 17 | w17 | 0.7536 | Coefficient for same-day review updates |
| 18 | w18 | 0.3332 | Constant offset for same-day review updates |
| 19 | w19 | 0.1437 | Stability exponent adjustment in same-day review |
| 20 | w20 | 0.2 | Forgetting curve decay factor |

Other constants:

- `MIN_DIFFICULTY`: 1
- `MAX_DIFFICULTY`: 10
- `MIN_STABILITY`: 0.01
- `MAX_STABILITY`: 36500
- `DEFAULT_DESIRED_RETENTION`: 0.9

### Incremental reading parameters

```ts
export const IR_PARAMS = {
  MULTIPLIER: 1.5,
};
```

`MULTIPLIER` controls how quickly topic intervals grow. The next interval is computed as:

```
Math.ceil(MULTIPLIER ** Math.max(repHistoryCount, 1))
```

where `repHistoryCount` is the number of previous exposures to the topic.

### Outstanding queue parameters

`generateOutstandingQueue` expects an object with three weights:

```ts
{
  itemPriorityRatio: number;
  topicPriorityRatio: number;
  oddsWeight: number;
}
```

All weights should be between `0` and `1` and control how much card priority and forgetting odds influence the queue order.


## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
