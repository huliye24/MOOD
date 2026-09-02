/**
 * MOOD Contribution Registry - Proof Integration
 * Version: v0.1.0
 * 
 * Integrates Contribution Registry with Proof Engine.
 * Automatically creates proofs for contributions and updates status.
 */

const proofGenerator = require('../../proof-engine/generator/proof-generator');
const timestampVerifier = require('../../proof-engine/verifier/timestamp-verifier');

class ContributionProofIntegration {
  /**
   * Create a proof for a contribution
   */
  async createProofForContribution(contribution) {
    const { id, contributor, evidence, type } = contribution;

    // Generate evidence based on type
    let proofEvidence = [];

    // Add timestamp evidence
    const timestampResult = await timestampVerifier.verify();
    proofEvidence.push({
      type: 'timestamp',
      data: timestampResult
    });

    // Add type-specific evidence if available
    if (evidence && evidence.length > 0) {
      for (const e of evidence) {
        if (e.startsWith('github:')) {
          const [_, repo, commit] = e.split(':');
          proofEvidence.push({
            type: 'github_commit',
            data: { repository: repo, commit_id: commit }
          });
        } else if (e.startsWith('hash:')) {
          const [_, content] = e.split(':');
          proofEvidence.push({
            type: 'file_hash',
            data: { content }
          });
        }
      }
    }

    // Generate proof
    const proof = await proofGenerator.generate({
      contribution_id: id,
      contributor,
      evidence: proofEvidence,
      metadata: { contribution_type: type }
    });

    return proof;
  }

  /**
   * Verify a contribution and update its status
   */
  async verifyContribution(contributionService, contributionId) {
    const contribution = contributionService.getContribution(contributionId);
    
    if (!contribution) {
      throw new Error('Contribution not found');
    }

    // Create proof
    const proof = await this.createProofForContribution(contribution);

    // Update contribution status to verified
    if (proof.status === 'verified') {
      contributionService.updateStatus(contributionId, 'verified');
    }

    return {
      contribution_id: contributionId,
      proof_id: proof.proof_id,
      status: proof.status,
      verified: proof.status === 'verified'
    };
  }

  /**
   * Batch verify contributions
   */
  async batchVerify(contributionService, contributionIds) {
    const results = [];

    for (const id of contributionIds) {
      try {
        const result = await this.verifyContribution(contributionService, id);
        results.push(result);
      } catch (error) {
        results.push({
          contribution_id: id,
          verified: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = new ContributionProofIntegration();
module.exports.ContributionProofIntegration = ContributionProofIntegration;
