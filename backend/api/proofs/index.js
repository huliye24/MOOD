/**
 * MOOD Proofs API
 * Version: v0.1.0
 * 
 * REST API for proof management.
 */

const express = require('express');
const router = express.Router();

// Import proof generator
const proofGenerator = require('../../../proof-engine/generator/proof-generator');

// In-memory storage for v0.1
const proofs = new Map();

// Valid verification methods
const VALID_METHODS = ['github_commit', 'file_hash', 'timestamp', 'manual'];

/**
 * POST /api/proofs
 * Create a new proof from evidence
 */
router.post('/', async (req, res) => {
  try {
    const { contribution_id, contributor, evidence, metadata } = req.body;

    // Validate input
    if (!contribution_id) {
      return res.status(400).json({ 
        error: 'contribution_id is required' 
      });
    }

    if (!evidence || !Array.isArray(evidence) || evidence.length === 0) {
      return res.status(400).json({ 
        error: 'evidence array is required' 
      });
    }

    // Validate evidence types
    for (const e of evidence) {
      if (!VALID_METHODS.includes(e.type)) {
        return res.status(400).json({
          error: `Invalid evidence type: ${e.type}`,
          valid_types: VALID_METHODS
        });
      }
    }

    // Generate proof
    const proof = await proofGenerator.generate({
      contribution_id,
      contributor: contributor || 'anonymous',
      evidence,
      metadata
    });

    // Store proof
    proofs.set(proof.proof_id, proof);

    res.status(201).json({
      proof_id: proof.proof_id,
      status: proof.status,
      verification_method: proof.verification_method
    });
  } catch (error) {
    console.error('Error creating proof:', error);
    res.status(500).json({ error: 'Failed to create proof' });
  }
});

/**
 * GET /api/proofs
 * List all proofs with optional filters
 */
router.get('/', (req, res) => {
  const { contribution_id, status, limit = 100, offset = 0 } = req.query;

  let result = Array.from(proofs.values());

  // Apply filters
  if (contribution_id) {
    result = result.filter(p => p.contribution_id === contribution_id);
  }
  if (status) {
    result = result.filter(p => p.status === status);
  }

  // Sort by timestamp descending
  result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Pagination
  const total = result.length;
  result = result.slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    proofs: result,
    pagination: {
      total,
      limit: Number(limit),
      offset: Number(offset)
    }
  });
});

/**
 * GET /api/proofs/:id
 * Get a specific proof by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const proof = proofs.get(id);

  if (!proof) {
    // Also check in proof generator
    const generatorProof = proofGenerator.getProof(id);
    if (generatorProof) {
      return res.json(generatorProof);
    }
    return res.status(404).json({ error: 'Proof not found' });
  }

  res.json(proof);
});

/**
 * PATCH /api/proofs/:id/status
 * Update proof status
 */
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'verified', 'rejected', 'expired'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      valid_statuses: validStatuses
    });
  }

  // Check in proofs map
  if (proofs.has(id)) {
    const proof = proofs.get(id);
    proof.status = status;
    proofs.set(id, proof);
    return res.json(proof);
  }

  // Check in generator
  const proof = proofGenerator.updateStatus(id, status);
  if (!proof) {
    return res.status(404).json({ error: 'Proof not found' });
  }

  res.json(proof);
});

module.exports = router;
