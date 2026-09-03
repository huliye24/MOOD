/**
 * `mood contribution` — the contribution proof layer.
 *
 * The chain this command completes:
 *
 *   AI Agent / human / organization performs work
 *     → `contribution create`  records a ContributionEvent and mints its
 *                              ContributionProof (SHA-256 over the event)
 *     → `contribution list`    shows what this node recorded
 *     → `contribution verify`  recomputes every hash — did anything change?
 *
 * Actor resolution, in order:
 *   1. a registered connector agent (--agent key, name, or agent ID)
 *      → the agent's registered identity, source = the connector
 *   2. otherwise a deterministic derived ID (agent:/human:/org:mood:…)
 *      → no registration required; same reference → same ID, always
 *
 * Boundary: contribution records carry descriptions and IDs — never API
 * keys, credentials, or private data. The validator enforces it
 * structurally; nothing here can bypass it.
 *
 *   mood contribution create --actor claude-code --type code_change \
 *                            --description "Updated node API"
 *   mood contribution list
 *   mood contribution verify [event-id|proof-id]
 */

import {
  createContributionEvent,
  createProof,
  deriveActorId,
  hashEvent,
  listContributions,
  findContribution,
  saveContribution,
  verifyStoredContributions,
  validateProof,
  ACTOR_TYPES,
} from '@mood/contribution-proof';
import { readConnectorRecord } from '@mood/connector';
import { emit, renderKeyValue, green, yellow, dim, bold } from '../ui/terminal.js';
import { readIdentity } from '../state.js';

// ── actor resolution ─────────────────────────────────────────────────────────

/**
 * Resolve `--actor` to a ContributionEvent actor plus connector provenance.
 * Registered connector agents win for ai_agent contributions; everything
 * else derives a stable ID from (type, reference).
 */
function resolveActor(reference, actorType) {
  const ref = String(reference).trim();

  if (actorType === 'ai_agent') {
    const record = readConnectorRecord();
    if (record) {
      const lower = ref.toLowerCase();
      const match = (record.agents || []).find(
        (a) => a.key === ref || (a.name || '').toLowerCase() === lower || a.agentId === ref,
      );
      if (match) {
        return { actor: { id: match.agentId, type: 'ai_agent', name: match.name }, connectorId: record.connectorId };
      }
    }
  }

  return {
    actor: { id: deriveActorId(actorType, ref), type: actorType, name: ref },
    connectorId: '',
  };
}

// ── mood contribution create ─────────────────────────────────────────────────

async function create(sub, flags) {
  const actorRef = flags.actor;
  if (typeof actorRef !== 'string' || actorRef.trim().length === 0) {
    throw new Error('--actor is required (an agent key/name, an agent ID, or any reference — e.g. --actor claude-code)');
  }
  const actorType = flags['actor-type'] || 'ai_agent';
  if (!ACTOR_TYPES.includes(actorType)) {
    throw new Error(`--actor-type must be one of: ${ACTOR_TYPES.join(', ')}`);
  }
  const actionType = typeof flags.type === 'string' && flags.type.length > 0 ? flags.type : 'code_change';
  const description = typeof flags.description === 'string' ? flags.description : '';

  const { actor, connectorId } = resolveActor(actorRef, actorType);
  const identity = readIdentity();

  const timestamp = new Date().toISOString();
  const event = createContributionEvent({
    actor,
    action: { type: actionType, description },
    timestamp,
    source: { connector: connectorId, node: identity?.nodeId || '' },
  });
  const proof = createProof(event, timestamp);
  const { eventFile, proofFile } = saveContribution({ event, proof });

  if (flags.json) {
    emit({ created: true, event, proof, eventFile, proofFile }, '', flags);
    return;
  }

  process.stdout.write(renderKeyValue('MOOD Contribution created.', [
    ['Event:', event.id],
    ['Agent:', actor.name || actor.id],
    ['Type:', event.action.type],
    ['Proof:', proof.eventHash],
    ['Verified:', green('true')],
  ]));
  process.stdout.write(dim('  Stored locally. Not a reward, not a score — proof that work happened.\n'));
  process.stdout.write(dim('  See: `mood contribution list`, `mood contribution verify`\n\n'));
}

// ── mood contribution list ───────────────────────────────────────────────────

