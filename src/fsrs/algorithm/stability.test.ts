import { describe, test, expect } from "vitest";
import {
  initStability,
  sameDayStability,
  recallStability,
  forgetStability,
  updateStability,
} from "./stability";
import { initDifficulty, updateDifficulty } from "./difficulty";
import { forgettingCurve } from "./retrievability";
import { DEFAULT_PARAMS_FSRS5 } from "../const";
import { Rating } from "../types";

describe("initStability", () => {
  test("returns correct initial stability for each rating", () => {
    // 初始稳定性应该直接对应参数数组中的前四个值
    expect(initStability(Rating.AGAIN)).toBe(DEFAULT_PARAMS_FSRS5[0]);
    expect(initStability(Rating.HARD)).toBe(DEFAULT_PARAMS_FSRS5[1]);
    expect(initStability(Rating.GOOD)).toBe(DEFAULT_PARAMS_FSRS5[2]);
    expect(initStability(Rating.EASY)).toBe(DEFAULT_PARAMS_FSRS5[3]);
  });

  test("constrains values to minimum and maximum stability", () => {
    // 测试如果参数提供的初始稳定性为负数，会被限制到最小稳定性
    const negativeParams = [-1, -1, -1, -1, ...DEFAULT_PARAMS_FSRS5.slice(4)];
    expect(initStability(Rating.AGAIN, negativeParams)).toBe(0.01);

    // 测试如果参数提供的初始稳定性超过最大值，会被限制到最大稳定性
    const hugeParams = [
      100000,
      100000,
      100000,
      100000,
      ...DEFAULT_PARAMS_FSRS5.slice(4),
    ];
    expect(initStability(Rating.AGAIN, hugeParams)).toBe(36500.0);
  });
});

describe("sameDayStability", () => {
  test("calculates same-day stability update correctly", () => {
    // 根据公式 S′(S,G) = S · e^(w17 · (G - 3 + w18))
    const stability = 10;

    // 对于 GOOD (G=3)，应该有 S′ = S * exp(w17 * (3-3+w18)) = S * exp(w17 * w18)
    const expectedGood =
      stability * Math.exp(DEFAULT_PARAMS_FSRS5[17] * DEFAULT_PARAMS_FSRS5[18]);
    expect(sameDayStability(stability, Rating.GOOD)).toBeCloseTo(expectedGood);

    // 对于 AGAIN (G=1)，应该有 S′ = S * exp(w17 * (1-3+w18)) = S * exp(w17 * (w18-2))
    const expectedAgain =
      stability *
      Math.exp(DEFAULT_PARAMS_FSRS5[17] * (DEFAULT_PARAMS_FSRS5[18] - 2));
    expect(sameDayStability(stability, Rating.AGAIN)).toBeCloseTo(
      expectedAgain
    );

    // 对于 EASY (G=4)，应该有 S′ = S * exp(w17 * (4-3+w18)) = S * exp(w17 * (1+w18))
    const expectedEasy =
      stability *
      Math.exp(DEFAULT_PARAMS_FSRS5[17] * (1 + DEFAULT_PARAMS_FSRS5[18]));
    expect(sameDayStability(stability, Rating.EASY)).toBeCloseTo(expectedEasy);
  });

  test("returns larger stability for higher ratings", () => {
    const stability = 5;
    const s1 = sameDayStability(stability, Rating.AGAIN);
    const s2 = sameDayStability(stability, Rating.HARD);
    const s3 = sameDayStability(stability, Rating.GOOD);
    const s4 = sameDayStability(stability, Rating.EASY);

    expect(s1).toBeLessThan(s2);
    expect(s2).toBeLessThan(s3);
    expect(s3).toBeLessThan(s4);
  });
});

