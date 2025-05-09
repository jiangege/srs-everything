import { CardState, CardType, Card, ItemCard } from "./types.js";
import { sortCards } from "./outstandingQueue.js";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { calcOddsRatio } from "./card.js";
import { interleaveCards } from "./outstandingQueue.js";
import { applyDailyLimits } from "./outstandingQueue.js";
import { OutstandingQueueParams } from "./types.js";
import { generateOutstandingQueue } from "./outstandingQueue.js";

describe("sortCards", () => {
  test("should sort cards in ascending order by default", () => {
    const now = new Date("2025-05-05").getTime();
    const cards: Card[] = [
      {
        id: "1",
        type: CardType.Item,
        priority: 50,
        state: CardState.Review,
        stability: 20,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 3, // 3 days ago
      } as ItemCard,
      {
        id: "2",
        type: CardType.Item,
        priority: 80,
        state: CardState.Review,
        stability: 10,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 3, // 3 days ago
      } as ItemCard,
    ];

    const params = {
      itemPriorityRatio: 1,
      topicPriorityRatio: 1,
      oddsWeight: 1,
    };

    const sortedCards = sortCards(cards, now, params);

    // Cards should be sorted based on priority, oddsRatio and randomness
    expect(sortedCards.length).toBe(2);
    expect(sortedCards.map((c) => c.id)).toContain("1");
    expect(sortedCards.map((c) => c.id)).toContain("2");
  });

  test("should sort cards in descending order when specified", () => {
    const now = new Date("2025-05-05").getTime();
    const cards: Card[] = [
      {
        id: "1",
        type: CardType.Item,
        priority: 50,
        state: CardState.Review,
        stability: 20,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 3, // 3 days ago
      } as ItemCard,
      {
        id: "2",
        type: CardType.Item,
        priority: 80,
        state: CardState.Review,
        stability: 10,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 3, // 3 days ago
      } as ItemCard,
    ];

    const params = {
      itemPriorityRatio: 1,
      topicPriorityRatio: 1,
      oddsWeight: 1,
    };

    const sortedCards = sortCards(cards, now, params, "desc");

    expect(sortedCards.length).toBe(2);
    expect(sortedCards[0].id).toBe("2");
    expect(sortedCards[1].id).toBe("1");
  });

  test("should handle mix of FSRS and IR cards", () => {
    const now = new Date("2025-05-05").getTime();
    const cards: Card[] = [
      {
        id: "1",
        type: CardType.Item,
        priority: 50,
        state: CardState.Review,
        stability: 20,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 3, // 3 days ago
      } as ItemCard,
      {
        id: "2",
        type: CardType.Item,
        priority: 80,
        state: CardState.Review,
      } as ItemCard,
    ];

    const params = {
      itemPriorityRatio: 1,
      topicPriorityRatio: 1,
      oddsWeight: 0.5,
    };

    const sortedCards = sortCards(cards, now, params);

    // Both card types should be sorted
    expect(sortedCards.length).toBe(2);
    expect(sortedCards.map((c) => c.type)).toContain(CardType.Item);
  });
});

