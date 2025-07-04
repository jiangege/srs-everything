# API Reference

This document lists all exported functions from **srs-everything** and explains their parameters.

## Card Management

### `createCard(id, type, priority, now, defaultAttrs?)`
Create a card of `CardType` with the given priority. `now` is the timestamp when the card is created. Optional `defaultAttrs` lets you override default card fields. Each card includes a `maxInterval` field that caps the maximum scheduled days returned by other APIs.

### `calcForgettingCurve(card, now)`
Return the probability of recalling the given `ItemCard` at `now` based on its stability.

### `calcOddsRatio(card, now)`
Calculate the odds of forgetting relative to the card's desired retention.

## Grading and Rating

### `grade(card, rating, reviewTime, log?, params?)`
Update an `ItemCard` after a review. `rating` is a `Rating` value. `reviewTime` is the review timestamp. Optional `log` merges extra fields into the generated review log. `params` allows overriding FSRS algorithm constants.
The resulting interval is capped by the card's `maxInterval`.

### `predictRatingIntervals(card, reviewTime, params?)`
Return the next interval in days for each rating option using the FSRS model.
Intervals exceeding `maxInterval` are clamped to that value.

## Queue Management

### `generateOutstandingQueue(cards, now, params)`
Return all cards due by `now` sorted according to `OutstandingQueueParams`.

### `interleaveCards(cards, ratio)`
Mix topic and item cards so roughly `ratio` items appear per topic.

## Incremental Reading

### `next(card, reviewTime, log?, params?)`
Schedule the next interval for a `TopicCard` using incremental reading. Optional `log` and `params` behave like in `grade`.
The scheduled interval is limited by the card's `maxInterval`.

## Review Logs

### `appendReviewLog(reviewLogs, log)`
Append a `ReviewLog` entry to the array and return the new array.

### `withoutReviewLog(reviewLogs, id)`
Remove logs for the given card `id`.

## Postponing

### `postpone(cards, now)`
Delay due dates by applying a small random factor to scheduled days.

### `filterSafePostponableCards(cards, now)`
Return the subset of cards that can be postponed with a low risk of being forgotten.

## Priority

### `applyPriority(card, newPriority)`
Assign a priority between `0` and `100` to the card. A small deterministic jitter avoids ties.
