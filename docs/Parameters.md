# Parameter Reference

This document describes the configuration parameters used by the FSRS and Incremental Reading (IR) algorithms.

## FSRS Parameters

The FSRS scheduler is controlled by an array of 21 numerical parameters (`w0`&ndash;`w20`). The default values come from `DEFAULT_PARAMS_FSRS6` in `src/fsrs/const.ts`.

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

Other related constants:

- `MIN_DIFFICULTY`: 1
- `MAX_DIFFICULTY`: 10
- `MIN_STABILITY`: 0.01
- `MAX_STABILITY`: 36500
- `DEFAULT_DESIRED_RETENTION`: 0.9

These values can be overridden when calling FSRS functions such as `grade` or `predictRatingIntervals`.

## IR Parameters

The Incremental Reading algorithm uses a simple configuration object from `src/ir/const.ts`:

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