describe("interleaveCards", () => {
  test("should interleave items and topics with ratio <= 0", () => {
    const items: Card[] = Array(20)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `item${i}`,
            type: CardType.Item,
            priority: 10,
          } as Card)
      );

    const topics: Card[] = Array(5)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `topic${i}`,
            type: CardType.Topic,
            priority: 10,
          } as Card)
      );

    const result = interleaveCards(items, topics, 0);

    // With ratio <= 0, should have MAX_QUOTA (10) items followed by 1 topic
    expect(result.length).toBe(items.length + topics.length);

    // Check first 11 elements (10 items + 1 topic)
    for (let i = 0; i < 10; i++) {
      expect(result[i].type).toBe(CardType.Item);
    }
    expect(result[10].type).toBe(CardType.Topic);
  });

  test("should interleave items and topics with ratio between 0 and 1", () => {
    const items: Card[] = Array(10)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `item${i}`,
            type: CardType.Item,
            priority: 10,
          } as Card)
      );

    const topics: Card[] = Array(5)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `topic${i}`,
            type: CardType.Topic,
            priority: 10,
          } as Card)
      );

    // With ratio = 0.5, should have 2 items followed by 1 topic
    const result = interleaveCards(items, topics, 0.5);

    expect(result.length).toBe(items.length + topics.length);
    expect(result[0].type).toBe(CardType.Item);
    expect(result[1].type).toBe(CardType.Item);
    expect(result[2].type).toBe(CardType.Topic);
    expect(result[3].type).toBe(CardType.Item);
    expect(result[4].type).toBe(CardType.Item);
    expect(result[5].type).toBe(CardType.Topic);
  });

  test("should interleave items and topics with ratio > 1", () => {
    const items: Card[] = Array(5)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `item${i}`,
            type: CardType.Item,
            priority: 10,
          } as Card)
      );

    const topics: Card[] = Array(10)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `topic${i}`,
            type: CardType.Topic,
            priority: 10,
          } as Card)
      );

    // With ratio = 2, should have 2 topics followed by 1 item
    const result = interleaveCards(items, topics, 2);

    expect(result.length).toBe(items.length + topics.length);
    expect(result[0].type).toBe(CardType.Topic);
    expect(result[1].type).toBe(CardType.Topic);
    expect(result[2].type).toBe(CardType.Item);
    expect(result[3].type).toBe(CardType.Topic);
    expect(result[4].type).toBe(CardType.Topic);
    expect(result[5].type).toBe(CardType.Item);
  });

  test("should handle empty arrays", () => {
    const items: Card[] = Array(5)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `item${i}`,
            type: CardType.Item,
            priority: 10,
          } as Card)
      );

    const emptyTopics: Card[] = [];

    const result1 = interleaveCards(items, emptyTopics, 0.5);
    expect(result1.length).toBe(items.length);
    expect(result1).toEqual(items);

    const emptyItems: Card[] = [];
    const topics: Card[] = Array(5)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `topic${i}`,
            type: CardType.Topic,
            priority: 10,
          } as Card)
      );

    const result2 = interleaveCards(emptyItems, topics, 0.5);
    expect(result2.length).toBe(topics.length);
    expect(result2).toEqual(topics);
  });

  test("should handle edge case when one array is exhausted", () => {
    const items: Card[] = Array(10)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `item${i}`,
            type: CardType.Item,
            priority: 10,
          } as Card)
      );

    const topics: Card[] = Array(2)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `topic${i}`,
            type: CardType.Topic,
            priority: 10,
          } as Card)
      );

    // With ratio = 0.5, should have 2 items per topic
    const result = interleaveCards(items, topics, 0.5);

    // Total result should be all cards
    expect(result.length).toBe(items.length + topics.length);

    // Last cards should be items as topics are exhausted first
    expect(result[result.length - 1].type).toBe(CardType.Item);
  });
});

