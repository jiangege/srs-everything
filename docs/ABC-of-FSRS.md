FSRS is a modern [spaced repetition](https://en.wikipedia.org/wiki/Spaced_repetition) algorithm that was developed by Jarrett Ye. It aims to learn your memory patterns and schedule reviews more efficiently than Anki's legacy SM-2 algorithm. 

The goal of a spaced repetition algorithm is to calculate the optimal intervals between reviews. But what makes an interval "optimal"? In FSRS, an interval is considered optimal if it corresponds to a specific probability of recalling a card. For example, if you want to be 90% sure that you will successfully recall a card the next time you see it, the optimal interval is the one at which the probability of recall is 90%.

FSRS is based on the "Three Component Model of Memory". The model asserts that three variables are sufficient to describe the status of a unitary memory in a human brain. These three variables include:

* Retrievability (R): The probability that the person can successfully recall a particular piece of information at a given moment. It depends on the time elapsed since the last review and the memory stability (S).

* Stability (S): The time, in days, required for R to decrease from 100% to 90%. For example, S = 365 means that an entire year will pass before the probability of recalling a particular card drops to 90%.

* Difficulty (D): The inherent complexity of a particular information. It represents how difficult it is to increase memory stability after a review.

In FSRS, these three values are collectively called the "memory state". The value of R changes daily, while D and S change only after a card has been reviewed. Older versions of FSRS take into account only the first review of the day, FSRS-5 uses all reviews. Each card has its own DSR values, in other words, each card has its own memory state.

To accurately estimate the DSR values, FSRS analyzes the user's review history and uses machine learning to calculate parameters that provide the best fit to the review history. The most recent version of FSRS, FSRS-5, uses 19 parameters in the formulas for D and S (the formula for retrievability doesn't require any parameters). If you are interested in the details, you can read the following wiki pages: [The Algorithm](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm) and [The mechanism of optimization](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-mechanism-of-optimization). If a user doesn't have enough reviews yet, the default parameters are used instead. They have been found by running the FSRS optimizer on several hundred million reviews from ~10k users. Even with the default parameters, FSRS is better than Anki's default algorithm.

Note that the users should not tweak the parameters manually. If you want to adjust the scheduling, all you need to do is choose an appropriate value of desired retention. Values between 70% and 97% are considered reasonable. With FSRS, users can target a specific value of retention, allowing them to balance how much they remember and how many reviews they have to do. Higher retention leads to more reviews per day.

Aside from allowing the users to easily control their retention, FSRS has some other advantages when compared to Anki's default algorithm. With FSRS, users have to do 20–30% fewer reviews than with Anki's default algorithm to achieve the same retention level. FSRS is also much better at scheduling cards that have been reviewed with a delay, for example, if the user took a break from Anki for a few weeks or months. In addition, the [FSRS4Anki Helper add-on](https://github.com/open-spaced-repetition/fsrs4anki-helper) provides some useful features that are not available otherwise.

If your Anki version is 23.10 or newer, read [this guide](https://github.com/open-spaced-repetition/fsrs4anki/blob/main/docs/tutorial.md) or [the official Anki manual](https://docs.ankiweb.net/deck-options.html#fsrs). If your Anki version is older than 23.10, then you can use the standalone version of FSRS, please read [this guide](https://github.com/open-spaced-repetition/fsrs4anki#how-to-get-started) to learn how to install it.

If you want to see how FSRS performs in comparison to other algorithms, read these pages: [Benchmark](https://github.com/open-spaced-repetition/fsrs-benchmark) and [FSRS vs SM-17](https://github.com/open-spaced-repetition/fsrs-vs-sm17), one of the most recent SuperMemo algorithms.

If you have any further questions about FSRS, check the [FAQ](https://github.com/open-spaced-repetition/fsrs4anki/wiki/FAQ).

If you want to learn more about spaced repetition algorithms, you can check out [Spaced Repetition Algorithm: A Three‐Day Journey from Novice to Expert](https://github.com/open-spaced-repetition/fsrs4anki/wiki/Spaced-Repetition-Algorithm:-A-Three%E2%80%90Day-Journey-from-Novice-to-Expert).

If you find this introduction helpful, I'd be grateful if you could give it a star:

[![Star on GitHub](https://img.shields.io/github/stars/open-spaced-repetition/fsrs4anki.svg?style=social)](https://github.com/open-spaced-repetition/fsrs4anki)