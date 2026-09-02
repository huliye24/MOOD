/**
 * MOOD Score Calculator
 * Version: v0.1.0
 * 
 * Calculates reputation scores based on contributions and proofs.
 */

import {
  getContributionWeight,
  getProofQuality,
  getLevelFromScore,
  IMPACT_FACTOR,
  type ContributionType,
  type ProofQualityType
} from './weights';

export interface ScoreCalculationInput {
  contribution_type: ContributionType;
  proof_quality?: ProofQualityType;
  proof_status?: 'verified' | 'pending' | 'rejected';
  impact_factor?: number;
}

export interface ScoreCalculationResult {
  score: number;
  breakdown: {
    type_weight: number;
    proof_quality: number;
    impact_factor: number;
  };
  contribution_type: ContributionType;
  proof_quality: ProofQualityType;
  verified: boolean;
}

/**
 * Calculate reputation score for a contribution
 */
export function calculateScore(input: ScoreCalculationInput): ScoreCalculationResult {
  const {
    contribution_type,
    proof_quality = 'auto_verification',
    proof_status = 'pending',
    impact_factor = IMPACT_FACTOR
  } = input;

  // Get weights
  const type_weight = getContributionWeight(contribution_type);
  const proof_quality_value = getProofQuality(proof_quality);

  // Calculate score
  const score = type_weight * proof_quality_value * impact_factor;

  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    breakdown: {
      type_weight,
      proof_quality: proof_quality_value,
      impact_factor
    },
    contribution_type,
    proof_quality,
    verified: proof_status === 'verified'
  };
}

/**
 * Calculate cumulative score for multiple contributions
 */
export function calculateCumulativeScore(contributions: ScoreCalculationInput[]): number {
  return contributions.reduce((total, contrib) => {
    const result = calculateScore(contrib);
    return total + (result.verified ? result.score : 0);
  }, 0);
}

/**
 * Get level from score
 */
export function getLevel(score: number): string {
  return getLevelFromScore(score);
}

/**
 * Update reputation based on new proof
 */
export function updateReputation(
  currentScore: number,
  newContribution: ScoreCalculationInput
): { newScore: number; delta: number; newLevel: string } {
  const calculation = calculateScore(newContribution);
  
  // Only add score if verified
  const delta = calculation.verified ? calculation.score : 0;
  const newScore = Math.round((currentScore + delta) * 100) / 100;
  const newLevel = getLevelFromScore(newScore);

  return {
    newScore,
    delta,
    newLevel
  };
}

/**
 * Score breakdown for a contributor
 */
export interface ReputationBreakdown {
  protocol: number;
  code: number;
  research: number;
  infrastructure: number;
  documentation: number;
  community: number;
  total: number;
}

/**
 * Calculate breakdown by contribution type
 */
export function calculateBreakdown(
  contributions: ScoreCalculationInput[]
): ReputationBreakdown {
  const breakdown: ReputationBreakdown = {
    protocol: 0,
    code: 0,
    research: 0,
    infrastructure: 0,
    documentation: 0,
    community: 0,
    total: 0
  };

  for (const contrib of contributions) {
    if (contrib.proof_status !== 'verified') continue;
    
    const result = calculateScore(contrib);
    breakdown[contrib.contribution_type] += result.score;
    breakdown.total += result.score;
  }

  // Round all values
  for (const key of Object.keys(breakdown) as (keyof ReputationBreakdown)[]) {
    breakdown[key] = Math.round(breakdown[key] * 100) / 100;
  }

  return breakdown;
}