describe("recallStability", () => {
  test("calculates recall stability update correctly", () => {
    // 测试公式 S′_r(D,S,R,G) = S · (e^w8 · (11-D) · S^(-w9) · (e^(w10·(1-R))-1) · hardPenalty · easyBonus + 1)
    const difficulty = 5;
    const stability = 10;
    const retrievability = 0.9;

    // 计算基础增长因子（不考虑额外的 hard/easy 系数）
    const baseIncrease =
      Math.exp(DEFAULT_PARAMS_FSRS5[8]) *
        (11 - difficulty) *
        Math.pow(stability, -DEFAULT_PARAMS_FSRS5[9]) *
        (Math.exp(DEFAULT_PARAMS_FSRS5[10] * (1 - retrievability)) - 1) +
      1;

    // 对于 GOOD，应该只使用基础增长因子
    const expectedGood = stability * baseIncrease;
    expect(
      recallStability(difficulty, stability, retrievability, Rating.GOOD)
    ).toBeCloseTo(expectedGood);

    // 对于 HARD，应该乘以 w15 惩罚系数
    const expectedHard =
      stability * (baseIncrease - 1) * DEFAULT_PARAMS_FSRS5[15] + stability;
    expect(
      recallStability(difficulty, stability, retrievability, Rating.HARD)
    ).toBeCloseTo(expectedHard);

    // 对于 EASY，应该乘以 w16 奖励系数
    const expectedEasy =
      stability * (baseIncrease - 1) * DEFAULT_PARAMS_FSRS5[16] + stability;
    expect(
      recallStability(difficulty, stability, retrievability, Rating.EASY)
    ).toBeCloseTo(expectedEasy);
  });

  test("returns smaller stability increase for harder cards", () => {
    const stability = 10;
    const retrievability = 0.9;
    const rating = Rating.GOOD;

    const easyCard = recallStability(1, stability, retrievability, rating);
    const hardCard = recallStability(9, stability, retrievability, rating);

    expect(easyCard).toBeGreaterThan(hardCard);
  });

  test("returns larger stability increase for lower retrievability (spacing effect)", () => {
    const difficulty = 5;
    const stability = 10;
    const rating = Rating.GOOD;

    const highR = recallStability(difficulty, stability, 0.9, rating);
    const lowR = recallStability(difficulty, stability, 0.7, rating);

    expect(lowR).toBeGreaterThan(highR);
  });

  test("returns smaller stability increase for higher stability", () => {
    const difficulty = 5;
    const retrievability = 0.9;
    const rating = Rating.GOOD;

    const lowS = recallStability(difficulty, 5, retrievability, rating);
    const highS = recallStability(difficulty, 50, retrievability, rating);

    // 计算增长率而不是绝对增长值
    const lowSIncrease = lowS / 5;
    const highSIncrease = highS / 50;

    expect(lowSIncrease).toBeGreaterThan(highSIncrease);
  });
});

describe("forgetStability", () => {
  test("calculates forget stability correctly", () => {
    // 测试公式 S′_f(D,S,R) = w11 · D^(-w12) · ((S+1)^w13 - 1) · e^(w14·(1-R))
    const difficulty = 5;
    const stability = 10;
    const retrievability = 0.9;

    const expected =
      DEFAULT_PARAMS_FSRS5[11] *
      Math.pow(difficulty, -DEFAULT_PARAMS_FSRS5[12]) *
      (Math.pow(stability + 1, DEFAULT_PARAMS_FSRS5[13]) - 1) *
      Math.exp(DEFAULT_PARAMS_FSRS5[14] * (1 - retrievability));

    expect(forgetStability(difficulty, stability, retrievability)).toBeCloseTo(
      expected
    );
  });

  test("returns higher post-lapse stability for easier cards", () => {
    const stability = 10;
    const retrievability = 0.9;

    const easyCard = forgetStability(1, stability, retrievability);
    const hardCard = forgetStability(9, stability, retrievability);

    expect(easyCard).toBeGreaterThan(hardCard);
  });

  test("returns higher post-lapse stability for higher previous stability", () => {
    const difficulty = 5;
    const retrievability = 0.9;

    const lowS = forgetStability(difficulty, 5, retrievability);
    const highS = forgetStability(difficulty, 50, retrievability);

    expect(highS).toBeGreaterThan(lowS);
  });

  test("returns higher post-lapse stability for lower retrievability", () => {
    const difficulty = 5;
    const stability = 10;

    const highR = forgetStability(difficulty, stability, 0.9);
    const lowR = forgetStability(difficulty, stability, 0.7);

    expect(lowR).toBeGreaterThan(highR);
  });
});

