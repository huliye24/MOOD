/**
 * MOOD Reputation Engine Tests
 * Version: v0.1.0
 * 
 * Test suite for the reputation engine functionality.
 */

const { 
  calculateScore, 
  calculateCumulativeScore,
  getLevel,
  updateReputation,
  calculateBreakdown
} = require('../scoring/score-calculator');

const { 
  CONTRIBUTION_WEIGHTS, 
  PROOF_QUALITY,
  getLevelFromScore,
  getNextLevelThreshold,
  getProgressToNextLevel
} = require('../scoring/weights');

const { ReputationService } = require('../api/reputation-service');

describe('Reputation Engine v0.1', () => {
  describe('Test 001: Protocol Contribution Score', () => {
    test('should calculate score for protocol contribution with verified proof', () => {
      const result = calculateScore({
        contribution_type: 'protocol',
        proof_quality: 'core_verification',
        proof_status: 'verified'
      });

      expect(result.score).toBe(10); // 10 * 1.0 * 1.0 = 10
      expect(result.contribution_type).toBe('protocol');
      expect(result.verified).toBe(true);
    });

    test('should return correct breakdown', () => {
      const result = calculateScore({
        contribution_type: 'protocol',
        proof_quality: 'core_verification',
        proof_status: 'verified'
      });

      expect(result.breakdown.type_weight).toBe(10);
      expect(result.breakdown.proof_quality).toBe(1.0);
      expect(result.breakdown.impact_factor).toBe(1.0);
    });
  });

  describe('Test 002: Code Contribution Score', () => {
    test('should calculate score for code contribution with github proof', () => {
      const result = calculateScore({
        contribution_type: 'code',
        proof_quality: 'github_commit',
        proof_status: 'verified'
      });

      // 8 * 0.8 * 1.0 = 6.4
      expect(result.score).toBe(6.4);
      expect(result.contribution_type).toBe('code');
    });

    test('should use default proof quality if not specified', () => {
      const result = calculateScore({
        contribution_type: 'code',
        proof_status: 'verified'
      });

      // 8 * 0.7 * 1.0 = 5.6
      expect(result.score).toBe(5.6);
    });
  });

  describe('Test 003: Cumulative Score', () => {
    test('should sum multiple verified contributions', () => {
      const contributions = [
        { contribution_type: 'protocol', proof_quality: 'core_verification', proof_status: 'verified' },
        { contribution_type: 'code', proof_quality: 'github_commit', proof_status: 'verified' },
        { contribution_type: 'documentation', proof_quality: 'auto_verification', proof_status: 'verified' }
      ];

      const total = calculateCumulativeScore(contributions);

      // 10 + 6.4 + 2.1 = 18.5
      expect(total).toBeCloseTo(18.5);
    });

    test('should not include pending contributions', () => {
      const contributions = [
        { contribution_type: 'protocol', proof_quality: 'core_verification', proof_status: 'verified' },
        { contribution_type: 'code', proof_quality: 'github_commit', proof_status: 'pending' }
      ];

      const total = calculateCumulativeScore(contributions);

      // Only 10, not 10 + 6.4
      expect(total).toBe(10);
    });
  });

  describe('Score Calculator - All Contribution Types', () => {
    test.each([
      ['protocol', 10],
      ['code', 8],
      ['infrastructure', 7],
      ['research', 6],
      ['community', 4],
      ['documentation', 3]
    ])('should have correct weight for %s', (type, expectedWeight) => {
      expect(CONTRIBUTION_WEIGHTS[type]).toBe(expectedWeight);
    });

    test.each([
      ['core_verification', 1.0],
      ['manual_review', 0.9],
      ['github_commit', 0.8],
      ['auto_verification', 0.7],
      ['self_claimed', 0.5]
    ])('should have correct quality for %s', (quality, expectedValue) => {
      expect(PROOF_QUALITY[quality]).toBe(expectedValue);
    });
  });

  describe('Reputation Levels', () => {
    test('should return Genesis for score 0', () => {
      expect(getLevel(0)).toBe('Genesis');
      expect(getLevel(25)).toBe('Genesis');
      expect(getLevel(49)).toBe('Genesis');
    });

    test('should return Builder for score 50-199', () => {
      expect(getLevel(50)).toBe('Builder');
      expect(getLevel(100)).toBe('Builder');
      expect(getLevel(199)).toBe('Builder');
    });

    test('should return Core Contributor for score 200-999', () => {
      expect(getLevel(200)).toBe('Core Contributor');
      expect(getLevel(500)).toBe('Core Contributor');
      expect(getLevel(999)).toBe('Core Contributor');
    });

    test('should return Guardian for score 1000+', () => {
      expect(getLevel(1000)).toBe('Guardian');
      expect(getLevel(5000)).toBe('Guardian');
    });

    test('should calculate next level threshold', () => {
      expect(getNextLevelThreshold(0)).toBe(50);
      expect(getNextLevelThreshold(50)).toBe(200);
      expect(getNextLevelThreshold(200)).toBe(1000);
      expect(getNextLevelThreshold(1000)).toBe(null);
    });

    test('should calculate progress to next level', () => {
      expect(getProgressToNextLevel(0)).toBe(0);
      expect(getProgressToNextLevel(25)).toBe(50); // 25/50 = 50%
      expect(getProgressToNextLevel(50)).toBe(100);
      expect(getProgressToNextLevel(100)).toBe(33); // (100-50)/(200-50) ≈ 33%
    });
  });

  describe('Update Reputation', () => {
    test('should add score for verified contribution', () => {
      const result = updateReputation(0, {
        contribution_type: 'protocol',
        proof_quality: 'core_verification',
        proof_status: 'verified'
      });

      expect(result.newScore).toBe(10);
      expect(result.delta).toBe(10);
      expect(result.newLevel).toBe('Genesis');
    });

    test('should not add score for pending contribution', () => {
      const result = updateReputation(0, {
        contribution_type: 'protocol',
        proof_quality: 'core_verification',
        proof_status: 'pending'
      });

      expect(result.newScore).toBe(0);
      expect(result.delta).toBe(0);
    });

    test('should update level when threshold is reached', () => {
      // Start with 45, add 10 = 55 (Builder)
      const result = updateReputation(45, {
        contribution_type: 'protocol',
        proof_quality: 'core_verification',
        proof_status: 'verified'
      });

      expect(result.newScore).toBe(55);
      expect(result.newLevel).toBe('Builder');
    });
  });

  describe('Breakdown Calculation', () => {
    test('should calculate breakdown by type', () => {
      const contributions = [
        { contribution_type: 'protocol', proof_quality: 'core_verification', proof_status: 'verified' },
        { contribution_type: 'code', proof_quality: 'github_commit', proof_status: 'verified' },
        { contribution_type: 'code', proof_quality: 'github_commit', proof_status: 'verified' }
      ];

      const breakdown = calculateBreakdown(contributions);

      expect(breakdown.protocol).toBe(10);
      expect(breakdown.code).toBe(12.8); // 6.4 + 6.4
      expect(breakdown.total).toBe(22.8);
    });
  });

  describe('Reputation Service', () => {
    let service;

    beforeEach(() => {
      service = new ReputationService();
    });

    test('should create initial reputation', () => {
      const reputation = service.update('test_user', {
        contribution_type: 'protocol',
        proof_quality: 'core_verification',
        proof_status: 'verified'
      });

      expect(reputation.contributor).toBe('test_user');
      expect(reputation.total_score).toBe(10);
      expect(reputation.level).toBe('Genesis');
      expect(reputation.contributions).toBe(1);
    });

    test('should accumulate score', () => {
      service.update('test_user', {
        contribution_type: 'protocol',
        proof_quality: 'core_verification',
        proof_status: 'verified'
      });

      const updated = service.update('test_user', {
        contribution_type: 'code',
        proof_quality: 'github_commit',
        proof_status: 'verified'
      });

      expect(updated.total_score).toBe(16.4); // 10 + 6.4
      expect(updated.contributions).toBe(2);
    });

    test('should get reputation', () => {
      service.update('test_user', {
        contribution_type: 'protocol',
        proof_quality: 'core_verification',
        proof_status: 'verified'
      });

      const reputation = service.getReputation('test_user');

      expect(reputation).toBeDefined();
      expect(reputation.total_score).toBe(10);
    });

    test('should return null for unknown user', () => {
      const reputation = service.getReputation('unknown');
      expect(reputation).toBeNull();
    });

    test('should get leaderboard', () => {
      service.update('user1', { contribution_type: 'protocol', proof_status: 'verified' });
      service.update('user2', { contribution_type: 'code', proof_status: 'verified' });
      service.update('user3', { contribution_type: 'protocol', proof_status: 'verified' });
      service.update('user3', { contribution_type: 'protocol', proof_status: 'verified' });

      const leaderboard = service.getLeaderboard(3);

      expect(leaderboard.length).toBe(3);
      expect(leaderboard[0].contributor).toBe('user3'); // 20 points
      expect(leaderboard[1].contributor).toBe('user1'); // 10 points
    });

    test('should get top by level', () => {
      service.update('builder1', { contribution_type: 'code', proof_quality: 'github_commit', proof_status: 'verified' }); // 6.4

      const builders = service.getTopByLevel('Builder', 10);

      expect(builders.length).toBe(1);
      expect(builders[0].level).toBe('Builder');
    });
  });
});
