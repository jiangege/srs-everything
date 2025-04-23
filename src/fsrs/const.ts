export const DEFAULT_PARAMS_FSRS5 = [
  0.40255, // w0
  1.18385, // w1
  3.173, // w2
  15.69105, // w3
  7.1949, // w4 - 用于计算初始难度 D₀(G)
  0.5345, // w5 - 衰减参数，用于计算 D₀(G)
  1.4604, // w6 - 用于计算线性阻尼 ΔD(G)= -w6*(G-3)
  0.0046, // w7 - 均值回归系数，控制更新后的难度回归目标
  1.54575, // w8 - 新回忆后稳定性中系数，参与 exp() 部分计
  0.1192, // w9 - 用于难度更新中 10^(–w9) 的指数部分，也参与新稳定性计算
  1.01925, // w10 - 用于新稳定性计算中 exp(w10*(1-R))
  1.9395, // w11 - 用于遗忘后稳定性 S_f′ 中 D 部分的系数
  0.11, // w12 - 用于遗忘后稳定性 S_f′ 中乘积项的系数
  0.29605, // w13 - 用于遗忘后稳定性中 (S+1) 的幂次
  2.2698, // w14 - 用于遗忘后稳定性中 exp( w14*(1-R) ) 的系数
  0.2315, // w15 - 新回忆后稳定性中，评分 Hard (G=2) 时的 bonus
  2.9898, // w16 - 新回忆后稳定性中，评分 Easy (G=4) 时的 bonus
  0.51655, // w17 - 用于同日复习稳定性更新中 S′ = S * exp( w17*(G-3+w18) )
  0.6621, // w18 - 同日复习稳定性更新中的常数偏移量
];

export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 10;

export const MIN_STABILITY = 0.01;
export const MAX_STABILITY = 36500.0;

export const DEFAULT_DESIRED_RETENTION = 0.9;
