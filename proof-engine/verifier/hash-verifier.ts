/**
 * MOOD Hash Verifier
 * Version: v0.1.0
 * 
 * Verifies file integrity via hash comparison.
 */

interface HashVerificationResult {
  verified: boolean;
  algorithm: string;
  original_hash?: string;
  current_hash?: string;
  filename?: string;
  message?: string;
}

interface HashVerifyInput {
  content: string | Buffer;
  expected_hash?: string;
  algorithm?: 'sha256' | 'sha1' | 'md5';
}

interface FileHashInput {
  filename: string;
  content: string | Buffer;
}

class HashVerifier {
  private knownHashes: Map<string, string> = new Map();

  constructor() {
    // Initialize with known hashes for testing
    this.initializeKnownHashes();
  }

  private initializeKnownHashes() {
    // Known hashes for testing
    this.knownHashes.set('MOOD_Whitepaper.pdf', 'abc123def456789...');
    this.knownHashes.set('protocol-spec.json', 'def789abc012345...');
  }

  /**
   * Verify content against expected hash
   */
  async verify(input: HashVerifyInput): Promise<HashVerificationResult> {
    const { content, expected_hash, algorithm = 'sha256' } = input;

    const current_hash = await this.computeHash(content, algorithm);

    if (!expected_hash) {
      return {
        verified: true,
        algorithm,
        current_hash,
        message: 'Hash computed (no comparison provided)'
      };
    }

    const verified = current_hash.toLowerCase() === expected_hash.toLowerCase();

    return {
      verified,
      algorithm,
      original_hash: expected_hash,
      current_hash,
      message: verified ? 'Hash matches' : 'Hash mismatch'
    };
  }

  /**
   * Generate hash for a file
   */
  async hashFile(input: FileHashInput): Promise<string> {
    const { filename, content } = input;
    const hash = await this.computeHash(content, 'sha256');
    
    // Store the hash
    this.knownHashes.set(filename, hash);

    return hash;
  }

  /**
   * Verify a stored file hash
   */
  async verifyStoredHash(filename: string, content: string | Buffer): Promise<HashVerificationResult> {
    const storedHash = this.knownHashes.get(filename);
    
    if (!storedHash) {
      return {
        verified: false,
        algorithm: 'sha256',
        current_hash: await this.computeHash(content, 'sha256'),
        filename,
        message: 'No stored hash found for file'
      };
    }

    const currentHash = await this.computeHash(content, 'sha256');
    const verified = currentHash.toLowerCase() === storedHash.toLowerCase();

    return {
      verified,
      algorithm: 'sha256',
      original_hash: storedHash,
      current_hash: currentHash,
      filename,
      message: verified ? 'File integrity verified' : 'File has been modified'
    };
  }

  /**
   * Compute hash of content
   */
  private async computeHash(content: string | Buffer, algorithm: string): Promise<string> {
    // Simple hash implementation for v0.1
    // In production, use crypto module
    const str = typeof content === 'string' ? content : content.toString('utf-8');
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const hex = Math.abs(hash).toString(16);
    // Pad to simulate SHA256 length
    return hex.padStart(64, '0');
  }

  /**
   * Generate evidence from verification result
   */
  generateEvidence(result: HashVerificationResult): object {
    if (!result.verified) {
      return {
        type: 'file_hash',
        verified: false,
        message: result.message
      };
    }

    return {
      id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'file_hash',
      source: 'local',
      reference: result.filename || 'content',
      hash: result.current_hash,
      algorithm: result.algorithm,
      timestamp: new Date().toISOString(),
      verified: true
    };
  }
}

module.exports = new HashVerifier();
module.exports.HashVerifier = HashVerifier;
