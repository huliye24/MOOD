/**
 * MOOD Reputation API
 * Version: v0.1.0
 * 
 * REST API for reputation management.
 */

const express = require('express');
const router = express.Router();

const reputationService = require('./reputation-service');

// Valid contribution types
const VALID_TYPES = ['protocol', 'code', 'research', 'infrastructure', 'documentation', 'community'];

// Valid proof qualities
const VALID_QUALITIES = ['core_verification', 'manual_review', 'github_commit', 'auto_verification', 'self_claimed'];

/**
 * GET /api/reputation/:address
 * Get reputation for a contributor
 */
router.get('/:address', (req, res) => {
  const { address } = req.params;

  const reputation = reputationService.getReputation(address);

  if (!reputation) {
    return res.status(404).json({
      error: 'Reputation not found',
      address,
      score: 0,
      level: 'Genesis'
    });
  }

  res.json(reputation);
});

/**
 * POST /api/reputation/update
 * Update reputation based on a contribution
 */
router.post('/update', (req, res) => {
  const { contributor, contribution_type, proof_quality, proof_status } = req.body;

  // Validate input
  if (!contributor) {
    return res.status(400).json({ error: 'contributor is required' });
  }

  if (!contribution_type || !VALID_TYPES.includes(contribution_type)) {
    return res.status(400).json({
      error: 'Invalid contribution_type',
      valid_types: VALID_TYPES
    });
  }

  if (proof_quality && !VALID_QUALITIES.includes(proof_quality)) {
    return res.status(400).json({
      error: 'Invalid proof_quality',
      valid_qualities: VALID_QUALITIES
    });
  }

  const result = reputationService.update(contributor, {
    contribution_type,
    proof_quality: proof_quality || 'auto_verification',
    proof_status: proof_status || 'verified'
  });

  res.json({
    address: contributor,
    score: result.total_score,
    level: result.level,
    delta: result.history.length > 0 ? result.history[result.history.length - 1].delta : 0
  });
});

/**
 * GET /api/reputation/leaderboard
 * Get top contributors
 */
router.get('/leaderboard/:limit?', (req, res) => {
  const limit = parseInt(req.params.limit) || 10;
  
  const leaderboard = reputationService.getLeaderboard(limit);

  res.json({
    leaderboard: leaderboard.map(r => ({
      address: r.contributor,
      score: r.total_score,
      level: r.level,
      contributions: r.contributions
    }))
  });
});

/**
 * GET /api/reputation/level/:level
 * Get top contributors by level
 */
router.get('/level/:level', (req, res) => {
  const { level } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  const validLevels = ['Genesis', 'Builder', 'Core Contributor', 'Guardian'];
  
  if (!validLevels.includes(level)) {
    return res.status(400).json({
      error: 'Invalid level',
      valid_levels: validLevels
    });
  }

  const contributors = reputationService.getTopByLevel(level, limit);

  res.json({
    level,
    contributors: contributors.map(r => ({
      address: r.contributor,
      score: r.total_score,
      contributions: r.contributions
    }))
  });
});

/**
 * GET /api/reputation/:address/history
 * Get contribution history for a contributor
 */
router.get('/:address/history', (req, res) => {
  const { address } = req.params;

  const reputation = reputationService.getReputation(address);

  if (!reputation) {
    return res.status(404).json({ error: 'Reputation not found' });
  }

  res.json({
    history: reputation.history,
    breakdown: reputation.breakdown
  });
});

module.exports = router;
