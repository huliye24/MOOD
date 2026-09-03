/**
 * Terminal helpers.
 *
 * Responsibilities:
 *   - colorize text when stdout is a TTY
 *   - render human-readable screens for `mood`, `mood status`, etc.
 *   - emit JSON envelopes for AI agents
 *
 * Design rule: every command returns a data object first; the human
 * renderer and the JSON renderer both consume that same object.
 * That guarantees that `mood status --json` is exactly equivalent to
 * `mood status` parsed by an AI Agent.
 */

import { MOOD_LOGO } from './logo.js';
import {
  PROTOCOL_VERSION,
  CLI_VERSION,
  NETWORK_NAME,
  CONSENSUS_MODE,
  NETWORK_MODE,
  TAGLINE,
} from '../config/defaults.js';

// ── Color helpers (TTY only) ────────────────────────────────────────────────

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

const wrap = (open, close) => (s) => (useColor ? `\x1b[${open}m${s}\x1b[${close}m` : String(s));

export const cyan = wrap('36', '39');
export const green = wrap('32', '39');
export const yellow = wrap('33', '39');
export const dim = wrap('2', '22');
export const bold = wrap('1', '22');

// ── Output helpers ──────────────────────────────────────────────────────────

/**
 * Emit either a human screen or a JSON envelope based on flags.
 *
 * @param {object} data     the structured command result
 * @param {string} human    the pre-rendered human screen
 * @param {object} flags    parsed argv flags; honors { json }
 */
export function emit(data, human, flags) {
  if (flags && flags.json) {
    process.stdout.write(JSON.stringify({ ok: true, ...data }) + '\n');
    return;
  }
  process.stdout.write(human);
}

/**
 * Emit an error envelope. Errors always use the JSON envelope when
 * MOOD_JSON=1 is set or --json is anywhere on argv. Otherwise they
 * go to stderr as a short message so they can be shell-piped.
 */
export function emitError(err, flags) {
  const jsonMode = (flags && flags.json) || process.env.MOOD_JSON === '1';
  if (jsonMode) {
    process.stdout.write(JSON.stringify({ ok: false, error: err.message || String(err) }) + '\n');
  } else {
    process.stderr.write(`\n✗ mood: ${err.message || err}\n`);
  }
  process.exitCode = 1;
}

// ── Screens ─────────────────────────────────────────────────────────────────

/**
 * Render the headline `mood` screen: logo, banner, identity, status.
 *
 * @param {object} state    { nodeId, status, network, protocolVersion }
 */
export function renderHomeScreen(state) {
  const nodeId = state.nodeId || '(not initialized — run `mood init`)';
  const status = state.status || 'Stopped';

  const lines = [];
  lines.push(cyan(MOOD_LOGO));
  lines.push(`        ${bold('~ MOOD ~')}`);
  lines.push('');
  lines.push(`        ${dim('Contribution Network')}`);
  lines.push('');
  lines.push(`        Protocol:  ${yellow('v' + (state.protocolVersion || PROTOCOL_VERSION))}`);
  lines.push(`        Network:   ${yellow(state.network || NETWORK_NAME)}`);
  lines.push(`        Node:      ${green(nodeId)}`);
  lines.push(`        Status:    ${status === 'Running' || status === 'Connected' ? green(status) : yellow(status)}`);
  lines.push('');
  lines.push(`        ${dim('"' + TAGLINE + '"')}`);
  lines.push('');
  lines.push(`        ${dim('Try: `mood init`, `mood start`, `mood status --json`')}`);
  lines.push('');
  lines.push(cyan('> '));
  return lines.join('\n');
}

/**
 * Render `mood status` in the canonical text layout.
 */
export function renderStatusScreen(s) {
  const running = s.status === 'Running' || s.status === 'Connected';
  const lines = [];
  lines.push('');
  lines.push(bold('MOOD Node Status'));
  lines.push('');
  lines.push(`  Node ID:      ${green(s.nodeId || '(none)')}`);
  lines.push(`  Network:      ${yellow(s.network || NETWORK_NAME)}`);
  lines.push(`  Protocol:     v${s.protocolVersion || PROTOCOL_VERSION}`);
  lines.push(`  Status:       ${running ? green(s.status) : yellow(s.status || 'Stopped')}`);
  lines.push(`  Peers:        ${s.peers ?? 0} connected`);
  lines.push(`  Latest Epoch: ${s.epoch != null ? String(s.epoch).padStart(3, '0') : '—'}`);
  lines.push(`  Snapshot:     ${s.digest ? 'sha256:' + s.digest : '(none)'}`);
  lines.push(`  Agreement:    ${s.agreement === 'Verified' ? green('Verified') : yellow(s.agreement || 'Unknown')}`);
  lines.push('');
  return lines.join('\n');
}

