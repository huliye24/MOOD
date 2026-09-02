/**
 * MOOD Genesis Validation Tests
 * Version: v0.1.0
 *
 * Validates the integrity and structure of the MOOD genesis state.
 * Tests verify the complete chain: contribution → proof → reputation.
 */

const fs = require('fs');
const path = require('path');

const GENESIS_DIR = path.join(__dirname, '..', 'genesis');

function loadJson(filename) {
  const content = fs.readFileSync(path.join(GENESIS_DIR, filename), 'utf8');
  return JSON.parse(content);
}

describe('MOOD Genesis State', () => {
  // Test 001: All genesis JSON files are valid
  describe('Test 001: Genesis JSON files are valid', () => {
    test('genesis.json is valid JSON', () => {
      const data = loadJson('genesis.json');
      expect(data).toBeDefined();
      expect(data.network).toBe('MOOD');
      expect(data.version).toBe('0.1.0');
    });

    test('contributors.json is valid JSON', () => {
      const data = loadJson('contributors.json');
      expect(data).toBeDefined();
      expect(Array.isArray(data.contributors)).toBe(true);
    });

    test('contributions.json is valid JSON', () => {
      const data = loadJson('contributions.json');
      expect(data).toBeDefined();
      expect(Array.isArray(data.contributions)).toBe(true);
    });

    test('genesis-proofs.json is valid JSON', () => {
      const data = loadJson('genesis-proofs.json');
      expect(data).toBeDefined();
      expect(Array.isArray(data.proofs)).toBe(true);
    });

    test('genesis-reputation.json is valid JSON', () => {
      const data = loadJson('genesis-reputation.json');
      expect(data).toBeDefined();
      expect(Array.isArray(data.reputations)).toBe(true);
    });

    test('genesis-hash.txt exists and contains SHA256', () => {
      const hashContent = fs.readFileSync(path.join(GENESIS_DIR, 'genesis-hash.txt'), 'utf8');
      expect(hashContent).toContain('SHA256:');
      expect(hashContent).toMatch(/SHA256:\s*([a-f0-9]{64})/);
    });
  });

  // Test 002: Genesis contributor exists
  describe('Test 002: Genesis contributor exists', () => {
    test('at least one genesis contributor exists', () => {
      const data = loadJson('contributors.json');
      expect(data.contributors.length).toBeGreaterThan(0);
    });

    test('genesis contributor has required fields', () => {
      const data = loadJson('contributors.json');
      const contributor = data.contributors[0];

      expect(contributor.id).toBeDefined();
      expect(typeof contributor.id).toBe('string');
      expect(contributor.name).toBeDefined();
      expect(contributor.type).toBeDefined();
      expect(contributor.contribution).toBeDefined();
    });

    test('genesis contributor ID is genesis_001', () => {
      const data = loadJson('contributors.json');
      expect(data.contributors[0].id).toBe('genesis_001');
    });
  });

  // Test 003: Contribution has corresponding proof
  describe('Test 003: Contribution has corresponding proof', () => {
    test('all contributions have proof_ids', () => {
      const contributions = loadJson('contributions.json');
      contributions.contributions.forEach(c => {
        expect(c.proof_ids).toBeDefined();
        expect(Array.isArray(c.proof_ids)).toBe(true);
        expect(c.proof_ids.length).toBeGreaterThan(0);
      });
    });

    test('all contribution proof_ids reference existing proofs', () => {
      const contributions = loadJson('contributions.json');
      const proofs = loadJson('genesis-proofs.json');

      const proofIds = new Set(proofs.proofs.map(p => p.id));

      contributions.contributions.forEach(c => {
        c.proof_ids.forEach(pid => {
          expect(proofIds.has(pid)).toBe(true);
        });
      });
    });

    test('all proofs are verified', () => {
      const proofs = loadJson('genesis-proofs.json');
      proofs.proofs.forEach(p => {
        expect(p.status).toBe('verified');
      });
    });

    test('proofs reference their contributions', () => {
      const contributions = loadJson('contributions.json');
      const proofs = loadJson('genesis-proofs.json');

      // Each contribution should have at least one matching proof
      contributions.contributions.forEach(c => {
        const matchingProofs = proofs.proofs.filter(
          p => p.contribution === c.title || p.contribution === c.id
        );
        expect(matchingProofs.length).toBeGreaterThan(0);
      });
    });
  });

  // Test 004: Proof has reputation
  describe('Test 004: Proof has reputation', () => {
    test('reputation records exist for all contributors', () => {
      const contributors = loadJson('contributors.json');
      const reputations = loadJson('genesis-reputation.json');

      const contributorIds = new Set(contributors.contributors.map(c => c.id));
      const reputationContributors = new Set(reputations.reputations.map(r => r.contributor));

      contributorIds.forEach(cid => {
        expect(reputationContributors.has(cid)).toBe(true);
      });
    });

    test('all reputations are verified', () => {
      const reputations = loadJson('genesis-reputation.json');
      reputations.reputations.forEach(r => {
        expect(r.level).toBeDefined();
        expect(r.score).toBeGreaterThan(0);
        expect(r.reason).toBeDefined();
      });
    });

    test('genesis contributor has Genesis level', () => {
      const reputations = loadJson('genesis-reputation.json');
      const genesisRep = reputations.reputations.find(
        r => r.contributor === 'genesis_001' || r.contributor === 'genesis_founder'
      );

      expect(genesisRep).toBeDefined();
      expect(['Genesis', 'genesis']).toContain(genesisRep.level);
    });

    test('reputation score matches contribution weight', () => {
      const contributions = loadJson('contributions.json');
      const reputations = loadJson('genesis-reputation.json');

      // Protocol contribution with core verification should produce score of 10
      const protocolContrib = contributions.contributions.find(
        c => c.type === 'protocol'
      );
      expect(protocolContrib).toBeDefined();

      const genRep = reputations.reputations.find(
        r => r.contribution_type === 'protocol' || r.level === 'Genesis'
      );
      expect(genRep).toBeDefined();
      expect(genRep.score).toBeGreaterThanOrEqual(10);
    });
  });

  // Test 005: Complete chain verification
  describe('Test 005: Complete chain (Contribution → Proof → Reputation)', () => {
    test('complete chain exists for genesis_001', () => {
      const contributors = loadJson('contributors.json');
      const contributions = loadJson('contributions.json');
      const proofs = loadJson('genesis-proofs.json');
      const reputations = loadJson('genesis-reputation.json');

      // 1. Contributor exists
      const contributor = contributors.contributors.find(c => c.id === 'genesis_001');
      expect(contributor).toBeDefined();

      // 2. Contribution exists for contributor
      const contribution = contributions.contributions.find(
        c => c.contributor_id === 'genesis_001' || c.contributor_id === contributor.name
      );
      expect(contribution).toBeDefined();
      expect(contribution.status).toBe('verified');

      // 3. Proof exists for contribution
      const proof = proofs.proofs.find(
        p => p.contribution === contribution.title || p.contribution === contribution.id
      );
      expect(proof).toBeDefined();
      expect(proof.status).toBe('verified');

      // 4. Reputation exists for contributor
      const reputation = reputations.reputations.find(
        r => r.contributor === 'genesis_001' || r.contributor === contributor.name
      );
      expect(reputation).toBeDefined();
      expect(reputation.score).toBeGreaterThan(0);
      expect(['Genesis', 'genesis']).toContain(reputation.level);
    });

    test('genesis state hash is valid', () => {
      const { verify } = require('../genesis/scripts/verify-genesis');
      expect(verify()).toBe(true);
    });
  });
});
