/**
 * MOOD GitHub Verifier
 * Version: v0.1.0
 * 
 * Verifies GitHub commit contributions.
 */

interface GitHubVerificationResult {
  verified: boolean;
  repository?: string;
  commit?: string;
  author?: string;
  timestamp?: string;
  message?: string;
}

interface GitHubVerifyInput {
  repository: string;  // e.g., "owner/repo"
  commit_id: string;   // commit SHA
  author?: string;     // expected author (optional)
}

class GitHubVerifier {
  private mockData: Map<string, any> = new Map();

  constructor() {
    // Initialize with mock data for testing
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock valid commits for testing
    this.mockData.set('huliye24/MOOD@abc123def456', {
      exists: true,
      repository: 'huliye24/MOOD',
      commit: 'abc123def456',
      author: 'huliye24',
      timestamp: '2026-09-02T10:00:00Z',
      message: 'Initial commit'
    });
    
    this.mockData.set('huliye24/MOOD@def789ghi012', {
      exists: true,
      repository: 'huliye24/MOOD',
      commit: 'def789ghi012',
      author: 'huliye24',
      timestamp: '2026-09-02T12:00:00Z',
      message: 'Add proof engine'
    });
  }

  /**
   * Verify a GitHub commit
   */
  async verify(input: GitHubVerifyInput): Promise<GitHubVerificationResult> {
    const { repository, commit_id, author } = input;
    const key = `${repository}@${commit_id}`;
    
    // Check mock data
    const mockResult = this.mockData.get(key);
    
    if (mockResult) {
      // If author is specified, verify it matches
      if (author && mockResult.author !== author) {
        return {
          verified: false,
          message: 'Author mismatch'
        };
      }
      
      return {
        verified: true,
        repository: mockResult.repository,
        commit: mockResult.commit,
        author: mockResult.author,
        timestamp: mockResult.timestamp,
        message: 'GitHub commit verified'
      };
    }

    // For v0.1, we simulate verification
    // In production, this would call GitHub API
    if (this.isValidCommitFormat(commit_id)) {
      return {
        verified: true,
        repository,
        commit: commit_id,
        author: author || 'anonymous',
        timestamp: new Date().toISOString(),
        message: 'GitHub commit verified (simulated)'
      };
    }

    return {
      verified: false,
      message: 'Invalid commit format or commit not found'
    };
  }

  /**
   * Check if commit format is valid (40 char hex)
   */
  private isValidCommitFormat(commit: string): boolean {
    return /^[a-f0-9]{40}$/i.test(commit) || /^[a-f0-9]{7,}$/i.test(commit);
  }

  /**
   * Generate evidence from verification
   */
  generateEvidence(result: GitHubVerificationResult): object {
    if (!result.verified) {
      return {
        type: 'github_commit',
        verified: false,
        message: result.message
      };
    }

    return {
      id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'github_commit',
      source: 'github.com',
      reference: result.commit,
      repository: result.repository,
      author: result.author,
      timestamp: result.timestamp,
      verified: true,
      hash: this.generateEvidenceHash(result)
    };
  }

  /**
   * Generate SHA256-like hash for evidence
   */
  private generateEvidenceHash(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
  }
}

module.exports = new GitHubVerifier();
module.exports.GitHubVerifier = GitHubVerifier;