/**
 * Render `mood identity show`.
 */
export function renderIdentityScreen(id) {
  const lines = [];
  lines.push('');
  lines.push(bold('MOOD Identity'));
  lines.push('');
  lines.push(`  Node ID:          ${green(id.nodeId || '(none)')}`);
  lines.push(`  Public Key:       ${dim(id.publicKey || '(none)')}`);
  lines.push(`  Network:          ${id.networkId || NETWORK_NAME}`);
  lines.push(`  Organization ID:  ${id.organizationId || '(unaffiliated)'}`);
  lines.push('');
  lines.push(dim('  Private key never leaves this machine.'));
  lines.push('');
  return lines.join('\n');
}

/**
 * Render `mood peers` as a short list.
 */
export function renderPeersScreen(peers) {
  const lines = [];
  lines.push('');
  lines.push(bold('Connected Peers'));
  lines.push('');
  if (!peers || peers.length === 0) {
    lines.push(dim('  (no peers connected)'));
  } else {
    peers.forEach((p, i) => {
      lines.push(`  ${green(String(i + 1).padStart(2, ' ') + '.')} ${p.alias || p.nodeId || 'Unknown peer'}`);
      if (p.nodeId && p.alias) {
        lines.push(dim(`      ${p.nodeId}`));
      }
    });
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Render `mood protocol`.
 */
export function renderProtocolScreen(p) {
  const lines = [];
  lines.push('');
  lines.push(bold('MOOD Protocol'));
  lines.push('');
  lines.push(`  Version:    v${p.version || PROTOCOL_VERSION}`);
  lines.push(`  Mode:       ${p.mode || NETWORK_MODE}`);
  lines.push(`  Consensus:  ${p.consensus || CONSENSUS_MODE}`);
  lines.push(`  Client:     v${p.clientVersion || CLI_VERSION}`);
  lines.push('');
  return lines.join('\n');
}

/**
 * Render `mood invite create`.
 */
export function renderInviteScreen(invite) {
  const lines = [];
  lines.push('');
  lines.push(bold('MOOD Invitation Created'));
  lines.push('');
  lines.push(`  File:        ${green(invite.path)}`);
  lines.push(`  Invite ID:   ${invite.inviteId}`);
  lines.push(`  Issued by:   ${invite.issuerNodeId}`);
  lines.push(`  For:         ${invite.memberEmail}`);
  lines.push(`  Expires at:  ${invite.expiresAt}`);
  lines.push('');
  lines.push(dim('  Share this file (or its base64 body) with a future node.'));
  lines.push('');
  return lines.join('\n');
}

/**
 * Render `mood snapshot verify`.
 */
export function renderSnapshotScreen(v) {
  const lines = [];
  lines.push('');
  lines.push(bold('MOOD Snapshot Verification'));
  lines.push('');
  lines.push(`  Epoch:       ${v.epochId || '—'}`);
  lines.push(`  Digest:      ${v.digest ? 'sha256:' + v.digest : '(none)'}`);
  lines.push(`  Recomputed:  ${v.recomputed ? 'sha256:' + v.recomputed : '(none)'}`);
  lines.push(`  Agreement:   ${v.valid ? green('Verified') : yellow('Failed')}`);
  if (v.attestations != null) {
    lines.push(`  Attestations: ${v.attestations}`);
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Render a simple key=value block used for `mood init`, `mood start`,
 * `mood stop`, and similar one-shot commands.
 */
export function renderKeyValue(title, entries) {
  const lines = [];
  lines.push('');
  lines.push(bold(title));
  lines.push('');
  for (const [k, v] of entries) {
    lines.push(`  ${k.padEnd(14, ' ')} ${v}`);
  }
  lines.push('');
  return lines.join('\n');
}