describe("applyDailyLimits", () => {
  test("should separate cards based on daily limits", () => {
    const cards: Card[] = [
      // Regular items
      ...Array(3)
        .fill(null)
        .map(
          (_, i) =>
            ({
              id: `item-review-${i}`,
              type: CardType.Item,
              state: CardState.Review,
              priority: 10,
            } as Card)
        ),

      // New items
      ...Array(4)
        .fill(null)
        .map(
          (_, i) =>
            ({
              id: `item-new-${i}`,
              type: CardType.Item,
              state: CardState.New,
              priority: 10,
            } as Card)
        ),

      // Regular topics
      ...Array(2)
        .fill(null)
        .map(
          (_, i) =>
            ({
              id: `topic-review-${i}`,
              type: CardType.Topic,
              state: CardState.Review,
              priority: 10,
            } as Card)
        ),

      // New topics
      ...Array(3)
        .fill(null)
        .map(
          (_, i) =>
            ({
              id: `topic-new-${i}`,
              type: CardType.Topic,
              state: CardState.New,
              priority: 10,
            } as Card)
        ),
    ];

    const params = {
      maxItemsPerDay: 5,
      maxTopicsPerDay: 3,
      maxNewItemsPerDay: 2,
      maxNewTopicsPerDay: 1,
    } as OutstandingQueueParams;

    const [outstanding, postponed] = applyDailyLimits(cards, params);

    // Total limits check
    const outstandingItems = outstanding.filter(
      (c) => c.type === CardType.Item
    );
    const outstandingTopics = outstanding.filter(
      (c) => c.type === CardType.Topic
    );
    expect(outstandingItems.length).toBeLessThanOrEqual(params.maxItemsPerDay);
    expect(outstandingTopics.length).toBeLessThanOrEqual(
      params.maxTopicsPerDay
    );

    // New card limits check
    const newOutstandingItems = outstandingItems.filter(
      (c) => c.state === CardState.New
    );
    const newOutstandingTopics = outstandingTopics.filter(
      (c) => c.state === CardState.New
    );
    expect(newOutstandingItems.length).toBeLessThanOrEqual(
      params.maxNewItemsPerDay
    );
    expect(newOutstandingTopics.length).toBeLessThanOrEqual(
      params.maxNewTopicsPerDay
    );

    // Overall distribution check
    expect(outstanding.length + postponed.length).toBe(cards.length);

    // Specific counts check
    expect(outstandingItems.length).toBe(5);
    expect(outstandingTopics.length).toBe(3);
    expect(newOutstandingItems.length).toBe(2);
    expect(newOutstandingTopics.length).toBe(1);
    expect(postponed.length).toBe(4); // 2 new items + 2 new topics that exceed limits
  });

  test("should handle empty array", () => {
    const cards: Card[] = [];
    const params = {
      maxItemsPerDay: 5,
      maxTopicsPerDay: 3,
      maxNewItemsPerDay: 2,
      maxNewTopicsPerDay: 1,
    } as OutstandingQueueParams;

    const [outstanding, postponed] = applyDailyLimits(cards, params);

    expect(outstanding).toEqual([]);
    expect(postponed).toEqual([]);
  });

  test("should handle zero limits", () => {
    const cards: Card[] = [
      {
        id: "item1",
        type: CardType.Item,
        state: CardState.Review,
        priority: 10,
      } as Card,
      {
        id: "topic1",
        type: CardType.Topic,
        state: CardState.Review,
        priority: 10,
      } as Card,
    ];

    const params = {
      maxItemsPerDay: 0,
      maxTopicsPerDay: 0,
      maxNewItemsPerDay: 0,
      maxNewTopicsPerDay: 0,
    } as OutstandingQueueParams;

    const [outstanding, postponed] = applyDailyLimits(cards, params);

    expect(outstanding).toEqual([]);
    expect(postponed).toEqual(cards);
  });

  test("should respect order of cards", () => {
    const cards: Card[] = [
      {
        id: "item1",
        type: CardType.Item,
        state: CardState.Review,
        priority: 10,
      } as Card,
      {
        id: "item2",
        type: CardType.Item,
        state: CardState.Review,
        priority: 20,
      } as Card,
      {
        id: "item3",
        type: CardType.Item,
        state: CardState.Review,
        priority: 30,
      } as Card,
    ];

    const params = {
      maxItemsPerDay: 2,
      maxTopicsPerDay: 2,
      maxNewItemsPerDay: 1,
      maxNewTopicsPerDay: 1,
    } as OutstandingQueueParams;

    const [outstanding, postponed] = applyDailyLimits(cards, params);

    expect(outstanding.map((c) => c.id)).toEqual(["item1", "item2"]);
    expect(postponed.map((c) => c.id)).toEqual(["item3"]);
  });
});

