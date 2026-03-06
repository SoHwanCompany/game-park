const EXP_PER_LEVEL = 100;
const EXP_SCORE_MULTIPLIER = 0.01;
const EXP_PLAYTIME_MULTIPLIER = 2;
const MIN_EXP_PER_GAME = 1;

export const calculateExp = (normalizedScore: number, playtimeSeconds: number): number => {
  const scoreExp = Math.floor(normalizedScore * EXP_SCORE_MULTIPLIER);
  const playtimeExp = Math.floor((playtimeSeconds / 60) * EXP_PLAYTIME_MULTIPLIER);

  return Math.max(scoreExp + playtimeExp, MIN_EXP_PER_GAME);
};

export const calculateLevel = (exp: number): number => {
  return Math.floor(exp / EXP_PER_LEVEL) + 1;
};
