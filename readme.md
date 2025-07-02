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

## Quick Start

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
- Built with modern ES Modules

## API Reference

### Card Management

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
  returned value is a read-only `ItemCard` or `TopicCard`.
- `calcForgettingCurve(card, now)`  
  Given an `ItemCard` and a timestamp, return the retrieval probability based on
  its stability value.
- `calcOddsRatio(card, now)`  
  Compute the odds of forgetting relative to the card's desired retention. This
  metric is used when prioritising cards.

### Grading and Rating

```typescript
import { grade, Rating, predictRatingIntervals } from "srs-everything";
```

- `Rating`: Enum for review ratings (`Rating.Again = 1` | `Rating.Hard = 2` | `Rating.Good = 3` | `Rating.Easy = 4`)
- `grade(card, rating, reviewTime, log?, params?)`  
  Process a review and update card stability/difficulty according to FSRS.
  Optional `log` fields are merged into the generated review log and `params`
  allows you to override FSRS parameters. Returns the updated `ItemCard`.
- `predictRatingIntervals(card, reviewTime, params?)`  
  Predict the next interval in days for each rating. Returns a mapping from
  `Rating` values to the predicted interval.

### Queue Management

```typescript
import { generateOutstandingQueue, interleaveCards } from "srs-everything";
```

- `generateOutstandingQueue(cards, now, options)`  
  Return the cards due by `now` sorted using the provided
  `OutstandingQueueParams`.
- `interleaveCards(cards, ratio)`  
  Mix topic and item cards so roughly `ratio` items appear for each topic.
- `next(card, reviewTime, log?, params?)`  
  Schedule the next interval for a `TopicCard` using incremental reading logic
  and append a review log.

### Review Logs

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
  with a small random factor.
- `filterSafePostponableCards(cards, now)`
  Filter out cards that have a high chance of being forgotten if postponed.

### Manual Scheduling

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

## Complete Example

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

## Use Cases

- Flashcard applications
- Language learning tools
- Educational software
- Knowledge retention systems
- Personalized learning platforms

## API Documentation

A complete list of exported functions and their parameters can be found in [docs/API.md](docs/API.md).

Details for all FSRS and incremental reading parameters are available in
[docs/Parameters.md](docs/Parameters.md).


## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
