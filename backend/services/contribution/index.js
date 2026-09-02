/**
 * MOOD Contribution Service
 * Version: v0.1.0
 * 
 * Business logic for contribution management.
 */

class ContributionService {
  constructor() {
    this.contributions = new Map();
    this.contributors = new Map();
  }

  /**
   * Create a new contribution
   */
  createContribution(data) {
    const { type, title, description, evidence, contributor } = data;
    
    const id = this.generateId('contribution');
    const timestamp = new Date().toISOString();
    
    const contribution = {
      id,
      contributor: contributor || 'anonymous',
      type,
      title,
      description: description || '',
      evidence: evidence || [],
      status: 'created',
      timestamp,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    this.contributions.set(id, contribution);
    this.updateContributorStats(contributor || 'anonymous');
    
    return contribution;
  }

  /**
   * Get contribution by ID
   */
  getContribution(id) {
    return this.contributions.get(id) || null;
  }

  /**
   * List contributions with filters
   */
  listContributions(filters = {}) {
    const { type, status, limit = 100, offset = 0 } = filters;
    
    let result = Array.from(this.contributions.values());
    
    if (type) {
      result = result.filter(c => c.type === type);
    }
    if (status) {
      result = result.filter(c => c.status === status);
    }
    
    result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const total = result.length;
    result = result.slice(offset, offset + limit);
    
    return { contributions: result, total, limit, offset };
  }

  /**
   * Update contribution status
   */
  updateStatus(id, newStatus) {
    const contribution = this.contributions.get(id);
    
    if (!contribution) {
      throw new Error('Contribution not found');
    }
    
    const validStatuses = ['created', 'pending', 'verified', 'recorded', 'rewarded'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    contribution.status = newStatus;
    contribution.updated_at = new Date().toISOString();
    
    return contribution;
  }

  /**
   * Get contributions by contributor
   */
  getContributionsByContributor(contributor) {
    return Array.from(this.contributions.values())
      .filter(c => c.contributor === contributor)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get contributor profile
   */
  getContributor(contributor) {
    return this.contributors.get(contributor) || null;
  }

  /**
   * List all contributors
   */
  listContributors(filters = {}) {
    const { limit = 100, offset = 0, sort = 'reputation' } = filters;
    
    let result = Array.from(this.contributors.values());
    
    if (sort === 'reputation') {
      result.sort((a, b) => b.reputation_score - a.reputation_score);
    } else if (sort === 'contributions') {
      result.sort((a, b) => b.total_contributions - a.total_contributions);
    }
    
    const total = result.length;
    result = result.slice(offset, offset + limit);
    
    return { contributors: result, total, limit, offset };
  }

  /**
   * Update contributor statistics
   */
  updateContributorStats(contributor) {
    if (!this.contributors.has(contributor)) {
      this.contributors.set(contributor, {
        id: contributor,
        wallet_address: contributor,
        name: 'Anonymous',
        total_contributions: 0,
        reputation_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    const contribData = this.contributors.get(contributor);
    const contributions = this.getContributionsByContributor(contributor);
    
    contribData.total_contributions = contributions.length;
    contribData.reputation_score = contributions.length * 10;
    contribData.updated_at = new Date().toISOString();
    
    return contribData;
  }

  /**
   * Generate unique ID
   */
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new ContributionService();
