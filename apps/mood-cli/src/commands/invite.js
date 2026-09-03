/**
 * `mood invite create` — issue a .moodinvite file.
 *
 * Reuses the shared invitation logic from @mood/node-runtime
 * (createInvitation / verifyInvitationSignature) — the CLI implements no
 * invitation logic of its own and introduces no new identity system.
 *
 * The local node keypair acts as the (alpha) organization admin key.
 * Invitations are bound to one email, expire after 72 hours, and are
 * one-time use.
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import {
  createInvitation,
  verifyInvitationSignature,
  generateOrganizationId,
} from '@mood/node-runtime';
import { emit, renderInviteScreen } from '../ui/terminal.js';
import {
  isInitialized,
  readIdentity,
  readPrivateIdentity,
  readConfig,
  setOrganization,
} from '../state.js';
import { NETWORK_ID } from '../config/defaults.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function run(args, flags) {
  const sub = (args[0] || 'create').toLowerCase();

  if (sub !== 'create') {
    throw new Error(`unknown invite subcommand: ${sub} (try \`mood invite create --email <addr>\`)`);
  }

  if (!isInitialized()) {
    throw new Error('Node not initialized — run `mood init` first');
  }

  const email = flags.email || flags.for;
  if (!email || !EMAIL_RE.test(email)) {
    throw new Error('a valid --email is required (the invitation is bound to one email address)');
  }

  const identity = readIdentity();
  const privateIdentity = readPrivateIdentity();
  const config = readConfig() || {};
  const org = config.organization || {};

  const organizationName = flags.orgName || org.name || 'MOOD Alpha';
  const organizationDomain = flags.orgDomain || org.domain || email.split('@')[1].toLowerCase();

  // Organization affiliation: explicit flag, existing enrollment, or the
  // deterministic default derived at init time.
  const organizationId = flags.org
    || identity.organizationId
    || org.organizationId
    || generateOrganizationId(organizationName, organizationDomain);

  const invitation = createInvitation(
    {
      organizationId,
      organizationName,
      organizationDomain,
      memberEmail: email,
      networkId: config.networkId || NETWORK_ID,
      issuedBy: identity.nodeId,
      adminPublicKey: identity.publicKey,
    },
    privateIdentity.privateKey
  );

  // Self-check before handing the file out: a broken invitation must
  // never be written to disk.
  const check = verifyInvitationSignature(invitation);
  if (!check.valid) {
    throw new Error(`invitation signature self-check failed: ${check.error}`);
  }

  const outDir = flags.out
    ? resolve(process.cwd(), flags.out)
    : process.cwd();
  const fileName = `mood-invite-${invitation.payload.invitationId}.moodinvite`;
  const filePath = join(outDir, fileName);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(filePath, JSON.stringify(invitation, null, 2));

  // Remember affiliation if this is the node's first explicit organization.
  if (!identity.organizationId && flags.org) {
    setOrganization(organizationId);
  }

  const data = {
    inviteId: invitation.payload.invitationId,
    path: filePath,
    issuerNodeId: identity.nodeId,
    memberEmail: invitation.payload.memberEmail,
    organizationId,
    networkId: invitation.payload.networkId,
    issuedAt: invitation.payload.issuedAt,
    expiresAt: invitation.payload.expiresAt,
    maxUses: invitation.payload.maxUses,
  };

  if (flags.json) {
    emit(data, '', flags);
    return;
  }

  process.stdout.write(renderInviteScreen(data));
}

export default { run };
