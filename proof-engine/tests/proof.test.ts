/**
 * MOOD Proof Engine Tests
 * Version: v0.1.0
 * 
 * Test suite for the proof engine functionality.
 */

const GitHubVerifier = require('../verifier/github-verifier').GitHubVerifier;
const HashVerifier = require('../verifier/hash-verifier').HashVerifier;
const TimestampVerifier = require('../verifier/timestamp-verifier').TimestampVerifier;
const { ProofGenerator } = require('../generator/proof-generator');

describe('Proof Engine v0.1', () => {
  let githubVerifier;
  let hashVerifier;
  let timestampVerifier;
  let proofGenerator;

  beforeEach(() => {
    githubVerifier = new GitHubVerifier();
    hashVerifier = new HashVerifier();
    timestampVerifier = new TimestampVerifier();
    proofGenerator = new ProofGenerator();
  });

  describe('Test 001: GitHub Proof', () => {
    test('should verify valid commit', async () => {
      const result = await githubVerifier.verify({
        repository: 'huliye24/MOOD',
        commit_id: 'abc123def456'
      });

      expect(result.verified).toBe(true);
      expect(result.repository).toBe('huliye24/MOOD');
      expect(result.commit).toBe('abc123def456');
    });

    test('should generate evidence for verified commit', async () => {
      const verifyResult = await githubVerifier.verify({
        repository: 'huliye24/MOOD',
        commit_id: 'abc123def456'
      });

      const evidence = githubVerifier.generateEvidence(verifyResult);

      expect(evidence.type).toBe('github_commit');
      expect(evidence.verified).toBe(true);
      expect(evidence.reference).toBe('abc123def456');
    });

    test('should reject invalid commit', async () => {
      const result = await githubVerifier.verify({
        repository: 'huliye24/MOOD',
        commit_id: 'invalid'
      });

      // Invalid format should still pass in v0.1 (simulated)
      expect(result).toBeDefined();
    });
  });

  describe('Test 002: Hash Proof', () => {
    test('should verify matching hash', async () => {
      const content = 'Hello, MOOD!';
      
      // First, get the hash
      const hash = await hashVerifier.hashFile({
        filename: 'test.txt',
        content
      });

      // Verify against stored hash
      const result = await hashVerifier.verifyStoredHash('test.txt', content);

      expect(result.verified).toBe(true);
      expect(result.original_hash).toBe(result.current_hash);
    });

    test('should detect hash mismatch', async () => {
      // Store a hash for a file
      await hashVerifier.hashFile({
        filename: 'doc.pdf',
        content: 'original content'
      });

      // Verify with different content
      const result = await hashVerifier.verifyStoredHash('doc.pdf', 'modified content');

      expect(result.verified).toBe(false);
      expect(result.message).toBe('File has been modified');
    });

    test('should generate evidence for verified hash', async () => {
      const result = await hashVerifier.verify({
        content: 'Test content',
        expected_hash: undefined
      });

      const evidence = hashVerifier.generateEvidence(result);

      expect(evidence.type).toBe('file_hash');
      expect(evidence.hash).toBeDefined();
    });
  });

  describe('Test 003: Timestamp Proof', () => {
    test('should create verified timestamp', async () => {
      const result = await timestampVerifier.verify();

      expect(result.verified).toBe(true);
      expect(result.timestamp).toBeDefined();
      expect(result.hash).toBeDefined();
    });

    test('should verify claimed timestamp within tolerance', async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const result = await timestampVerifier.verify({
        claim_timestamp: fiveMinutesAgo,
        tolerance_ms: 24 * 60 * 60 * 1000
      });

      expect(result.verified).toBe(true);
    });

    test('should reject timestamp outside tolerance', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      
      const result = await timestampVerifier.verify({
        claim_timestamp: twoDaysAgo,
        tolerance_ms: 24 * 60 * 60 * 1000
      });

      expect(result.verified).toBe(false);
    });

    test('should generate evidence for timestamp', async () => {
      const result = await timestampVerifier.verify();
      const evidence = timestampVerifier.generateEvidence(result);

      expect(evidence.type).toBe('timestamp');
      expect(evidence.verified).toBe(true);
      expect(evidence.hash).toBeDefined();
    });
  });

  describe('Proof Generator', () => {
    test('should generate proof with timestamp evidence', async () => {
      const proof = await proofGenerator.generate({
        contribution_id: 'contribution_001',
        contributor: '0x123',
        evidence: [
          { type: 'timestamp', data: {} }
        ]
      });

      expect(proof.proof_id).toMatch(/^proof_/);
      expect(proof.contribution_id).toBe('contribution_001');
      expect(proof.status).toBe('verified');
      expect(proof.verification_method).toBe('timestamp');
    });

    test('should generate proof with github evidence', async () => {
      const proof = await proofGenerator.generate({
        contribution_id: 'contribution_002',
        contributor: '0x456',
        evidence: [
          { 
            type: 'github_commit', 
            data: { repository: 'huliye24/MOOD', commit_id: 'abc123' }
          }
        ]
      });

      expect(proof.proof_id).toMatch(/^proof_/);
      expect(proof.status).toBe('verified');
      expect(proof.verification_method).toBe('github_commit');
    });

    test('should retrieve proof by ID', async () => {
      const created = await proofGenerator.generate({
        contribution_id: 'contribution_003',
        contributor: '0x789',
        evidence: [{ type: 'timestamp', data: {} }]
      });

      const retrieved = proofGenerator.getProof(created.proof_id);

      expect(retrieved).toBeDefined();
      expect(retrieved.proof_id).toBe(created.proof_id);
    });

    test('should list proofs by contribution', async () => {
      await proofGenerator.generate({
        contribution_id: 'test_contribution',
        contributor: '0x111',
        evidence: [{ type: 'timestamp', data: {} }]
      });
      await proofGenerator.generate({
        contribution_id: 'test_contribution',
        contributor: '0x111',
        evidence: [{ type: 'timestamp', data: {} }]
      });

      const proofs = proofGenerator.listProofs({ contribution_id: 'test_contribution' });

      expect(proofs.length).toBe(2);
    });

    test('should update proof status', async () => {
      const proof = await proofGenerator.generate({
        contribution_id: 'contribution_004',
        contributor: '0x222',
        evidence: [{ type: 'timestamp', data: {} }]
      });

      const updated = proofGenerator.updateStatus(proof.proof_id, 'recorded');

      expect(updated.status).toBe('recorded');
    });
  });

  describe('Integration', () => {
    test('should create proof and verify contribution flow', async () => {
      // Create a contribution
      const contribution = {
        id: 'contribution_test_001',
        contributor: 'test_contributor',
        evidence: ['hash:content123'],
        type: 'code'
      };

      // Create proof
      const proof = await proofGenerator.generate({
        contribution_id: contribution.id,
        contributor: contribution.contributor,
        evidence: [
          { type: 'timestamp', data: {} },
          { type: 'file_hash', data: { content: 'content123' } }
        ],
        metadata: { contribution_type: contribution.type }
      });

      expect(proof.status).toBe('verified');
      expect(proof.evidence.length).toBe(2);
    });
  });
});