async function list(sub, flags) {
  const items = listContributions();

  if (flags.json) {
    emit({ contributions: items }, '', flags);
    return;
  }

  const lines = ['', bold('MOOD Contributions'), ''];
  if (items.length === 0) {
    lines.push(dim('  (none recorded yet)'));
    lines.push('');
    lines.push(dim('  Create one: mood contribution create --actor claude-code --type code_change \\'));
    lines.push(dim('                    --description "Updated node API"'));
    lines.push('');
    process.stdout.write(lines.join('\n'));
    return;
  }

  items.forEach((item, i) => {
    const event = item.event;
    if (!event) {
      lines.push(`  ${i + 1}. ${yellow('orphan proof')} ${dim(item.proof?.eventId || '')}`);
      lines.push('');
      return;
    }
    lines.push(`  ${i + 1}. Agent:     ${event.actor.name || event.actor.id}`);
    lines.push(`     Type:      ${event.action.type}`);
    lines.push(`     Event:     ${dim(event.id)}`);
    if (item.proof) {
      const check = validateProof(item.proof, event);
      lines.push(`     Proof:     ${check.valid ? green('Verified') : yellow('Failed')}`);
    } else {
      lines.push(`     Proof:     ${yellow('Missing')}`);
    }
    lines.push('');
  });
  process.stdout.write(lines.join('\n'));
}

// ── mood contribution verify ─────────────────────────────────────────────────

/**
 * Recompute every stored event hash and compare it against what its proof
 * recorded. One contribution can be checked alone by passing its event ID
 * or proof ID.
 *
 * A failed verification is a result, not a crash — the results are always
 * printed. The exit code is 1 when anything failed, so a shell script
 * can detect tampering without parsing output.
 */
async function verify(sub, flags, args) {
  const ref = args && args[0];

  let data;
  if (ref) {
    const found = ref.startsWith('proof:')
      ? findContribution({ proofId: ref })
      : findContribution({ eventId: ref });
    if (!found) {
      throw new Error(`no contribution found for ${ref}`);
    }
    if (!found.event || !found.proof) {
      throw new Error(`incomplete contribution record for ${ref} — ${found.event ? 'proof' : 'event'} missing`);
    }
    const { valid, errors } = validateProof(found.proof, found.event);
    data = {
      total: 1,
      passed: valid ? 1 : 0,
      failed: valid ? 0 : 1,
      results: [{
        eventId: found.event.id,
        proofId: found.proof.proofId,
        eventHash: found.proof.eventHash,
        recomputed: hashEvent(found.event),
        valid,
        errors,
      }],
    };
  } else {
    const sweep = verifyStoredContributions();
    data = {
      total: sweep.total,
      passed: sweep.passed,
      failed: sweep.failed,
      results: sweep.results.map((r) => ({
        eventId: r.eventId,
        proofId: r.proofId,
        eventHash: r.eventHash,
        recomputed: r.recomputed,
        valid: r.valid,
        errors: r.errors,
      })),
    };
  }

  if (flags.json) {
    emit(data, '', flags);
  } else {
    const lines = ['', bold('Proof verification'), ''];
    if (data.total === 0) {
      lines.push(dim('  (no contributions recorded yet)'));
      lines.push('');
    }
    data.results.forEach((r, i) => {
      lines.push(`  ${i + 1}. ${r.valid ? green('PASS') : yellow('FAIL')}   ${r.eventId || '(unknown event)'}`);
      lines.push(`     Hash: ${r.eventHash || '(no proof)'}`);
      if (!r.valid && r.errors && r.errors.length) {
        for (const e of r.errors) lines.push(`     ${yellow('·')} ${e}`);
      }
      lines.push('');
    });
    if (data.total > 0) {
      lines.push(`  ${data.failed === 0 ? green('Summary: ' + data.passed + '/' + data.total + ' verified') : yellow('Summary: ' + data.passed + '/' + data.total + ' verified — ' + data.failed + ' FAILED')}`);
      lines.push('');
      lines.push(dim('  A proof attests the event existed and was not modified after recording.'));
      lines.push('');
    }
    process.stdout.write(lines.join('\n'));
  }

  if (data.failed > 0) {
    process.exitCode = 1;
  }
}

// ── router ───────────────────────────────────────────────────────────────────

export async function run(args, flags) {
  const sub = args[0] || 'list';

  switch (sub) {
    case 'create': return create(sub, flags);
    case 'list': return list(sub, flags);
    case 'verify': return verify(sub, flags, args.slice(1));
    default:
      throw new Error(`unknown subcommand: mood contribution ${sub} (try create, list, verify)`);
  }
}

export default { run };
