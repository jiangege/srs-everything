The FSRS (Free Spaced Repetition Scheduler) algorithm is based on a variant of the DSR (Difficulty, Stability, Retrievability) model, which is used to predict memory states.

Here is a visualizer to preview the interval with specific parameters and review history: [Anki FSRS Visualizer (open-spaced-repetition.github.io)](https://open-spaced-repetition.github.io/anki_fsrs_visualizer/)

In case you find this article difficult to understand, perhaps you will like this more: [https://expertium.github.io/Algorithm.html.](https://expertium.github.io/Algorithm.html)

# Symbol

- $R$: Retrievability (probability of recall)
- $S$: Stability (interval when $R=90%$)
  - $S^\prime_r$: new stability after recall
  - $S^\prime_f$: new stability after forgetting
- $D$: Difficulty ( $D \in [1, 10]$ )
- $G$: Grade (rating at Anki):
  - $1$: `again`
  - $2$: `hard`
  - $3$: `good`
  - $4$: `easy`

# FSRS-5

## Default parameters

```python
[0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621]
```

## Formula

The stability after a same-day review:

$$S^\prime(S,G) = S \cdot e^{w_{17} \cdot (G - 3 + w_{18})}$$

***

The initial difficulty after the first rating: 

$$D_0(G) = w_4 - e^{w_5 \cdot (G - 1)} + 1,$$

where $w_4 = D_0(1)$, i.e., the initial difficulty when the first rating is `Again`.

***

Linear Damping for the new difficulty after review:

$$\Delta D(G) = - w_6 \cdot (G - 3)$$

$$D^\prime = D + \Delta D \cdot \cfrac{10 - D}{9}$$

***

In FSRS 5, $D_0(4)$ is the target of mean reversion. Earlier versions had $D_0(3)$ as the target.

$$D^{\prime\prime} = w_7 \cdot D_0(4) + (1 - w_7) \cdot D^\prime.$$

The other formulas are the same as FSRS-4.5.

# FSRS-4.5

## Default parameters

```python
[0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755]
```

## Formula

The formula of forgetting curve is changed in this update.

The retrievability after $t$ days since the last review:

$$R(t,S) = \left(1 + FACTOR \cdot \cfrac{t}{S}\right)^{DECAY},$$

where $R(t,S)=0.9$ when $t=S$.

The next interval can be calculated by solving for $t$ in the above equation after putting the request retention in place of $R$:

$$I(r,S) = \cfrac{S}{FACTOR} \cdot \left(r^\cfrac{1}{DECAY} - 1\right),$$

where $I(r,S)=S$ when $r=0.9$.

In FSRS v4, $DECAY=-1$ and $FACTOR=\cfrac{1}{9}$

In FSRS-4.5, $DECAY=-0.5$ and $FACTOR=\cfrac{19}{81}$

The new forgetting curve drops sharply before $S$ and flatly after $S$.

# FSRS v4

## Default parameters

```python
[0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61]
```

## Formula

> The $w_i$ denotes w[i].

The initial stability after the first rating: 

$$S_0(G) = w_{G-1}.$$

For example, $S_0(1)=w_0$ is the initial stability when the first rating is `again`. When the first rating is `easy`, the initial stability is $S_0(4)=w_3$.

***

The initial difficulty after the first rating: 

$$D_0(G) = w_4 - (G-3) \cdot w_5,$$

where the $D_0(3)=w_4$ when the first rating is `good`.

***

The new difficulty after review:

$$D^\prime(D,G) = w_7 \cdot D_0(3) +(1 - w_7) \cdot (D - w_6 \cdot (G - 3)).$$

It will calculate the new difficulty with $D^\prime = D - w_6 \cdot (G - 3)$, and then apply the mean reversion $w_7 \cdot D_0(3) + (1 - w_7) \cdot D^\prime$ to avoid "ease hell".

***

The retrievability after $t$ days since the last review:

$$R(t,S) = \left(1 + \cfrac{t}{9 \cdot S}\right)^{-1},$$

where $R(t,S)=0.9$ when $t=S$.

The next interval can be calculated by solving for $t$ in the above equation after putting the request retention in place of $R$:

$$I(r,S) = 9 \cdot S \cdot \left(\cfrac{1}{r} - 1\right),$$

where $I(r,S)=S$ when $r=0.9$.

***

The new stability after a successful review (the user pressed "Hard", "Good" or "Easy"):

$$
\begin{align*}
S^\prime_r(D,S,R,G) = & S \\
& \cdot (e^{w_8} \\
& \cdot (11-D) \\
& \cdot S^{-w_9} \\
& \cdot (e^{w_{10}\cdot(1-R)}-1) \\
& \cdot w_{15}(\textrm{if G = 2}) \\
& \cdot w_{16}(\textrm{if G = 4}) \\
& + 1).
\end{align*}
$$

Let $SInc$ (the increase in stability) denotes $\cfrac{S^\prime_r(D,S,R,G)}{S}$, which is equivalent to Anki's factor.

1. The larger the value of $D$, the smaller the $SInc$ value. This means that the increase in memory stability for difficult material is smaller than for easy material.
2. The larger the value of $S$, the smaller the $SInc$ value. This means that the higher the stability of the memory, the harder it becomes to make the memory even more stable.
3. The smaller the value of $R$, the larger the $SInc$ value. This means that the [spacing effect](https://en.wikipedia.org/wiki/Spacing_effect) accumulates over time.
4. The value of $SInc$ is always greater than or equal to 1 if the review was successful.

In FSRS, a delay in reviewing (i.e., overdue reviews) affects the next interval as follows:

As the delay increases, retention (R) decreases. If the review was successful, the subsequent stability (S) would be higher, according to point 3 above. However, instead of increasing linearly with the delay like the SM-2/Anki algorithm, the subsequent stability converges to an upper limit, which depends on your FSRS parameters.

![image](https://user-images.githubusercontent.com/32575846/235642239-25de48b8-5dc6-4450-94e5-0bbf8165a559.png)

You can modify them in this playground: https://www.geogebra.org/calculator/ahqmqjvx.

***

The stability after forgetting (i.e., post-lapse stability):

$$
\begin{align*}
S^\prime_f(D,S,R) =  & w_{11} \\
& \cdot D^{-w_{12}} \\
& \cdot ((S+1)^{w_{13}} - 1) \\
& \cdot e^{w_{14} \cdot (1-R)}.
\end{align*}
$$

For example, if $D=2$ and $R=0.9$, with default parameters, $S^\prime_f(S=100) = 2\cdot 2^{-0.2} \cdot ((100+1)^{0.2}-1) \cdot e^{1(1-0.9)} \approx 3$ and $S^\prime_f(S=1) \approx 0.3$.

# FSRS v3

## Default parameters

```python
[0.9605, 1.7234, 4.8527, -1.1917, -1.2956, 0.0573, 1.7352, -0.1673, 1.065, 1.8907, -0.3832, 0.5867, 1.0721]
```

## Formula

> The $w_i$ denotes w[i].

The initial stability after the first rating: 

$$S_0(G) = w_0 + (G-1) \cdot w_1,$$

where the $S_0(1)=w_0$ is the initial stability when the first rating is `again`. When the first rating is `easy`, the initial stability is $S_0(4)=w_0 + 3 \cdot w_1$.

***

The initial difficulty after the first rating: 

$$D_0(G) = w_2 + (G-3) \cdot w_3,$$

where the $D_0(3)=w_2$ when the first rating is `good`.

***

The new difficulty after review:

$$D^\prime(D,G) = w_5 \cdot D_0(3) +(1 - w_5) \cdot (D + w_4 \cdot (G - 3)).$$

It will calculate the new difficulty with $D^\prime = D + w_4 \cdot (G - 3)$, and then apply the mean reversion $w_5 \cdot D_0(3) + (1 - w_5) \cdot D^\prime$ to avoid "ease hell".

***

The retrievability of $t$ days since the last review:

$$R(t,S) = 0.9^{\frac{t}{S}},$$

where $R(t,S)=0.9$ when $t=S$.

The next interval can be calculated by solving for $t$ in the above equation after putting the request retention in place of $R$.

$$I(r,S) = S \cdot \cfrac{\ln(r)}{\ln(0.9)},$$

where $I(r,S)=S$ when $r=0.9$.

Note: the intervals after Hard and Easy ratings are calculated differently. The interval after Easy rating will multiply `easyBonus`. The interval after Hard rating is `lastInterval` multiplied `hardInterval`.

***

The new stability after recall:

$$S^\prime_r(D,S,R) = S\cdot(e^{w_6}\cdot (11-D)\cdot S^{w_7}\cdot(e^{w_8\cdot(1-R)}-1)+1).$$

Let $SInc$ (the increase in stability) denotes $\cfrac{S^\prime_r(D,S,R)}{S}$, which is equivalent to Anki's factor.

1. The larger the value of $D$, the smaller the $SInc$ value. This means that the increase in memory stability for difficult material is smaller than for easy material.
2. The larger the value of $S$, the smaller the $SInc$ value. This means that the higher the stability of the memory, the harder it becomes to make the memory even more stable.
3. The smaller the value of $R$, the larger the $SInc$ value. This means that the [spacing effect](https://en.wikipedia.org/wiki/Spacing_effect) accumulates over time.
4. The value of $SInc$ is always greater than or equal to 1 if the review was successful.

The following 3D visualization could help understand.

![image](https://user-images.githubusercontent.com/32575846/192936891-1a3c4fd8-974b-4b87-ad76-8ba774500361.png)

In FSRS, a delay in reviewing (i.e., overdue reviews) affects the next interval as follows:

As the delay increases, retention (R) decreases. If the review was successful, the subsequent stability (S) would be higher, according to point 3 above. However, instead of increasing linearly with the delay like the SM-2/Anki algorithm, the subsequent stability converges to an upper limit, which depends on your FSRS parameters.

***

The stability after forgetting (i.e., post-lapse stability):

$$S^\prime_f(D,S,R) = w_9\cdot D^{w_{10}}\cdot S^{w_{11}}\cdot e^{w_{12}\cdot(1-R)}.$$

For example, if $D=2$ and $R=0.9$, with default parameters, $S^\prime_f(S=100) = 2\cdot 2^{-0.2} \cdot 100^{0.2} \cdot e^{1(1-0.9)} \approx 5$ and $S^\prime_f(S=1) \approx 2$.

You can play the function in [post-lapse stability - GeoGebra](https://www.geogebra.org/calculator/dzwn2zwh).

![image](https://user-images.githubusercontent.com/32575846/192935271-3b868490-b893-41bd-873c-2a0cf9d96bb1.png)

If you find this introduction helpful, I'd be grateful if you could give it a star:

[![Star on GitHub](https://img.shields.io/github/stars/open-spaced-repetition/fsrs4anki.svg?style=social)](https://github.com/open-spaced-repetition/fsrs4anki)