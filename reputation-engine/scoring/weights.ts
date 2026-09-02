/**
 * MOOD Reputation Weights
 * Version: v0.1.0
 * 
 * Configuration for contribution weights and proof quality multipliers.
 */

// Contribution type weights
export const CONTRIBUTION_WEIGHTS = {
  protocol: 10,
  code: 8,
  infrastructure: 7,
  research: 6,
  community: 4,
  documentation: 3
} as const;

// Proof quality multipliers
export const PROOF_QUALITY = {
  core_verification: 1.0,
  manual_review: 0.9,
  github_commit: 0.8,
  auto_verification: 0.7,
  self_claimed: 0.5
} as const;

// Impact factor (v0.1 fixed)
export const IMPACT_FACTOR = 1.0;

// Reputation level thresholds
export const LEVEL_THRESHOLDS = {
  genesis: 0,
  builder: 50,
  core_contributor: 200,
  guardian: 1000
} as const;

// Level names
export const LEVELS = {
  genesis: 'Genesis',
  builder: 'Builder',
  core_contributor: 'Core Contributor',
  guardian: 'Guardian'
} as const;

// Type definitions
export type ContributionType = keyof typeof CONTRIBUTION_WEIGHTS;
export type ProofQualityType = keyof typeof PROOF_QUALITY;
export type LevelType = keyof typeof LEVELS;

/**
 * Get contribution weight by type
 */
export function getContributionWeight(type: ContributionType): number {
  return CONTRIBUTION_WEIGHTS[type] || 1;
}

/**
 * Get proof quality multiplier
 */
export function getProofQuality(type: ProofQualityType): number {
  return PROOF_QUALITY[type] || 0.5;
}

/**
 * Get level name from score
 */
export function getLevelFromScore(score: number): string {
  if (score >= LEVEL_THRESHOLDS.guardian) return LEVELS.guardian;
  if (score >= LEVEL_THRESHOLDS.core_contributor) return LEVELS.core_contributor;
  if (score >= LEVEL_THRESHOLDS.builder) return LEVELS.builder;
  return LEVELS.genesis;
}

/**
 * Get next level threshold
 */
export function getNextLevelThreshold(score: number): number | null {
  if (score < LEVEL_THRESHOLDS.builder) return LEVEL_THRESHOLDS.builder;
  if (score < LEVEL_THRESHOLDS.core_contributor) return LEVEL_THRESHOLDS.core_contributor;
  if (score < LEVEL_THRESHOLDS.guardian) return LEVEL_THRESHOLDS.guardian;
  return null; // Already at max level
}

/**
 * Get progress to next level (0-100%)
 */
export function getProgressToNextLevel(score: number): number {
  if (score >= LEVEL_THRESHOLDS.guardian) return 100;
  
  let currentThreshold = LEVEL_THRESHOLDS.genesis;
  let nextThreshold: number;

  if (score < LEVEL_THRESHOLDS.builder) {
    nextThreshold = LEVEL_THRESHOLDS.builder;
  } else if (score < LEVEL_THRESHOLDS.core_contributor) {
    currentThreshold = LEVEL_THRESHOLDS.builder;
    nextThreshold = LEVEL_THRESHOLDS.core_contributor;
  } else {
    currentThreshold = LEVEL_THRESHOLDS.core_contributor;
    nextThreshold = LEVEL_THRESHOLDS.guardian;
  }

  const range = nextThreshold - currentThreshold;
  const progress = score - currentThreshold;
  return Math.min(100, Math.round((progress / range) * 100));
}
