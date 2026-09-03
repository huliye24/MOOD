/**
 * MOOD Organization Module
 *
 * Manages organizational identity and member enrollment.
 * Organizations provide the context for member identity.
 *
 * @module organization
 */

import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from '../internal/nacl-util.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { sign, verify } from '../identity/index.js';

// Constants
const ORG_ID_PREFIX = 'mood:org:';
const MEMBER_ENROLLMENT_PREFIX = 'mood:enrollment:';
const INVITATION_VERSION = '1';

/**
 * Organization Roles
 */
export const MEMBER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  OBSERVER: 'observer'
};

/**
 * Organization Status
 */
export const ORG_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REVOKED: 'revoked'
};

/**
 * Generate organization ID from name and domain
 * @param {string} name - Organization name
 * @param {string} domain - Organization domain
 * @returns {string} Deterministic organization ID
 */
export function generateOrganizationId(name, domain) {
  if (!name || !domain) {
    throw new Error('name and domain are required');
  }

  const input = [ORG_ID_PREFIX, name.toLowerCase().trim(), domain.toLowerCase().trim()].join('|');
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return `${ORG_ID_PREFIX}${hash}`;
}

/**
 * Generate organization admin keypair
 * @returns {object} Keypair
 */
export function generateOrganizationKeypair() {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: encodeBase64(keypair.publicKey),
    secretKey: encodeBase64(keypair.secretKey),
    createdAt: new Date().toISOString()
  };
}

/**
 * Create organization record
 * @param {object} options - Organization options
 * @returns {object} Organization record
 */
export function createOrganization(options) {
  const {
    name,
    domain,
    adminPublicKey,
    networkId
  } = options;

  if (!name || !domain) {
    throw new Error('name and domain are required');
  }

  const orgId = generateOrganizationId(name, domain);
  const adminKeypair = adminPublicKey ? null : generateOrganizationKeypair();

  return {
    orgVersion: '1.0.0',
    orgId,
    name: name.trim(),
    domain: domain.toLowerCase().trim(),
    adminPublicKey: adminPublicKey || adminKeypair.publicKey,
    adminSecretKey: adminSecretKey || adminKeypair?.secretKey || null,
    networkId: networkId || 'mood-testnet-001',
    status: ORG_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 0,
    enrolledMembers: []
  };
}

/**
 * Validate organization domain format
 * @param {string} domain - Domain to validate
 * @returns {boolean} Whether valid
 */
export function isValidDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return false;
  }
  // Basic domain validation
  const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;
  return pattern.test(domain.toLowerCase());
}

/**
 * Validate email domain matches organization
 * @param {string} email - Email address
 * @param {string} domain - Organization domain
 * @returns {boolean} Whether email belongs to domain
 */
export function validateEmailDomain(email, domain) {
  if (!email || !domain) {
    return false;
  }

  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (!emailDomain) {
    return false;
  }

  return emailDomain === domain.toLowerCase();
}

/**
 * Organization Manager
 * Handles organization lifecycle and member management
 */
export class OrganizationManager {
  /**
   * @param {object} options
   * @param {string} [options.dataDir] - Directory for storing data
   */
  constructor(options = {}) {
    this.dataDir = options.dataDir || './data/organization';
    this.organization = null;
    this.adminSecretKey = null;
  }

  /**
   * Create a new organization
   * @param {object} options - Organization options
   * @returns {object} Organization record
   */
  create(options) {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }

    if (!isValidDomain(options.domain)) {
      throw new Error('Invalid organization domain');
    }

    const keypair = generateOrganizationKeypair();
    this.adminSecretKey = keypair.secretKey;

    this.organization = {
      ...createOrganization({
        ...options,
        adminPublicKey: keypair.publicKey
      }),
      adminSecretKey: keypair.secretKey
    };

