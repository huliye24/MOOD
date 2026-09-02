/**
 * MOOD Contribution Registry Tests
 * Version: v0.1.0
 * 
 * Test suite for the contribution registry functionality.
 */

const ContributionService = require('../../backend/services/contribution');

describe('Contribution Registry v0.1', () => {
  let service;

  beforeEach(() => {
    service = new ContributionService();
  });

  describe('Test 001: Create Contribution', () => {
    test('should create a contribution and return ID', () => {
      const input = {
        type: 'code',
        title: 'Test Contribution',
        description: 'Testing contribution creation',
        evidence: ['commit_123']
      };

      const result = service.createContribution(input);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^contribution_/);
      expect(result.type).toBe('code');
      expect(result.title).toBe('Test Contribution');
      expect(result.status).toBe('created');
      expect(result.contributor).toBe('anonymous');
    });

    test('should generate unique IDs', () => {
      const input = { type: 'code', title: 'Test' };
      
      const id1 = service.createContribution(input).id;
      const id2 = service.createContribution(input).id;

      expect(id1).not.toBe(id2);
    });

    test('should set timestamp', () => {
      const input = { type: 'code', title: 'Test' };
      const before = new Date().toISOString();
      
      const result = service.createContribution(input);
      
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime()
      );
    });
  });

  describe('Test 002: Query Contribution', () => {
    test('should retrieve contribution by ID', () => {
      const input = {
        type: 'code',
        title: 'Create Registry API',
        description: 'Built contribution registry'
      };

      const created = service.createContribution(input);
      const retrieved = service.getContribution(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.title).toBe('Create Registry API');
      expect(retrieved.description).toBe('Built contribution registry');
    });

    test('should return null for non-existent contribution', () => {
      const result = service.getContribution('non_existent_id');
      expect(result).toBeNull();
    });

    test('should return full contribution object', () => {
      const input = {
        type: 'research',
        title: 'Protocol Analysis',
        description: 'Analysis of consensus mechanism',
        evidence: ['paper_url']
      };

      const created = service.createContribution(input);
      const retrieved = service.getContribution(created.id);

      expect(retrieved).toEqual(expect.objectContaining({
        id: expect.any(String),
        type: 'research',
        title: 'Protocol Analysis',
        description: 'Analysis of consensus mechanism',
        evidence: ['paper_url'],
        status: 'created',
        timestamp: expect.any(String)
      }));
    });
  });

  describe('Test 003: Query Contributor', () => {
    test('should track contribution count', () => {
      const contributor = 'test_contributor';
      
      // Create multiple contributions
      service.createContribution({ 
        type: 'code', 
        title: 'First', 
        contributor 
      });
      service.createContribution({ 
        type: 'code', 
        title: 'Second', 
        contributor 
      });
      service.createContribution({ 
        type: 'code', 
        title: 'Third', 
        contributor 
      });

      const profile = service.getContributor(contributor);
      
      expect(profile).toBeDefined();
      expect(profile.total_contributions).toBe(3);
    });

    test('should calculate reputation score', () => {
      const contributor = 'test_contributor';
      
      service.createContribution({ 
        type: 'documentation', 
        title: 'Docs', 
        contributor 
      });
      service.createContribution({ 
        type: 'documentation', 
        title: 'More Docs', 
        contributor 
      });

      const profile = service.getContributor(contributor);
      
      expect(profile.reputation_score).toBe(20); // 2 contributions * 10
    });

    test('should return contributions by contributor', () => {
      const contributor = 'test_contributor';
      
      service.createContribution({ 
        type: 'code', 
        title: 'Code 1', 
        contributor 
      });
      service.createContribution({ 
        type: 'code', 
        title: 'Code 2', 
        contributor 
      });
      service.createContribution({ 
        type: 'code', 
        title: 'Other', 
        contributor: 'other' 
      });

      const contributions = service.getContributionsByContributor(contributor);
      
      expect(contributions.length).toBe(2);
      expect(contributions.every(c => c.contributor === contributor)).toBe(true);
    });
  });

  describe('Status Updates', () => {
    test('should update contribution status', () => {
      const contribution = service.createContribution({ 
        type: 'code', 
        title: 'Test' 
      });

      const updated = service.updateStatus(contribution.id, 'pending');
      
      expect(updated.status).toBe('pending');
    });

    test('should transition to verified', () => {
      const contribution = service.createContribution({ 
        type: 'code', 
        title: 'Test' 
      });

      service.updateStatus(contribution.id, 'pending');
      const verified = service.updateStatus(contribution.id, 'verified');
      
      expect(verified.status).toBe('verified');
    });

    test('should reject invalid status', () => {
      const contribution = service.createContribution({ 
        type: 'code', 
        title: 'Test' 
      });

      expect(() => {
        service.updateStatus(contribution.id, 'invalid_status');
      }).toThrow('Invalid status');
    });
  });

  describe('Listing', () => {
    test('should list all contributions', () => {
      service.createContribution({ type: 'code', title: 'C1' });
      service.createContribution({ type: 'research', title: 'R1' });
      service.createContribution({ type: 'docs', title: 'D1' });

      const result = service.listContributions();
      
      expect(result.total).toBe(3);
      expect(result.contributions.length).toBe(3);
    });

    test('should filter by type', () => {
      service.createContribution({ type: 'code', title: 'C1' });
      service.createContribution({ type: 'code', title: 'C2' });
      service.createContribution({ type: 'research', title: 'R1' });

      const result = service.listContributions({ type: 'code' });
      
      expect(result.total).toBe(2);
      expect(result.contributions.every(c => c.type === 'code')).toBe(true);
    });

    test('should filter by status', () => {
      const c1 = service.createContribution({ type: 'code', title: 'C1' });
      service.createContribution({ type: 'code', title: 'C2' });
      service.updateStatus(c1.id, 'verified');

      const result = service.listContributions({ status: 'verified' });
      
      expect(result.total).toBe(1);
      expect(result.contributions[0].status).toBe('verified');
    });

    test('should paginate results', () => {
      for (let i = 0; i < 10; i++) {
        service.createContribution({ type: 'code', title: `C${i}` });
      }

      const page1 = service.listContributions({ limit: 3, offset: 0 });
      const page2 = service.listContributions({ limit: 3, offset: 3 });

      expect(page1.total).toBe(10);
      expect(page1.contributions.length).toBe(3);
      expect(page2.contributions.length).toBe(3);
    });
  });

  describe('Contribution Types', () => {
    const types = ['code', 'research', 'documentation', 'community', 'infrastructure'];

    types.forEach(type => {
      test(`should accept type: ${type}`, () => {
        const result = service.createContribution({ 
          type, 
          title: 'Test' 
        });
        expect(result.type).toBe(type);
      });
    });
  });
});
