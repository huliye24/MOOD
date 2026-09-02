/**
 * MOOD Timestamp Verifier
 * Version: v0.1.0
 * 
 * Records immutable timestamps for contributions.
 */

interface TimestampVerificationResult {
  verified: boolean;
  timestamp: string;
  block_height?: number;
  hash?: string;
  message?: string;
}

interface TimestampVerifyInput {
  claim_timestamp?: string;  // Optional: timestamp claimed by contributor
  tolerance_ms?: number;     // Tolerance for time comparison (default: 24 hours)
}

class TimestampVerifier {
  private timestamps: Map<string, { timestamp: string; hash: string }> = new Map();

  /**
   * Verify/create a timestamp for a contribution
   */
  async verify(input?: TimestampVerifyInput): Promise<TimestampVerificationResult> {
    const { claim_timestamp, tolerance_ms = 24 * 60 * 60 * 1000 } = input || {};
    
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Generate a hash based on timestamp for immutability simulation
    const hash = await this.generateTimestampHash(timestamp);

    if (claim_timestamp) {
      // Verify that claimed timestamp is close to actual time
      const claimed = new Date(claim_timestamp).getTime();
      const actual = now.getTime();
      const diff = Math.abs(actual - claimed);
      
      if (diff > tolerance_ms) {
        return {
          verified: false,
          timestamp,
          hash,
          message: `Timestamp outside tolerance (claimed: ${claim_timestamp})`
        };
      }
    }

    return {
      verified: true,
      timestamp,
      block_height: this.estimateBlockHeight(),
      hash,
      message: 'Timestamp verified'
    };
  }

  /**
   * Record a timestamp for future verification
   */
  async record(content: string): Promise<TimestampVerificationResult> {
    const timestamp = new Date().toISOString();
    const hash = await this.generateTimestampHash(timestamp, content);
    
    this.timestamps.set(hash, { timestamp, hash });

    return {
      verified: true,
      timestamp,
      hash,
      message: 'Timestamp recorded'
    };
  }

  /**
   * Verify a previously recorded timestamp
   */
  async verifyRecorded(hash: string): Promise<TimestampVerificationResult> {
    const record = this.timestamps.get(hash);
    
    if (!record) {
      return {
        verified: false,
        timestamp: new Date().toISOString(),
        message: 'Timestamp not found in records'
      };
    }

    return {
      verified: true,
      timestamp: record.timestamp,
      hash: record.hash,
      message: 'Recorded timestamp verified'
    };
  }

  /**
   * Generate a hash for the timestamp
   */
  private async generateTimestampHash(timestamp: string, content?: string): Promise<string> {
    const data = `${timestamp}${content || ''}${Math.random()}`;
    let hash = 0;
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const hex = Math.abs(hash).toString(16);
    // Pad to simulate 64-char hash
    return hex.padStart(64, '0');
  }

  /**
   * Estimate block height (simulated for v0.1)
   */
  private estimateBlockHeight(): number {
    // Simulated block height
    // In production, this would query the actual chain
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Generate evidence from verification result
   */
  generateEvidence(result: TimestampVerificationResult): object {
    return {
      id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'timestamp',
      source: 'mood_network',
      reference: result.hash,
      timestamp: result.timestamp,
      block_height: result.block_height,
      verified: result.verified,
      hash: result.hash
    };
  }
}

module.exports = new TimestampVerifier();
module.exports.TimestampVerifier = TimestampVerifier;