    this.save();
    return this.getPublicRecord();
  }

  /**
   * Load existing organization
   * @returns {object} Organization record
   */
  load() {
    const orgPath = join(this.dataDir, 'organization.json');
    if (!existsSync(orgPath)) {
      throw new Error('No existing organization found');
    }

    const data = JSON.parse(readFileSync(orgPath, 'utf8'));
    this.organization = data;
    this.adminSecretKey = data.adminSecretKey;

    return this.getPublicRecord();
  }

  /**
   * Save organization to disk
   */
  save() {
    if (!this.organization) {
      throw new Error('No organization to save');
    }

    this.organization.updatedAt = new Date().toISOString();

    const orgPath = join(this.dataDir, 'organization.json');
    writeFileSync(orgPath, JSON.stringify(this.organization, null, 2));
  }

  /**
   * Get public organization record (safe to share)
   * @returns {object} Public organization data
   */
  getPublicRecord() {
    if (!this.organization) {
      return null;
    }

    const { adminSecretKey, ...publicRecord } = this.organization;
    return publicRecord;
  }

  /**
   * Activate organization
   */
  activate() {
    if (!this.organization) {
      throw new Error('No organization loaded');
    }
    this.organization.status = ORG_STATUS.ACTIVE;
    this.save();
  }

  /**
   * Add enrolled member to organization
   * @param {object} memberData - Member enrollment data
   */
  addMember(memberData) {
    if (!this.organization) {
      throw new Error('No organization loaded');
    }

    const enrollment = {
      enrollmentId: `${MEMBER_ENROLLMENT_PREFIX}${crypto.randomBytes(16).toString('hex')}`,
      memberSubjectId: memberData.memberSubjectId,
      publicKey: memberData.publicKey,
      email: memberData.email, // Hashed for storage
      emailHash: crypto.createHash('sha256').update(memberData.email.toLowerCase()).digest('hex'),
      role: memberData.role || MEMBER_ROLES.MEMBER,
      credentialDigest: memberData.credentialDigest,
      enrolledAt: new Date().toISOString(),
      validity: 'valid',
      revocationStatus: null
    };

    this.organization.enrolledMembers.push(enrollment);
    this.organization.memberCount = this.organization.enrolledMembers.length;
    this.save();

    return enrollment;
  }

  /**
   * Get member by subject ID
   * @param {string} memberSubjectId - Member subject ID
   * @returns {object|null} Member data
   */
  getMember(memberSubjectId) {
    if (!this.organization) {
      return null;
    }

    return this.organization.enrolledMembers.find(m => m.memberSubjectId === memberSubjectId) || null;
  }

  /**
   * Get all enrolled members (public data only)
   * @returns {Array} Public member records
   */
  getMembers() {
    if (!this.organization) {
      return [];
    }

    return this.organization.enrolledMembers.map(m => ({
      memberSubjectId: m.memberSubjectId,
      role: m.role,
      enrolledAt: m.enrolledAt,
      validity: m.validity,
      revocationStatus: m.revocationStatus
    }));
  }

  /**
   * Revoke member enrollment
   * @param {string} memberSubjectId - Member to revoke
   * @param {string} reason - Revocation reason
   */
  revokeMember(memberSubjectId, reason) {
    if (!this.organization) {
      throw new Error('No organization loaded');
    }

    const member = this.getMember(memberSubjectId);
    if (!member) {
      throw new Error('Member not found');
    }

    member.validity = 'revoked';
    member.revocationStatus = {
      revokedAt: new Date().toISOString(),
      reason
    };

    this.save();
  }

  /**
   * Delete organization and all local data
   * @returns {boolean} Success
   */
  delete() {
    try {
      const orgPath = join(this.dataDir, 'organization.json');
      if (existsSync(orgPath)) {
        const fs = require('fs');
        fs.unlinkSync(orgPath);
      }
      this.organization = null;
      this.adminSecretKey = null;
      return true;
    } catch (e) {
      return false;
    }
  }
}

export default {
  MEMBER_ROLES,
  ORG_STATUS,
  generateOrganizationId,
  generateOrganizationKeypair,
  createOrganization,
  isValidDomain,
  validateEmailDomain,
  OrganizationManager
};
