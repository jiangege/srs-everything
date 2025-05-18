# srs-everything

A modern TypeScript implementation of Spaced Repetition Systems (SRS) with support for FSRS (Free Spaced Repetition Scheduler) and various scheduling algorithms. This library helps you build flashcard applications, language learning tools, or any educational software that benefits from spaced repetition.

## Installation

```bash
npm install srs-everything
```

## Quick Start

```typescript
import { createCard, grade, Rating, CardType } from "srs-everything";

// Create cards
const card = createCard("1", CardType.Item, 50); // id, type, initial priority

// Grade a review
const now = Date.now();
const result = grade(card, Rating.Good, now);

// Get updated card and next due date
console.log(`Next review: ${new Date(result.nextDue)}`);
console.log(`New stability: ${result.card.stability}`);
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

- `createCard(options)`: Create a new card
- `calcForgettingCurve(card)`: Calculate forgetting curve for a card
- `calcOddsRatio(card)`: Calculate odds ratio for a card

### Grading and Rating

```typescript
import { grade, Rating, predictRatingIntervals } from "srs-everything";
```

- `Rating`: Enum for review ratings (`Rating.Again = 1` | `Rating.Hard = 2` | `Rating.Good = 3` | `Rating.Easy = 4`)
- `grade(options)`: Process a card review with a rating
- `predictRatingIntervals(card)`: Predict intervals for different ratings

### Queue Management

```typescript
import { generateOutstandingQueue, interleaveCards } from "srs-everything";
```

- `generateOutstandingQueue(cards, now, options)`: Generate a queue of cards due for review
- `interleaveCards(cards, frequency)`: Interleave different types of cards for study
- `next(options)`: Get the next card for review

### Review Logs

```typescript
import { appendReviewLog, withoutReviewLog } from "srs-everything";
```

- `appendReviewLog(card, log)`: Add a review log to a card
- `withoutReviewLog(card)`: Get card data without review logs

### Postponing

```typescript
import { postpone, filterSafePostponableCards } from "srs-everything";
```

- `postpone(options)`: Postpone reviews to a later date
- `filterSafePostponableCards(cards)`: Filter cards that can be safely postponed

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
  [dueCard1, dueCard2, dueCard3, dueCard4],
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
  const result = grade(card, Rating.Good, Date.now());

  // Updated card with new scheduling information
  const updatedCard = result.card;
  console.log(`Card ${updatedCard.id} next due:`, new Date(result.due));
}
```

## Use Cases

- Flashcard applications
- Language learning tools
- Educational software
- Knowledge retention systems
- Personalized learning platforms

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
