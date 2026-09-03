/**
 * MOOD Invitation Module
 *
 * Creates and verifies .moodinvite files for member enrollment.
 * Invitations are signed by organization admin and bound to specific email addresses.
 *
 * @module invitation
 */

import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, decodeUTF8 } from '../internal/nacl-util.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Constants
const INVITATION_VERSION = '1.0.0';
const INVITATION_FILE_EXTENSION = '.moodinvite';
const DEFAULT_EXPIRY_HOURS = 72;
const MAX_NONCE_ENTROPY_BYTES = 32;

/**
 * Invitation Status
 */
export const INVITATION_STATUS = {
  VALID: 'valid',
  USED: 'used',
  EXPIRED: 'expired',
  REVOKED: 'revoked'
};

/**
 * Create high-entropy nonce
 * @returns {string} Random nonce (hex encoded)
 */
export function generateNonce() {
  return crypto.randomBytes(MAX_NONCE_ENTROPY_BYTES).toString('hex');
}

/**
 * Create invitation payload
 * @param {object} options - Invitation options
 * @returns {object} Invitation payload
 */
export function createInvitationPayload(options) {
  const {
    organizationId,
    organizationName,
    organizationDomain,
    memberEmail,
    networkId,
    issuedBy,
    adminPublicKey,
    expiresAt
  } = options;

  if (!organizationId || !memberEmail || !networkId || !adminPublicKey) {
    throw new Error('Missing required fields for invitation');
  }

  const issuedAt = new Date().toISOString();
  const expiryTime = expiresAt || new Date(Date.now() + DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
  const nonce = generateNonce();

  return {
    invitationVersion: INVITATION_VERSION,
    invitationId: `inv-${uuidv4()}`,
    organizationId,
    organizationName,
    organizationDomain,
    memberEmail: memberEmail.toLowerCase().trim(),
    emailDomain: memberEmail.split('@')[1]?.toLowerCase(),
    networkId,
    issuedBy,
    adminPublicKey,
    issuedAt,
    expiresAt: expiryTime,
    nonce,
    usedCount: 0,
    maxUses: 1, // One-time use by default
    metadata: {
      clientVersion: '0.1.0-alpha.1',
      protocolVersion: '0.2.0',
      enrollmentType: 'Alpha Enrollment'
    }
  };
}

/**
 * Sign invitation payload with admin key
 * @param {object} payload - Invitation payload
 * @param {string} adminSecretKey - Admin's secret key (base64)
 * @returns {string} Signature (base64)
 */
export function signInvitation(payload, adminSecretKey) {
  if (!payload || !adminSecretKey) {
    throw new Error('payload and adminSecretKey are required');
  }

  // Create canonical representation
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const messageBytes = decodeUTF8(canonical);
  const secretKeyBytes = decodeBase64(adminSecretKey);

  const signature = nacl.sign.detached(messageBytes, secretKeyBytes);
  return encodeBase64(signature);
}

/**
 * Verify invitation signature
 * @param {object} invitation - Full invitation object
 * @returns {object} Verification result
 */
export function verifyInvitationSignature(invitation) {
  if (!invitation || !invitation.payload || !invitation.signature) {
    return { valid: false, error: 'Invalid invitation structure' };
  }

  try {
    const { payload, signature, adminPublicKey } = invitation;
    const canonical = JSON.stringify(payload, Object.keys(payload).sort());
    const messageBytes = decodeUTF8(canonical);
    const signatureBytes = decodeBase64(signature);
    const publicKeyBytes = decodeBase64(adminPublicKey);

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

    return {
      valid: isValid,
      error: isValid ? null : 'Invalid signature'
    };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

/**
 * Check invitation expiry
 * @param {object} invitation - Full invitation object
 * @returns {object} Expiry status
 */
export function checkInvitationExpiry(invitation) {
  if (!invitation || !invitation.payload) {
    return { expired: true, error: 'Invalid invitation' };
  }

  const expiresAt = new Date(invitation.payload.expiresAt);
  const now = new Date();

  if (now > expiresAt) {
    return { expired: true, expiresAt };
  }

  return { expired: false, expiresAt };
}

/**
 * Check if invitation is usable
 * @param {object} invitation - Full invitation object
 * @returns {object} Usability status
 */
export function checkInvitationUsable(invitation) {
  const signatureCheck = verifyInvitationSignature(invitation);
  if (!signatureCheck.valid) {
    return { usable: false, reason: signatureCheck.error };
  }

  const expiryCheck = checkInvitationExpiry(invitation);
  if (expiryCheck.expired) {
    return { usable: false, reason: 'Invitation expired' };
  }

  if (invitation.payload.usedCount >= invitation.payload.maxUses) {
    return { usable: false, reason: 'Invitation already used' };
  }

  return { usable: true };
}

/**
 * Create complete invitation file
 * @param {object} options - Invitation options
 * @param {string} adminSecretKey - Admin's secret key
 * @returns {object} Complete invitation object
 */
export function createInvitation(options, adminSecretKey) {
  const payload = createInvitationPayload(options);
  const signature = signInvitation(payload, adminSecretKey);

  return {
    fileVersion: INVITATION_VERSION,
    payload,
    signature,
    adminPublicKey: options.adminPublicKey,
    createdAt: new Date().toISOString()
  };
}

/**
 * Save invitation to file
 * @param {object} invitation - Full invitation object
 * @param {string} filePath - File path
 */
export function saveInvitationFile(invitation, filePath) {
  const data = JSON.stringify(invitation, null, 2);
  writeFileSync(filePath, data);
}

/**
 * Load invitation from file
 * @param {string} filePath - File path
 * @returns {object} Invitation object
 */
export function loadInvitationFile(filePath) {
  if (!existsSync(filePath)) {
    throw new Error('Invitation file not found');
  }

  const data = readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

/**
 * Validate invitation for member enrollment
 * @param {object} invitation - Full invitation object
 * @param {string} memberEmail - Email provided by member
 * @param {string} memberPublicKey - Member's public key
 * @returns {object} Validation result
 */
export function validateInvitationForEnrollment(invitation, memberEmail, memberPublicKey) {
  if (!invitation || !invitation.payload) {
    return { valid: false, error: 'Invalid invitation structure' };
  }

  const payload = invitation.payload;

  // 1. Verify signature
  const signatureCheck = verifyInvitationSignature(invitation);
  if (!signatureCheck.valid) {
    return { valid: false, error: `Signature verification failed: ${signatureCheck.error}` };
  }

  // 2. Check expiry
  const expiryCheck = checkInvitationExpiry(invitation);
  if (expiryCheck.expired) {
    return { valid: false, error: 'Invitation has expired' };
  }

  // 3. Check if already used
  if (payload.usedCount >= payload.maxUses) {
    return { valid: false, error: 'Invitation has already been used' };
  }

  // 4. Verify email domain matches
  const emailDomain = memberEmail.toLowerCase().split('@')[1];
  if (emailDomain !== payload.emailDomain) {
    return { valid: false, error: 'Email domain does not match invitation' };
  }

  // 5. Verify full email matches (after normalization)
  const normalizedEmail = memberEmail.toLowerCase().trim();
  if (normalizedEmail !== payload.memberEmail) {
    return { valid: false, error: 'Email address does not match invitation' };
  }

  // 6. Verify network ID
  if (!payload.networkId) {
    return { valid: false, error: 'Invalid network configuration' };
  }

  return {
    valid: true,
    credentialDigest: generateCredentialDigest(invitation, memberPublicKey)
  };
}

/**
 * Generate credential digest for enrollment
 * @param {object} invitation - Full invitation object
 * @param {string} memberPublicKey - Member's public key
 * @returns {string} Credential digest (SHA-256)
 */
export function generateCredentialDigest(invitation, memberPublicKey) {
  if (!invitation || !invitation.payload || !memberPublicKey) {
    throw new Error('invitation and memberPublicKey are required');
  }

  const payload = invitation.payload;
  const input = [
    payload.invitationId,
    payload.organizationId,
    payload.memberEmail,
    payload.nonce,
    memberPublicKey
  ].join('|');

  return `sha256:${crypto.createHash('sha256').update(input).digest('hex')}`;
}

/**
 * Mark invitation as used
 * @param {object} invitation - Full invitation object
 * @returns {object} Updated invitation
 */
export function markInvitationUsed(invitation) {
  const updated = {
    ...invitation,
    payload: {
      ...invitation.payload,
      usedCount: (invitation.payload.usedCount || 0) + 1
    }
  };

  // Re-sign if admin key available
  if (invitation.adminPublicKey) {
    const { payload, signature, ...rest } = updated;
    const newSignature = signInvitation(payload, invitation._adminSecretKey);
    return {
      ...rest,
      payload,
      signature: newSignature
    };
  }

  return updated;
}

/**
 * Create enrollment record
 * @param {object} options - Enrollment options
 * @returns {object} Enrollment record
 */
export function createEnrollment(options) {
  const {
    invitation,
    memberPublicKey,
    memberSubjectId,
    nodeId,
    credentialDigest
  } = options;

  return {
    enrollmentVersion: INVITATION_VERSION,
    enrollmentId: `enroll-${uuidv4()}`,
    invitationId: invitation.payload.invitationId,
    organizationId: invitation.payload.organizationId,
    organizationName: invitation.payload.organizationName,
    memberEmail: invitation.payload.memberEmail,
    memberEmailHash: crypto.createHash('sha256')
      .update(invitation.payload.memberEmail.toLowerCase())
      .digest('hex'),
    memberPublicKey,
    memberSubjectId,
    nodeId,
    credentialDigest,
    enrolledAt: new Date().toISOString(),
    enrollmentProof: generateEnrollmentProof(invitation, memberPublicKey)
  };
}

/**
 * Generate enrollment proof
 * @param {object} invitation - Full invitation object
 * @param {string} memberPublicKey - Member's public key
 * @returns {object} Enrollment proof
 */
export function generateEnrollmentProof(invitation, memberPublicKey) {
  return {
    invitationSignature: invitation.signature,
    adminPublicKey: invitation.adminPublicKey,
    memberPublicKey,
    enrolledAt: new Date().toISOString(),
    proofType: 'Alpha Enrollment'
  };
}

/**
 * Export invitation to file with .moodinvite extension
 * @param {object} invitation - Full invitation object
 * @param {string} directory - Target directory
 * @param {string} [filename] - Optional filename
 * @returns {string} File path
 */
export function exportInvitation(invitation, directory, filename = null) {
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }

  const baseName = filename || `mood-invite-${invitation.payload.invitationId}`;
  const filePath = join(directory, `${baseName}${INVITATION_FILE_EXTENSION}`);

  saveInvitationFile(invitation, filePath);
  return filePath;
}

export default {
  INVITATION_STATUS,
  generateNonce,
  createInvitationPayload,
  signInvitation,
  verifyInvitationSignature,
  checkInvitationExpiry,
  checkInvitationUsable,
  createInvitation,
  saveInvitationFile,
  loadInvitationFile,
  validateInvitationForEnrollment,
  generateCredentialDigest,
  markInvitationUsed,
  createEnrollment,
  generateEnrollmentProof,
  exportInvitation
};
