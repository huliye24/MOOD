/**
 * MOOD Protocol Adapter Module
 *
 * Bridges the existing MOOD Protocol modules (contribution, node-registry, reputation)
 * with the node runtime.
 *
 * @module protocol-adapter
 */

import { ContributionService, ContributionStatus } from '@moodify/protocol-contribution';

/**
 * Protocol Adapter
 * Provides unified interface to MOOD Protocol
 */
export class ProtocolAdapter {
  /**
   * @param {object} options
   * @param {string} [options.dataDir] - Data directory
   * @param {string} [options.networkId] - Network ID
   */
  constructor(options = {}) {
    this.dataDir = options.dataDir || './data/node';
    this.networkId = options.networkId || 'mood-testnet-001';
    this.contributionService = null;
    this.initialized = false;
  }

  /**
   * Initialize the protocol adapter
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    // Initialize contribution service
    // Note: In production, this would use proper storage adapter
    this.contributionService = new ContributionService();

    this.initialized = true;
  }

  /**
   * Create a contribution
   * @param {object} options - Contribution options
   * @returns {object} Creation result
   */
  createContribution(options) {
    if (!this.initialized) {
      throw new Error('Protocol adapter not initialized');
    }

    const raw = {
      schemaVersion: '1.0.0',
      contributor: {
        type: options.contributorType || 'protocol-id',
        id: options.contributorId
      },
      category: options.category || 'infrastructure',
      title: options.title,
      description: options.description || '',
      evidence: options.evidence || [],
      policyVersion: '002-draft-1',
      status: 'submitted'
    };

    const { contribution, errors } = this.contributionService.create(raw);

    return {
      contribution,
      errors,
      success: errors.length === 0
    };
  }

  /**
   * Get contribution by ID
   * @param {string} contributionId - Contribution ID
   * @returns {object|null} Contribution or null
   */
  getContribution(contributionId) {
    if (!this.initialized) {
      return null;
    }
    return this.contributionService._get(contributionId);
  }

  /**
   * List all contributions
   * @returns {Array} Contributions
   */
  listContributions() {
    if (!this.initialized || !this.contributionService.repository) {
      return [];
    }
    return this.contributionService.repository.listIds()
      .map(id => this.contributionService._get(id))
      .filter(c => c !== null);
  }

  /**
   * Submit contribution for review
   * @param {string} contributionId - Contribution ID
   * @returns {object} Result
   */
  submitContribution(contributionId) {
    return this.contributionService.submit(contributionId);
  }

  /**
   * Begin review of contribution
   * @param {string} contributionId - Contribution ID
   * @param {string} reviewerId - Reviewer ID
   * @returns {object} Result
   */
  beginReview(contributionId, reviewerId) {
    return this.contributionService.beginReview(contributionId, reviewerId);
  }

  /**
   * Verify contribution
   * @param {string} contributionId - Contribution ID
   * @param {string} reviewerId - Reviewer ID
   * @param {string} [notes] - Review notes
   * @returns {object} Result
   */
  verifyContribution(contributionId, reviewerId, notes = null) {
    return this.contributionService.verify(contributionId, reviewerId, notes);
  }

  /**
   * Score contribution
   * @param {string} contributionId - Contribution ID
   * @param {object} dimensionScores - Dimension scores
   * @returns {object} Result
   */
  scoreContribution(contributionId, dimensionScores) {
    return this.contributionService.score(contributionId, dimensionScores);
  }

  /**
   * Finalize contribution
   * @param {string} contributionId - Contribution ID
   * @returns {object} Result
   */
  finalizeContribution(contributionId) {
    return this.contributionService.finalize(contributionId);
  }

  /**
   * Get protocol status
   * @returns {object} Status
   */
  getStatus() {
    const contributions = this.listContributions();

    const statusCounts = {};
    for (const status of Object.values(ContributionStatus)) {
      statusCounts[status] = 0;
    }

    for (const contrib of contributions) {
      if (contrib && contrib.status) {
        statusCounts[contrib.status] = (statusCounts[contrib.status] || 0) + 1;
      }
    }

    return {
      initialized: this.initialized,
      networkId: this.networkId,
      totalContributions: contributions.length,
      contributionsByStatus: statusCounts,
      protocolVersion: '0.2.0'
    };
  }
}

export default {
  ProtocolAdapter
};
