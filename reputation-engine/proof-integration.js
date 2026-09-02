/**
 * MOOD Reputation Engine - Proof Integration
 * Version: v0.1.0
 * 
 * Integrates Reputation Engine with Proof Engine.
 * Automatically updates reputation when proofs are verified.
 */

const reputationService = require('../../reputation-engine/api/reputation-service');

/**
 * Map proof verification methods to contribution types and qualities
 */
const PROOF_TYPE_MAPPING: Record<string, { type: string; quality: string }> = {
  github_commit: { type: 'code', quality: 'github_commit' },
  file_hash: { type: 'documentation', quality: 'auto_verification' },
  timestamp: { type: 'infrastructure', quality: 'auto_verification' },
  manual: { type: 'research', quality: 'manual_review' }
};

/**
 * Process a verified proof and update reputation
 */
function processVerifiedProof(proof: {
  proof_id: string;
  contribution_id: string;
  contributor: string;
  verification_method: string;
  status: string;
}): {
  address: string;
  score: number;
  level: string;
  delta: number;
} | null {
  // Only process verified proofs
  if (proof.status !== 'verified') {
    return null;
  }

  // Get contribution type from verification method
  const mapping = PROOF_TYPE_MAPPING[proof.verification_method] || {
    type: 'code',
    quality: 'auto_verification'
  };

  // Update reputation
  const result = reputationService.update(proof.contributor, {
    contribution_type: mapping.type as any,
    proof_quality: mapping.quality as any,
    proof_status: 'verified'
  });

  return {
    address: proof.contributor,
    score: result.total_score,
    level: result.level,
    delta: result.history.length > 0 
      ? result.history[result.history.length - 1].delta 
      : 0
  };
}

/**
 * Batch process proofs
 */
function batchProcessProofs(proofs: Array<{
  proof_id: string;
  contribution_id: string;
  contributor: string;
  verification_method: string;
  status: string;
}>): Array<{
  proof_id: string;
  success: boolean;
  result?: any;
  error?: string;
}> {
  return proofs.map(proof => {
    try {
      const result = processVerifiedProof(proof);
      return {
        proof_id: proof.proof_id,
        success: true,
        result
      };
    } catch (error: any) {
      return {
        proof_id: proof.proof_id,
        success: false,
        error: error.message
      };
    }
  });
}

module.exports = {
  processVerifiedProof,
  batchProcessProofs,
  PROOF_TYPE_MAPPING
};
