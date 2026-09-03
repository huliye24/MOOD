/**
 * `mood connector` — the AI Agent contribution connector.
 *
 * MOOD does not compete with Claude Code, Codex, or Cursor. Those tools
 * are the engines — they create. The connector is the bridge that turns
 * an installed agent environment into a contributor on the MOOD network:
 *
 *   detect   → which AI Agent tools exist on this machine?
 *   init     → create the local connector identity
 *   register → give agents a contribution identity
 *   status   → one screen: connector, agents, network readiness
 *
 * Boundary, enforced by the @mood/connector package (not just promised
 * here): detection is existence-only — no spawning, no config reading;
 * storage holds IDs, names, and timestamps — never API keys, user
 * credentials, or private keys.
 *
 *   mood connector detect
 *   mood connector init
 *   mood connector register [--agent <key|name>[,<key|name>...]]
 *   mood connector status
 */

import {
  detectAgents,
  detectedAgents,
  initConnector,
  readConnectorRecord,
  registerAgent,
} from '@mood/connector';
import { emit, renderKeyValue, green, yellow, dim, bold } from '../ui/terminal.js';

// ── mood connector detect ────────────────────────────────────────────────────

async function detect(sub, flags) {
  const agents = detectAgents();
  const installed = agents.filter((a) => a.detected);

  if (flags.json) {
    emit({
      agents: agents.map(({ key, name, type, detected, sources }) => ({
        key, name, type, detected, sources,
      })),
      installed: installed.map((a) => a.name),
      ready: installed.length > 0,
    }, '', flags);
    return;
  }

  const lines = ['', bold('AI Agent Detection'), ''];
  for (const a of agents) {
    const label = a.name.padEnd(14, ' ');
    const state = a.detected ? green('installed') : yellow('not detected');
    const evidence = a.sources.length
      ? dim(` (${a.sources.join(', ')})`)
      : '';
    lines.push(`  ${label} ${state}${evidence}`);
  }
  lines.push('');
  lines.push(`  ${installed.length > 0 ? green('Ready for connection.') : yellow('No AI Agent tools detected.')}`);
  lines.push('');
  lines.push(dim('  Detection only. Do not call these tools. Do not control these tools.'));
  lines.push('');
  process.stdout.write(lines.join('\n'));
}

// ── mood connector init ──────────────────────────────────────────────────────

async function init(sub, flags) {
  const result = initConnector();

  if (flags.json) {
    emit({
      created: result.created,
      connectorId: result.connectorId,
      dir: result.dir,
      agentRecordFile: result.agentRecordFile,
    }, '', flags);
    return;
  }

  process.stdout.write(renderKeyValue(
    result.created ? 'MOOD Connector initialized.' : 'MOOD Connector already initialized.',
    [
      ['Connector ID:', result.connectorId],
      ['Storage:', result.dir],
    ],
  ));
  process.stdout.write(dim('  Never stored here: AI API keys, user credentials, private keys.\n'));
  process.stdout.write(dim('  Next: `mood connector register`\n\n'));
}

// ── mood connector register ──────────────────────────────────────────────────

/**
 * Register agents. Without --agent: every detected agent. With --agent:
 * a single key/name or a comma-separated list — unknown names register
 * through the generic adapter, so any AI system can join.
 */
async function register(sub, flags) {
  // Fail fast (and clearly) when the connector is not initialized.
  const record = readConnectorRecord();
  if (!record) {
    throw new Error('connector not initialized — run `mood connector init` first');
  }

  let targets;
  if (flags.agent) {
    targets = String(flags.agent)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    targets = detectedAgents().map((a) => a.key);
  }

  if (targets.length === 0) {
    throw new Error('no AI Agent tools detected — pass one explicitly: `mood connector register --agent <name>`');
  }

  const results = targets.map((agent) => registerAgent({ agent }));

  if (flags.json) {
    emit({ registered: results }, '', flags);
    return;
  }

  const lines = ['', bold('Register AI Agent'), ''];
  for (const r of results) {
    lines.push(`  ${r.name}`);
    lines.push(`    Agent ID: ${r.agentId}`);
    lines.push(`    Identity:  ${r.registered ? green('created') : dim('already registered — same ID kept')}`);
    lines.push('');
  }
  lines.push(dim('  A contribution identity is metadata — not a reward, not token accounting.'));
  lines.push(dim('  Next: `mood connector status`'));
  lines.push('');
  process.stdout.write(lines.join('\n'));
}

// ── mood connector status ────────────────────────────────────────────────────

async function status(sub, flags) {
  const record = readConnectorRecord();

  if (flags.json) {
    emit({
      connector: record ? 'active' : 'inactive',
      connectorId: record ? record.connectorId : null,
      agents: record
        ? (record.agents || []).map((a) => ({ name: a.name, type: a.type, agentId: a.agentId }))
        : [],
      network: record && (record.agents || []).length > 0 ? 'Ready' : 'Not ready',
    }, '', flags);
    return;
  }

  if (!record) {
    process.stdout.write(renderKeyValue('MOOD Connector', [
      ['Connector:', yellow('inactive')],
      ['Agents:', 'none'],
      ['Network:', yellow('Not ready')],
    ]));
    process.stdout.write(dim('  Run `mood connector init` to create the connector identity.\n\n'));
    return;
  }

  const agents = record.agents || [];
  const names = agents.length
    ? agents.map((a) => a.name).join(', ')
    : 'none registered yet';

  process.stdout.write(renderKeyValue('MOOD Connector', [
    ['Connector:', green('active')],
    ['Connector ID:', record.connectorId],
    ['Agents:', names],
    ['Network:', agents.length > 0 ? green('Ready') : yellow('Not ready')],
  ]));
  process.stdout.write(dim('  AI engines create. MOOD records contribution. The network verifies.\n\n'));
}

// ── router ───────────────────────────────────────────────────────────────────

export async function run(args, flags) {
  const sub = args[0] || 'status';

  switch (sub) {
    case 'detect': return detect(sub, flags);
    case 'init': return init(sub, flags);
    case 'register': return register(sub, flags);
    case 'status': return status(sub, flags);
    default:
      throw new Error(`unknown subcommand: mood connector ${sub} (try detect, init, register, status)`);
  }
}

export default { run };
