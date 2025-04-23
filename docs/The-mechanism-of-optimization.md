The optimizer applies *Maximum Likelihood Estimation* and *Backpropagation Through Time* to estimate the stability of memory and learn the laws of memory from time-series review logs. Then, it can find the optimal retention to minimize the repetitions via the stochastic shortest path algorithm.

FSRS is based on the **DSR** (Difficulty, Stability, Retrievability) memory model. The **DSR** model uses seventeen parameters and six equations to describe memory dynamics during spaced repetition practice (For details, see [The Algorithm](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm)).

Here is a brief introduction to the training process of FSRS.

# Pre-processing Anki's review logs

The database schema of Anki's review logs is as follows (Copy from [Database Structure](https://github.com/ankidroid/Anki-Android/wiki/Database-Structure)):
```SQL
-- revlog is a review history; it has a row for every review you've ever done!
CREATE TABLE revlog (
    id              integer primary key,
       -- epoch-milliseconds timestamp of when you did the review
    cid             integer not null,
       -- cards.id
    usn             integer not null,
        -- update sequence number: for finding diffs when syncing. 
        --   See the description in the cards table for more info
    ease            integer not null,
       -- which button you pushed to score your recall. 
       -- review:  1(wrong), 2(hard), 3(ok), 4(easy)
       -- learn/relearn:   1(wrong), 2(ok), 3(easy)
    ivl             integer not null,
       -- interval (i.e. as in the card table)
    lastIvl         integer not null,
       -- last interval (i.e. the last value of ivl. Note that this value is not necessarily equal to the actual interval between this review and the preceding review)
    factor          integer not null,
      -- factor
    time            integer not null,
       -- how many milliseconds your review took, up to 60000 (60s)
    type            integer not null
       --  0=learn, 1=review, 2=relearn, 3=cram
);
```
A revlog records card cid reviewed at time id with rating ease. It is easy to trace the entire review history of a card. The memory state of a card depends on its review history. Group the revlogs by card, sort them by time and concatenate the ratings and intervals between each adjacent review; it can generate the history of ratings and history of intervals for each card. Here are the samples after pre-processing:

![image](https://user-images.githubusercontent.com/32575846/202617053-d9c44a82-ef85-412e-9987-a6205ba8f986.png)

# Training with time-series data

In machine learning terms, the histories of ratings and intervals are time-series features. I want to use this time-series data to train the **DSR** model. The inputs are the r_history and t_history, and the outputs are Stability and Difficulty. I built a time-series model via PyTorch to handle this data type, which could automatically apply Backpropagation through time (**BPTT**) to train this model.

![image](https://user-images.githubusercontent.com/32575846/202617068-0c4cdb04-b754-4893-9cbd-e2e0583dc159.png)

# Training from end to end

There is another problem with training the model from the time-series data. One main goal of FSRS is to predict the memory state after a sequence of reviews. However, time-series data only records ratings instead of Stability or Difficulty. Stability is a statistical variable of a group of reviews with the same review history. Is it possible to estimate the stability of memory with the raw data? Maximum likelihood estimation (**MLE**) fits in this case.

Let's say that the function of forgetting curve is $f(t,S)$. The possibility of recall ( $r=1$ ) after $t$ days is $P(r=1,t|S) = f(t,S)$, and the probability of forgetting ( $r=0$ ) is $P(r=0,t|S) = 1 - f(t,S)$. Suppose that with the same stability $S$, done $n$ reviews, recall $p$ times, and fails $n - p$ times. How to estimate the stability $S$?

According to the **MLE** method, $P(r=1,t|S)^p \cdot P(r=0,t|S)^{n-p}$ is the likelihood function to $S$. Taking the logarithm of the likelihood function, we can obtain the log-likelihood formula:

$$p \cdot \log P(r=1,t|S) + (n-p) \cdot \log P(r=0,t|S)$$

Set $n = 1$ and obtain:

$$loss = - [p \cdot \log P(r=1,t|S) + (1-p) \cdot \log P(r=0,t|S)],$$

which is the loss function for updating $S$.

At this point, we then replace $S$ with the **DSR** model and consider the case of multiple reviews.

$$P(r=1,t,\vec{r},\vec{t}|\vec\theta) = f(t,DSR(\vec{r},\vec{t})),$$

where $\vec\theta$ is the model parameters.

With **MLE** and **BPTT**, we can then train the parameters of **DSR** directly from the time-series data.