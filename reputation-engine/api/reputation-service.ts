/**
 * MOOD Reputation Service
 * Version: v0.1.0
 * 
 * Business logic for reputation management.
 */

import {
  calculateScore,
  updateReputation,
  calculateBreakdown,
  getLevel,
  type ScoreCalculationInput
} from '../scoring/score-calculator';

export interface ReputationProfile {
  contributor: string;
  total_score: number;
  level: string;
  contributions: number;
  verified_proofs: number;
  last_updated: string;
  history: ReputationEvent[];
  breakdown: {
    protocol: number;
    code: number;
    research: number;
    infrastructure: number;
    documentation: number;
    community: number;
  };
}

export interface ReputationEvent {
  timestamp: string;
  delta: number;
  reason: string;
  contribution_id?: string;
  proof_id?: string;
}

class ReputationService {
  private reputations: Map<string, ReputationProfile> = new Map();
  private contributionHistory: Map<string, ScoreCalculationInput[]> = new Map();

  /**
   * Get reputation for a contributor
   */
  getReputation(contributor: string): ReputationProfile | null {
    return this.reputations.get(contributor) || null;
  }

  /**
   * Update reputation based on a contribution/proof
   */
  update(contributor: string, input: ScoreCalculationInput): ReputationProfile {
    // Get or create reputation
    let reputation = this.reputations.get(contributor);
    
    if (!reputation) {
      reputation = this.createInitialReputation(contributor);
    }

    // Calculate new score
    const { newScore, delta } = updateReputation(reputation.total_score, input);

    // Update reputation
    reputation.total_score = newScore;
    reputation.level = getLevel(newScore);
    
    if (input.proof_status === 'verified') {
      reputation.contributions += 1;
      reputation.verified_proofs += 1;
    }
    
    reputation.last_updated = new Date().toISOString();

    // Add to history
    if (delta !== 0) {
      reputation.history.push({
        timestamp: new Date().toISOString(),
        delta,
        reason: `Verified ${input.contribution_type} contribution`,
        contribution_id: input.contribution_type,
        proof_id: input.proof_status === 'verified' ? 'new_proof' : undefined
      });
    }

    // Update breakdown
    if (input.proof_status === 'verified') {
      reputation.breakdown[input.contribution_type] += calculateScore(input).score;
    }

    // Store
    this.reputations.set(contributor, reputation);

    // Track contribution in history
    const history = this.contributionHistory.get(contributor) || [];
    history.push(input);
    this.contributionHistory.set(contributor, history);

    return reputation;
  }

  /**
   * Get reputation leaderboard
   */
  getLeaderboard(limit: number = 10): ReputationProfile[] {
    const allReputations = Array.from(this.reputations.values());
    
    return allReputations
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, limit);
  }

  /**
   * Get top contributors by level
   */
  getTopByLevel(level: string, limit: number = 10): ReputationProfile[] {
    const allReputations = Array.from(this.reputations.values());
    
    return allReputations
      .filter(r => r.level === level)
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, limit);
  }

  /**
   * Create initial reputation profile
   */
  private createInitialReputation(contributor: string): ReputationProfile {
    return {
      contributor,
      total_score: 0,
      level: 'Genesis',
      contributions: 0,
      verified_proofs: 0,
      last_updated: new Date().toISOString(),
      history: [],
      breakdown: {
        protocol: 0,
        code: 0,
        research: 0,
        infrastructure: 0,
        documentation: 0,
        community: 0
      }
    };
  }

  /**
   * Get contribution history for a contributor
   */
  getContributionHistory(contributor: string): ScoreCalculationInput[] {
    return this.contributionHistory.get(contributor) || [];
  }

  /**
   * Recalculate total score from history
   */
  recalculate(contributor: string): ReputationProfile {
    const history = this.contributionHistory.get(contributor) || [];
    const breakdown = calculateBreakdown(history);
    
    let reputation = this.reputations.get(contributor);
    
    if (!reputation) {
      reputation = this.createInitialReputation(contributor);
    }

    reputation.total_score = breakdown.total;
    reputation.level = getLevel(breakdown.total);
    reputation.breakdown = breakdown;
    reputation.contributions = history.length;
    reputation.verified_proofs = history.filter(h => h.proof_status === 'verified').length;
    reputation.last_updated = new Date().toISOString();

    this.reputations.set(contributor, reputation);

    return reputation;
  }
}

export default new ReputationService();
export { ReputationService };