describe("updateStability", () => {
  test("initializes stability and difficulty for new cards", () => {
    const result = updateStability(0, 0, 0, Rating.GOOD);
    expect(result).toEqual({
      difficulty: expect.any(Number),
      stability: expect.any(Number),
    });
    expect(result.difficulty).toBe(initDifficulty(Rating.GOOD));
    expect(result.stability).toBe(initStability(Rating.GOOD));
  });

  test("uses sameDayStability for reviews on the same day", () => {
    const difficulty = 5;
    const stability = 10;
    const elapsedDays = 0.5;
    const rating = Rating.GOOD;

    const expectedStability = sameDayStability(stability, rating);
    const expectedDifficulty = updateDifficulty(difficulty, rating);

    const result = updateStability(difficulty, stability, elapsedDays, rating);

    expect(result.stability).toBeCloseTo(expectedStability);
    expect(result.difficulty).toBeCloseTo(expectedDifficulty);
  });

  test("uses recallStability for successful reviews after a delay", () => {
    const difficulty = 5;
    const stability = 10;
    const elapsedDays = 5;

    // Test for each successful rating
    for (const rating of [Rating.HARD, Rating.GOOD, Rating.EASY]) {
      const retrievability = forgettingCurve(elapsedDays, stability);
      const expectedStability = recallStability(
        difficulty,
        stability,
        retrievability,
        rating
      );
      const expectedDifficulty = updateDifficulty(difficulty, rating);

      const result = updateStability(
        difficulty,
        stability,
        elapsedDays,
        rating
      );

      expect(result.stability).toBeCloseTo(expectedStability);
      expect(result.difficulty).toBeCloseTo(expectedDifficulty);
    }
  });

  test("uses forgetStability for failed reviews", () => {
    const difficulty = 5;
    const stability = 10;
    const elapsedDays = 5;
    const rating = Rating.AGAIN;

    const retrievability = forgettingCurve(elapsedDays, stability);
    const expectedStability = forgetStability(
      difficulty,
      stability,
      retrievability
    );
    const expectedDifficulty = updateDifficulty(difficulty, rating);

    const result = updateStability(difficulty, stability, elapsedDays, rating);

    expect(result.stability).toBeCloseTo(expectedStability);
    expect(result.difficulty).toBeCloseTo(expectedDifficulty);
  });

  test("returns different stability values based on ratings", () => {
    const difficulty = 5;
    const stability = 10;
    const elapsedDays = 5;

    const resultAgain = updateStability(
      difficulty,
      stability,
      elapsedDays,
      Rating.AGAIN
    );
    const resultHard = updateStability(
      difficulty,
      stability,
      elapsedDays,
      Rating.HARD
    );
    const resultGood = updateStability(
      difficulty,
      stability,
      elapsedDays,
      Rating.GOOD
    );
    const resultEasy = updateStability(
      difficulty,
      stability,
      elapsedDays,
      Rating.EASY
    );

    // Successful recall should result in higher stability than forgetting
    expect(resultAgain.stability).toBeLessThan(resultHard.stability);

    // Higher ratings should generally result in higher stability
    expect(resultHard.stability).toBeLessThan(resultGood.stability);
    expect(resultGood.stability).toBeLessThan(resultEasy.stability);
  });

  test("works with custom parameters", () => {
    const difficulty = 5;
    const stability = 10;
    const elapsedDays = 5;
    const rating = Rating.GOOD;

    // Create custom parameters by making a copy and modifying some values
    const customParams = [...DEFAULT_PARAMS_FSRS5];
    customParams[8] = 0.5; // Modify a parameter that affects recall stability

    const result = updateStability(
      difficulty,
      stability,
      elapsedDays,
      rating,
      customParams
    );

    // Calculate expected values with the custom parameters
    const retrievability = forgettingCurve(elapsedDays, stability);
    const expectedStability = recallStability(
      difficulty,
      stability,
      retrievability,
      rating,
      customParams
    );
    const expectedDifficulty = updateDifficulty(
      difficulty,
      rating,
      customParams
    );

    expect(result.stability).toBeCloseTo(expectedStability);
    expect(result.difficulty).toBeCloseTo(expectedDifficulty);
  });
});
