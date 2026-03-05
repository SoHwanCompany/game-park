interface FixedScoringConfig {
  mode: 'fixed';
  maxRawScore: number;
}

interface EndlessScoringConfig {
  mode: 'endless';
  halfScore: number;
}

type GameScoringConfig = EndlessScoringConfig | FixedScoringConfig;

const MAX_NORMALIZED_SCORE = 10_000;

const SCORING_CONFIGS: Record<string, GameScoringConfig> = {
  kaboom: {
    mode: 'fixed',
    maxRawScore: 3150,
  },
  handle: {
    mode: 'endless',
    halfScore: 3000,
  },
};

export const normalizeScore = (gameCode: string, rawScore: number): number => {
  const config = SCORING_CONFIGS[gameCode];

  if (!config) {
    return Math.max(0, Math.round(rawScore));
  }

  const clamped = Math.max(0, rawScore);

  if (config.mode === 'fixed') {
    const normalized = (clamped / config.maxRawScore) * MAX_NORMALIZED_SCORE;

    return Math.min(Math.round(normalized), MAX_NORMALIZED_SCORE);
  }

  const normalized = (MAX_NORMALIZED_SCORE * clamped) / (clamped + config.halfScore);

  return Math.round(normalized);
};
