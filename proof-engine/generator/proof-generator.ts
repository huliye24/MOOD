/**
 * MOOD Proof Generator
 * Version: v0.1.0
 * 
 * Generates proof objects from verified evidence.
 */

import githubVerifier from '../verifier/github-verifier';
import hashVerifier from '../verifier/hash-verifier';
import timestampVerifier from '../verifier/timestamp-verifier';

export interface Proof {
  proof_id: string;
  contribution_id: string;
  contributor: string;
  evidence_hash: string;
  verification_method: 'github_commit' | 'file_hash' | 'timestamp' | 'manual';
  verified_by: string;
  timestamp: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  evidence: any[];
  metadata?: Record<string, any>;
}

export interface GenerateProofInput {
  contribution_id: string;
  contributor: string;
  evidence: {
    type: 'github_commit' | 'file_hash' | 'timestamp' | 'manual';
    data: any;
  }[];
  metadata?: Record<string, any>;
}

class ProofGenerator {
  private proofs: Map<string, Proof> = new Map();

  /**
   * Generate a proof from evidence
   */
  async generate(input: GenerateProofInput): Promise<Proof> {
    const { contribution_id, contributor, evidence, metadata } = input;

    // Verify each evidence piece
    const verifiedEvidence: any[] = [];
    let allVerified = true;

    for (const e of evidence) {
      const result = await this.verifyEvidence(e);
      verifiedEvidence.push(result);
      
      if (!result.verified) {
        allVerified = false;
      }
    }

    // Generate proof ID
    const proof_id = this.generateId('proof');

    // Generate evidence hash
    const evidence_hash = this.generateEvidenceHash(verifiedEvidence);

    // Get verification method from first evidence
    const verification_method = evidence[0]?.type || 'manual';

    // Create proof
    const proof: Proof = {
      proof_id,
      contribution_id,
      contributor,
      evidence_hash,
      verification_method,
      verified_by: 'system',
      timestamp: new Date().toISOString(),
      status: allVerified ? 'verified' : 'rejected',
      evidence: verifiedEvidence,
      metadata
    };

    // Store proof
    this.proofs.set(proof_id, proof);

    return proof;
  }

  /**
   * Verify evidence based on type
   */
  private async verifyEvidence(evidence: { type: string; data: any }): Promise<any> {
    switch (evidence.type) {
      case 'github_commit':
        const ghResult = await githubVerifier.verify(evidence.data);
        return githubVerifier.generateEvidence(ghResult);

      case 'file_hash':
        if (evidence.data.content && evidence.data.expected_hash) {
          const hashResult = await hashVerifier.verify({
            content: evidence.data.content,
            expected_hash: evidence.data.expected_hash
          });
          return hashVerifier.generateEvidence(hashResult);
        } else if (evidence.data.filename && evidence.data.content) {
          const fileResult = await hashVerifier.verifyStoredHash(
            evidence.data.filename,
            evidence.data.content
          );
          return hashVerifier.generateEvidence(fileResult);
        }
        const computeResult = await hashVerifier.verify({
          content: evidence.data.content || evidence.data
        });
        return hashVerifier.generateEvidence(computeResult);

      case 'timestamp':
        const tsResult = await timestampVerifier.verify(evidence.data);
        return timestampVerifier.generateEvidence(tsResult);

      case 'manual':
        return {
          id: this.generateId('evidence'),
          type: 'manual',
          verified: true,
          timestamp: new Date().toISOString(),
          message: 'Manual verification pending'
        };

      default:
        return {
          type: evidence.type,
          verified: false,
          message: 'Unknown evidence type'
        };
    }
  }

  /**
   * Get proof by ID
   */
  getProof(proof_id: string): Proof | null {
    return this.proofs.get(proof_id) || null;
  }

  /**
   * List all proofs
   */
  listProofs(filters?: { contribution_id?: string; status?: string }): Proof[] {
    let result = Array.from(this.proofs.values());

    if (filters?.contribution_id) {
      result = result.filter(p => p.contribution_id === filters.contribution_id);
    }
    if (filters?.status) {
      result = result.filter(p => p.status === filters.status);
    }

    return result;
  }

  /**
   * Update proof status
   */
  updateStatus(proof_id: string, status: Proof['status']): Proof | null {
    const proof = this.proofs.get(proof_id);
    if (!proof) return null;

    proof.status = status;
    this.proofs.set(proof_id, proof);

    return proof;
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate hash from evidence
   */
  private generateEvidenceHash(evidence: any[]): string {
    const data = JSON.stringify(evidence);
    let hash = 0;
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const hex = Math.abs(hash).toString(16);
    return hex.padStart(64, '0');
  }
}

export default new ProofGenerator();
export { ProofGenerator };
