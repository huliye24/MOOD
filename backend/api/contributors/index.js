/**
 * MOOD Contributors API
 * Version: v0.1.0
 */

const express = require('express');
const router = express.Router();

// In-memory storage for v0.1 (will be replaced with database)
const contributors = new Map();
const contributions = new Map();

/**
 * GET /api/contributors/:address
 * Get contributor profile and contribution history
 */
router.get('/:address', (req, res) => {
  const { address } = req.params;
  
  const contributor = contributors.get(address);
  
  if (!contributor) {
    return res.status(404).json({ error: 'Contributor not found' });
  }
  
  // Get contribution history
  const contributionHistory = Array.from(contributions.values())
    .filter(c => c.contributor === address)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json({
    ...contributor,
    contributions: contributionHistory
  });
});

/**
 * GET /api/contributors
 * List all contributors
 */
router.get('/', (req, res) => {
  const { limit = 100, offset = 0, sort = 'reputation' } = req.query;
  
  let result = Array.from(contributors.values());
  
  // Sort
  if (sort === 'reputation') {
    result.sort((a, b) => b.reputation_score - a.reputation_score);
  } else if (sort === 'contributions') {
    result.sort((a, b) => b.total_contributions - a.total_contributions);
  }
  
  // Pagination
  const total = result.length;
  result = result.slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({
    contributors: result,
    pagination: {
      total,
      limit: Number(limit),
      offset: Number(offset)
    }
  });
});

/**
 * Initialize contributor (internal use)
 */
function initContributor(address, name = 'Anonymous') {
  if (!contributors.has(address)) {
    contributors.set(address, {
      id: address,
      wallet_address: address,
      name,
      total_contributions: 0,
      reputation_score: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  return contributors.get(address);
}

// Export for use by contributions API
module.exports = router;
module.exports.initContributor = initContributor;
module.exports.contributors = contributors;
module.exports.contributions = contributions;
