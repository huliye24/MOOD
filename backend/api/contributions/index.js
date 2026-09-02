/**
 * MOOD Contribution Registry API
 * Version: v0.1.0
 */

const express = require('express');
const router = express.Router();

// In-memory storage for v0.1 (will be replaced with database)
const contributions = new Map();
const contributors = new Map();

// Contribution types
const VALID_TYPES = ['code', 'research', 'documentation', 'community', 'infrastructure'];

// Contribution statuses
const VALID_STATUSES = ['created', 'pending', 'verified', 'recorded', 'rewarded'];

/**
 * Generate unique ID
 */
function generateId(prefix = 'contribution') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate contribution input
 */
function validateContribution(data) {
  const errors = [];
  
  if (!data.type || !VALID_TYPES.includes(data.type)) {
    errors.push(`type must be one of: ${VALID_TYPES.join(', ')}`);
  }
  
  if (!data.title || data.title.length > 200) {
    errors.push('title is required and must be under 200 characters');
  }
  
  if (data.description && data.description.length > 2000) {
    errors.push('description must be under 2000 characters');
  }
  
  return errors;
}

/**
 * POST /api/contributions
 * Create a new contribution
 */
router.post('/', (req, res) => {
  const { type, title, description, evidence, contributor } = req.body;
  
  // Validate input
  const errors = validateContribution(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  
  // Generate ID
  const id = generateId('contribution');
  
  // Create contribution object
  const contribution = {
    id,
    contributor: contributor || 'anonymous',
    type,
    title,
    description: description || '',
    evidence: evidence || [],
    status: 'created',
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Store contribution
  contributions.set(id, contribution);
  
  // Update contributor stats
  updateContributorStats(contribution.contributor);
  
  res.status(201).json({
    id: contribution.id,
    status: contribution.status
  });
});

/**
 * GET /api/contributions
 * List all contributions with optional filters
 */
router.get('/', (req, res) => {
  const { type, status, limit = 100, offset = 0 } = req.query;
  
  let result = Array.from(contributions.values());
  
  // Apply filters
  if (type) {
    result = result.filter(c => c.type === type);
  }
  if (status) {
    result = result.filter(c => c.status === status);
  }
  
  // Sort by timestamp descending
  result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Apply pagination
  const total = result.length;
  result = result.slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({
    contributions: result,
    pagination: {
      total,
      limit: Number(limit),
      offset: Number(offset)
    }
  });
});

/**
 * GET /api/contributions/:id
 * Get a specific contribution by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const contribution = contributions.get(id);
  
  if (!contribution) {
    return res.status(404).json({ error: 'Contribution not found' });
  }
  
  res.json(contribution);
});

/**
 * PATCH /api/contributions/:id/status
 * Update contribution status
 */
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      valid_statuses: VALID_STATUSES 
    });
  }
  
  const contribution = contributions.get(id);
  
  if (!contribution) {
    return res.status(404).json({ error: 'Contribution not found' });
  }
  
  contribution.status = status;
  contribution.updated_at = new Date().toISOString();
  
  res.json(contribution);
});

/**
 * Update contributor statistics
 */
function updateContributorStats(contributorId) {
  if (!contributors.has(contributorId)) {
    contributors.set(contributorId, {
      id: contributorId,
      wallet_address: contributorId,
      name: 'Anonymous',
      total_contributions: 0,
      reputation_score: 0,
      created_at: new Date().toISOString()
    });
  }
  
  const contributor = contributors.get(contributorId);
  contributor.total_contributions = Array.from(contributions.values())
    .filter(c => c.contributor === contributorId).length;
  contributor.reputation_score = contributor.total_contributions * 10;
  contributor.updated_at = new Date().toISOString();
}

module.exports = router;