describe("generateOutstandingQueue", () => {
  const now = new Date("2023-01-01T12:00:00Z").getTime();
  const yesterday = now - 24 * 60 * 60 * 1000;
  const tomorrow = now + 24 * 60 * 60 * 1000;

  test("should filter cards due today or earlier", () => {
    const cards: Card[] = [
      // Due yesterday (should be included)
      {
        id: "item1",
        type: CardType.Item,
        state: CardState.Review,
        due: yesterday,
        priority: 50,
        stability: 20,
        desiredRetention: 0.9,
        lastReview: yesterday - 86400000, // 2 days ago
      } as ItemCard,

      // Due today (should be included)
      {
        id: "item2",
        type: CardType.Item,
        state: CardState.Review,
        due: now,
        priority: 60,
        stability: 15,
        desiredRetention: 0.9,
        lastReview: yesterday, // 1 day ago
      } as ItemCard,

      // Due tomorrow (should NOT be included)
      {
        id: "item3",
        type: CardType.Item,
        state: CardState.Review,
        due: tomorrow,
        priority: 70,
        stability: 25,
        desiredRetention: 0.9,
        lastReview: now,
      } as ItemCard,

      // New card (should be included regardless of due date)
      {
        id: "item4",
        type: CardType.Item,
        state: CardState.New,
        priority: 40,
        stability: 0,
        desiredRetention: 0.9,
      } as ItemCard,
    ];

    const params: OutstandingQueueParams = {
      maxItemsPerDay: 10,
      maxTopicsPerDay: 10,
      maxNewItemsPerDay: 10,
      maxNewTopicsPerDay: 10,
      itemPriorityRatio: 1,
      topicPriorityRatio: 1,
      topicToItemRatio: 0.5,
      oddsWeight: 0.5,
    };

    const [outstanding, postponed] = generateOutstandingQueue(
      cards,
      now,
      params
    );

    // Should include 3 cards (2 due + 1 new)
    expect(outstanding.length).toBe(3);
    expect(outstanding.find((c) => c.id === "item1")).toBeTruthy();
    expect(outstanding.find((c) => c.id === "item2")).toBeTruthy();
    expect(outstanding.find((c) => c.id === "item4")).toBeTruthy();

    // Future card is not included at all (filtered out in the first step)
    expect(outstanding.find((c) => c.id === "item3")).toBeFalsy();
    expect(postponed.find((c) => c.id === "item3")).toBeFalsy();

    // Check that postponed doesn't have anything unexpected
    expect(postponed.length).toBe(0);
  });

  test("should handle empty category case", () => {
    // Only topics, no items
    const onlyTopics: Card[] = Array(5)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `topic${i}`,
            type: CardType.Topic,
            state: CardState.Review,
            due: yesterday,
            priority: 10 + i,
          } as Card)
      );

    const params: OutstandingQueueParams = {
      maxItemsPerDay: 5,
      maxTopicsPerDay: 3,
      maxNewItemsPerDay: 2,
      maxNewTopicsPerDay: 1,
      itemPriorityRatio: 1,
      topicPriorityRatio: 1,
      topicToItemRatio: 0.5,
      oddsWeight: 0.5,
    };

    const [outstanding, postponed] = generateOutstandingQueue(
      onlyTopics,
      now,
      params
    );

    // Should include only 3 topics (maxTopicsPerDay)
    expect(outstanding.length).toBe(3);
    expect(outstanding.every((c) => c.type === CardType.Topic)).toBeTruthy();
    expect(postponed.length).toBe(2);

    // Only items, no topics
    const onlyItems: Card[] = Array(5)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `item${i}`,
            type: CardType.Item,
            state: CardState.Review,
            due: yesterday,
            priority: 10 + i,
            stability: 10 + i,
            desiredRetention: 0.9,
            lastReview: yesterday - 86400000, // 2 days ago
          } as ItemCard)
      );

    const [outstanding2, postponed2] = generateOutstandingQueue(
      onlyItems,
      now,
      params
    );

    // Should include only 5 items (maxItemsPerDay)
    expect(outstanding2.length).toBe(5);
    expect(outstanding2.every((c) => c.type === CardType.Item)).toBeTruthy();
    expect(postponed2.length).toBe(0);
  });

  test("should interleave items and topics based on ratio", () => {
    const items: Card[] = Array(10)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `item${i}`,
            type: CardType.Item,
            state: CardState.Review,
            due: yesterday,
            priority: 10,
            stability: 15,
            desiredRetention: 0.9,
            lastReview: yesterday - 86400000, // 2 days ago
          } as ItemCard)
      );

    const topics: Card[] = Array(5)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `topic${i}`,
            type: CardType.Topic,
            state: CardState.Review,
            due: yesterday,
            priority: 10,
          } as Card)
      );

    const params: OutstandingQueueParams = {
      maxItemsPerDay: 20,
      maxTopicsPerDay: 20,
      maxNewItemsPerDay: 20,
      maxNewTopicsPerDay: 20,
      itemPriorityRatio: 1,
      topicPriorityRatio: 1,
      topicToItemRatio: 0.5, // Should give pattern of 2 items, then 1 topic
      oddsWeight: 0.5,
    };

    const [outstanding, _] = generateOutstandingQueue(
      [...items, ...topics],
      now,
      params
    );

    // Check pattern: should be 2 items, 1 topic, 2 items, 1 topic...
    expect(outstanding[0].type).toBe(CardType.Item);
    expect(outstanding[1].type).toBe(CardType.Item);
    expect(outstanding[2].type).toBe(CardType.Topic);
    expect(outstanding[3].type).toBe(CardType.Item);
    expect(outstanding[4].type).toBe(CardType.Item);
    expect(outstanding[5].type).toBe(CardType.Topic);
  });

  test("should apply daily limits correctly", () => {
    // Mix of items and topics, new and review
    const cards: Card[] = [
      // Regular items
      ...Array(3)
        .fill(null)
        .map(
          (_, i) =>
            ({
              id: `item-review-${i}`,
              type: CardType.Item,
              state: CardState.Review,
              due: yesterday,
              priority: 10,
              stability: 12 + i,
              desiredRetention: 0.9,
              lastReview: yesterday - 86400000, // 2 days ago
            } as ItemCard)
        ),

      // New items
      ...Array(4)
        .fill(null)
        .map(
          (_, i) =>
            ({
              id: `item-new-${i}`,
              type: CardType.Item,
              state: CardState.New,
              priority: 10,
              stability: 0,
              desiredRetention: 0.9,
            } as ItemCard)
        ),

      // Regular topics
      ...Array(2)
        .fill(null)
        .map(
          (_, i) =>
            ({
              id: `topic-review-${i}`,
              type: CardType.Topic,
              state: CardState.Review,
              due: yesterday,
              priority: 10,
            } as Card)
        ),

      // New topics
      ...Array(3)
        .fill(null)
        .map(
          (_, i) =>
            ({
              id: `topic-new-${i}`,
              type: CardType.Topic,
              state: CardState.New,
              priority: 10,
            } as Card)
        ),
    ];

    const params: OutstandingQueueParams = {
      maxItemsPerDay: 5,
      maxTopicsPerDay: 3,
      maxNewItemsPerDay: 2,
      maxNewTopicsPerDay: 1,
      itemPriorityRatio: 1,
      topicPriorityRatio: 1,
      topicToItemRatio: 1, // Equal ratio for simplicity
      oddsWeight: 0.5,
    };

    const [outstanding, postponed] = generateOutstandingQueue(
      cards,
      now,
      params
    );

    // Check total counts against limits
    const outstandingItems = outstanding.filter(
      (c) => c.type === CardType.Item
    );
    const outstandingTopics = outstanding.filter(
      (c) => c.type === CardType.Topic
    );
    expect(outstandingItems.length).toBeLessThanOrEqual(params.maxItemsPerDay);
    expect(outstandingTopics.length).toBeLessThanOrEqual(
      params.maxTopicsPerDay
    );

    // Check new card counts against limits
    const newOutstandingItems = outstandingItems.filter(
      (c) => c.state === CardState.New
    );
    const newOutstandingTopics = outstandingTopics.filter(
      (c) => c.state === CardState.New
    );
    expect(newOutstandingItems.length).toBeLessThanOrEqual(
      params.maxNewItemsPerDay
    );
    expect(newOutstandingTopics.length).toBeLessThanOrEqual(
      params.maxNewTopicsPerDay
    );

    // Total count should match all cards
    expect(outstanding.length + postponed.length).toBe(cards.length);
  });

  test("should sort cards by priority and other factors", () => {
    const cards: Card[] = [
      {
        id: "lowPriority",
        type: CardType.Item,
        state: CardState.Review,
        due: yesterday,
        priority: 10,
        stability: 15,
        desiredRetention: 0.9,
        lastReview: yesterday - 86400000, // 2 days ago
      } as ItemCard,
      {
        id: "highPriority",
        type: CardType.Item,
        state: CardState.Review,
        due: yesterday,
        priority: 90,
        stability: 25,
        desiredRetention: 0.9,
        lastReview: yesterday - 86400000, // 2 days ago
      } as ItemCard,
    ];

    const params: OutstandingQueueParams = {
      maxItemsPerDay: 2,
      maxTopicsPerDay: 2,
      maxNewItemsPerDay: 2,
      maxNewTopicsPerDay: 2,
      itemPriorityRatio: 1, // Full weight to priority, no randomness
      topicPriorityRatio: 1,
      topicToItemRatio: 0.5,
      oddsWeight: 0.5,
    };

    const [outstanding, _] = generateOutstandingQueue(cards, now, params);

    // With ascending sort, lower priority should come first
    expect(outstanding[0].id).toBe("lowPriority");
    expect(outstanding[1].id).toBe("highPriority");
  });

  test("should respect itemPriorityRatio for sorting items", () => {
    // Create many identical cards with different priorities
    // This makes the test more sensitive to detecting the ratio effect
    const cards: Card[] = Array(20)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `item${i}`,
            type: CardType.Item,
            state: CardState.Review,
            due: now - 86400000,
            priority: i * 5, // priorities from 0 to 95
            stability: 15,
            desiredRetention: 0.9,
            lastReview: now - 86400000 * 2,
          } as ItemCard)
      );

    // Test with priority having full weight (1.0)
    const priorityParams: OutstandingQueueParams = {
      maxItemsPerDay: 20,
      maxTopicsPerDay: 20,
      maxNewItemsPerDay: 20,
      maxNewTopicsPerDay: 20,
      itemPriorityRatio: 1.0, // Full weight to priority
      topicPriorityRatio: 1.0,
      topicToItemRatio: 0.5,
      oddsWeight: 0.5,
    };

    const [priorityResults, _p] = generateOutstandingQueue(
      cards,
      now,
      priorityParams
    );

    // With priority ratio 1.0 and ascending sort, cards should be sorted exactly by priority
    const priorityOrder = priorityResults.map((c) =>
      parseInt(c.id.replace("item", ""))
    );
    expect(priorityOrder).toEqual([...priorityOrder].sort((a, b) => a - b));

    // Test with priority having intermediate weight (0.7)
    const intermediateParams: OutstandingQueueParams = {
      maxItemsPerDay: 20,
      maxTopicsPerDay: 20,
      maxNewItemsPerDay: 20,
      maxNewTopicsPerDay: 20,
      itemPriorityRatio: 0.7, // 70% weight to priority, 30% to randomness
      topicPriorityRatio: 1.0,
      topicToItemRatio: 0.5,
      oddsWeight: 0.5,
    };

    // Run twice with same seed to verify deterministic behavior
    const [intermediateResults1, _int1] = generateOutstandingQueue(
      cards,
      now,
      intermediateParams
    );
    const [intermediateResults2, _int2] = generateOutstandingQueue(
      cards,
      now,
      intermediateParams
    );

    // Results should be deterministic
    expect(intermediateResults1.map((c) => c.id)).toEqual(
      intermediateResults2.map((c) => c.id)
    );

    // With 0.7 weight to priority, order should be influenced by priority but not match it exactly
    const intermediateOrder = intermediateResults1.map((c) =>
      parseInt(c.id.replace("item", ""))
    );

    // Test 1: Order should not be exactly the same as pure priority-based sorting
    expect(intermediateOrder).not.toEqual(
      [...intermediateOrder].sort((a, b) => a - b)
    );

    // Test 2: But should have positive correlation with priority
    // Calculate correlation between position and priority
    // Lower indices should tend to have lower priorities in ascending sort
    let correlationSum = 0;
    for (let i = 0; i < intermediateOrder.length; i++) {
      // Position in intermediateOrder vs ideal priority-sorted position
      correlationSum += Math.abs(i - intermediateOrder[i]);
    }
    // Lower correlationSum means stronger correlation with priority
    // For completely random ordering, correlationSum would be high
    // For perfect priority ordering, correlationSum would be zero
    const maxPossibleCorrelationSum =
      (intermediateOrder.length * intermediateOrder.length) / 2;
    expect(correlationSum).toBeLessThan(maxPossibleCorrelationSum * 0.5); // Should have at least moderate correlation

    // Test with priority having no weight (0.0) - should use randomness
    const randomParams: OutstandingQueueParams = {
      maxItemsPerDay: 20,
      maxTopicsPerDay: 20,
      maxNewItemsPerDay: 20,
      maxNewTopicsPerDay: 20,
      itemPriorityRatio: 0.0, // No weight to priority, full weight to randomness
      topicPriorityRatio: 0.0,
      topicToItemRatio: 0.5,
      oddsWeight: 0.5,
    };

    // Run twice with the same "now" timestamp, which will seed the random
    // number generator the same way
    const [randomResults1, _rand1] = generateOutstandingQueue(
      cards,
      now,
      randomParams
    );
    const [randomResults2, _rand2] = generateOutstandingQueue(
      cards,
      now,
      randomParams
    );

    // Random but deterministic, so both runs should produce the same order
    expect(randomResults1.map((c) => c.id)).toEqual(
      randomResults2.map((c) => c.id)
    );

    // The order with randomness should be different from the priority-based order
    const randomOrder = randomResults1.map((c) => c.id);
    const priorityOrder2 = priorityResults.map((c) => c.id);
    expect(randomOrder).not.toEqual(priorityOrder2);
  });

  test("should respect topicPriorityRatio for sorting topics", () => {
    // Create many identical topics with different priorities
    // This makes the test more sensitive to detecting the ratio effect
    const cards: Card[] = Array(20)
      .fill(null)
      .map(
        (_, i) =>
          ({
            id: `topic${i}`,
            type: CardType.Topic,
            state: CardState.Review,
            due: now - 86400000,
            priority: i * 5, // priorities from 0 to 95
          } as Card)
      );

    // Test with topic priority having full weight (1.0)
    const priorityParams: OutstandingQueueParams = {
      maxItemsPerDay: 20,
      maxTopicsPerDay: 20,
      maxNewItemsPerDay: 20,
      maxNewTopicsPerDay: 20,
      itemPriorityRatio: 1.0,
      topicPriorityRatio: 1.0, // Full weight to priority
      topicToItemRatio: 0.5,
      oddsWeight: 0.5,
    };

    const [priorityResults, _p] = generateOutstandingQueue(
      cards,
      now,
      priorityParams
    );

    // With topic priority ratio 1.0 and ascending sort, topics should be sorted exactly by priority
    const priorityOrder = priorityResults.map((c) =>
      parseInt(c.id.replace("topic", ""))
    );
    expect(priorityOrder).toEqual([...priorityOrder].sort((a, b) => a - b));

    // Test with topic priority having intermediate weight (0.7)
    const intermediateParams: OutstandingQueueParams = {
      maxItemsPerDay: 20,
      maxTopicsPerDay: 20,
      maxNewItemsPerDay: 20,
      maxNewTopicsPerDay: 20,
      itemPriorityRatio: 1.0,
      topicPriorityRatio: 0.7, // 70% weight to priority, 30% to randomness
      topicToItemRatio: 0.5,
      oddsWeight: 0.5,
    };

    // Run twice with same seed to verify deterministic behavior
    const [intermediateResults1, _topicInt1] = generateOutstandingQueue(
      cards,
      now,
      intermediateParams
    );
    const [intermediateResults2, _topicInt2] = generateOutstandingQueue(
      cards,
      now,
      intermediateParams
    );

    // Results should be deterministic
    expect(intermediateResults1.map((c) => c.id)).toEqual(
      intermediateResults2.map((c) => c.id)
    );

    // With 0.7 weight to priority, order should be influenced by priority but not match it exactly
    const intermediateOrder = intermediateResults1.map((c) =>
      parseInt(c.id.replace("topic", ""))
    );

    // Test 1: Order should not be exactly the same as pure priority-based sorting
    expect(intermediateOrder).not.toEqual(
      [...intermediateOrder].sort((a, b) => a - b)
    );

    // Test 2: But should have positive correlation with priority
    // Calculate correlation between position and priority
    let correlationSum = 0;
    for (let i = 0; i < intermediateOrder.length; i++) {
      // Position in intermediateOrder vs ideal priority-sorted position
      correlationSum += Math.abs(i - intermediateOrder[i]);
    }
    // For completely random ordering, correlationSum would be high
    // For perfect priority ordering, correlationSum would be zero
    const maxPossibleCorrelationSum =
      (intermediateOrder.length * intermediateOrder.length) / 2;
    expect(correlationSum).toBeLessThan(maxPossibleCorrelationSum * 0.5); // Should have at least moderate correlation

    // Test with topic priority having no weight (0.0) - should use randomness
    const randomParams: OutstandingQueueParams = {
      maxItemsPerDay: 20,
      maxTopicsPerDay: 20,
      maxNewItemsPerDay: 20,
      maxNewTopicsPerDay: 20,
      itemPriorityRatio: 1.0,
      topicPriorityRatio: 0.0, // No weight to priority, full weight to randomness
      topicToItemRatio: 0.5,
      oddsWeight: 0.5,
    };

    // Run twice with the same "now" timestamp for deterministic randomness
    const [randomResults1, _topicRand1] = generateOutstandingQueue(
      cards,
      now,
      randomParams
    );
    const [randomResults2, _topicRand2] = generateOutstandingQueue(
      cards,
      now,
      randomParams
    );

    // Random but deterministic, so both runs should produce the same order
    expect(randomResults1.map((c) => c.id)).toEqual(
      randomResults2.map((c) => c.id)
    );

    // For pure randomness, there should be little correlation with priority
    const randomOrder = randomResults1.map((c) =>
      parseInt(c.id.replace("topic", ""))
    );
    let randomCorrelationSum = 0;
    for (let i = 0; i < randomOrder.length; i++) {
      randomCorrelationSum += Math.abs(i - randomOrder[i]);
    }
    // For random ordering, correlationSum should be higher (worse correlation)
    expect(randomCorrelationSum).toBeGreaterThan(correlationSum);
  });

  test("should respect both itemPriorityRatio and topicPriorityRatio for mixed card types", () => {
    const cards: Card[] = [
      // Items
      {
        id: "highPriorityItem",
        type: CardType.Item,
        state: CardState.Review,
        due: now - 86400000,
        priority: 90,
        stability: 15,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 2,
      } as ItemCard,
      {
        id: "lowPriorityItem",
        type: CardType.Item,
        state: CardState.Review,
        due: now - 86400000,
        priority: 10,
        stability: 15,
        desiredRetention: 0.9,
        lastReview: now - 86400000 * 2,
      } as ItemCard,

      // Topics
      {
        id: "highPriorityTopic",
        type: CardType.Topic,
        state: CardState.Review,
        due: now - 86400000,
        priority: 90,
      } as Card,
      {
        id: "lowPriorityTopic",
        type: CardType.Topic,
        state: CardState.Review,
        due: now - 86400000,
        priority: 10,
      } as Card,
    ];

    // Test with different priority ratios for items and topics
    const mixedParams: OutstandingQueueParams = {
      maxItemsPerDay: 10,
      maxTopicsPerDay: 10,
      maxNewItemsPerDay: 10,
      maxNewTopicsPerDay: 10,
      itemPriorityRatio: 1.0, // Full weight to priority for items
      topicPriorityRatio: 0.0, // No weight to priority for topics (random)
      topicToItemRatio: 1.0, // Equal ratio to get clear interleaving
      oddsWeight: 0.0, // No weight to odds
    };

    const [results, _] = generateOutstandingQueue(cards, now, mixedParams);

    // Find the positions of the items
    const itemPositions = results
      .map((card, index) => (card.type === CardType.Item ? index : -1))
      .filter((pos) => pos !== -1);

    // If items are correctly sorted by priority, lowPriorityItem should come before highPriorityItem
    if (itemPositions.length === 2) {
      const lowItemIndex = results.findIndex((c) => c.id === "lowPriorityItem");
      const highItemIndex = results.findIndex(
        (c) => c.id === "highPriorityItem"
      );

      expect(lowItemIndex).toBeLessThan(highItemIndex);
    }

    // For topics, the order should be determined by randomness not priority
    // So we can only verify that both topic cards are present
    expect(results.some((c) => c.id === "highPriorityTopic")).toBeTruthy();
    expect(results.some((c) => c.id === "lowPriorityTopic")).toBeTruthy();
  });
});
