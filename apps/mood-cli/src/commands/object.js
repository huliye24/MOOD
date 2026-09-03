/**
 * `mood object` — the protocol object layer.
 *
 * The chain this command completes:
 *
 *   ContributionProof (local record)
 *     → `object create`   wraps a proof into a content-addressed
 *                          ProtocolObject, issued by this node
 *     → `object list`     the objects this node holds
 *     → `object verify`   integrity (ID = hash of content) + linkage
 *                          (the referenced proof really is stored here)
 *
 * A protocol object is the first MOOD primitive built for the NETWORK:
 * the same object is the same ID on every node, so any node can verify
 * it without trusting the issuer. Synchronization (Node A → Relay →
 * Node B) is the next phase; the interface is already fixed
 * (ObjectSyncAdapter in @mood/protocol-object).
 *
 * No proof logic lives here — hashing and proof validation stay in
 * @mood/contribution-proof. This layer only wraps, stores, verifies.
 *
 *   mood object create --type contribution            (wraps the latest
 *                                                       stored proof)
 *   mood object create --proof proof:mood:xxxx        (a specific proof)
 *   mood object list
 *   mood object verify [object-id]
 */

import { listContributions, findContribution } from '@mood/contribution-proof';
import {
  createProtocolObject,
  buildContributionPayload,
  validateProtocolObject,
  verifyObjectLinkage,
  listObjects,
  findObject,
  storeObject,
  OBJECT_TYPES,
} from '@mood/protocol-object';
import { emit, renderKeyValue, green, yellow, dim, bold } from '../ui/terminal.js';
import { readIdentity } from '../state.js';

// ── contribution resolution ──────────────────────────────────────────────────

/**
 * Resolve which stored contribution the new object should wrap.
 *
 * --proof accepts a proof ID, an event ID, or an event hash; without it,
 * the most recent contribution is used. Anything else fails cleanly —
 * an object is never minted over a guess.
 */
function resolveContribution(ref) {
  const items = listContributions();

  if (typeof ref === 'string' && ref.length > 0) {
    const direct = findContribution({ proofId: ref }) || findContribution({ eventId: ref });
    if (direct) return direct;
    const byHash = items.find((item) => item.proof && item.proof.eventHash === ref);
    if (byHash) return byHash;
    throw new Error(`no contribution found for ${ref} — pass a proof ID, an event ID, or an event hash`);
  }

  const latest = items.find((item) => item.event && item.proof);
  if (!latest) {
    throw new Error(
      'no contribution records on this node — create one first: mood contribution create --actor claude-code --type code_change --description "…"'
    );
  }
  return latest;
}

// ── mood object create ───────────────────────────────────────────────────────

async function create(sub, flags) {
  const type = typeof flags.type === 'string' && flags.type.length > 0 ? flags.type : 'contribution';
  if (!OBJECT_TYPES.includes(type)) {
    throw new Error(`--type must be one of: ${OBJECT_TYPES.join(', ')}`);
  }

  const identity = readIdentity();
  if (!identity || !identity.nodeId) {
    throw new Error('no node identity on this machine — run `mood init` first (a protocol object is issued BY a node)');
  }

  const record = resolveContribution(flags.proof);
  const payload = buildContributionPayload(record.proof);
  const object = createProtocolObject({ type, payload, nodeId: identity.nodeId });
  const { objectFile, created } = storeObject(object);

  if (flags.json) {
    emit({ created, object, objectFile }, '', flags);
    return;
  }

  process.stdout.write(renderKeyValue('MOOD Protocol Object created.', [
    ['Object ID:', object.id],
    ['Type:', object.type],
    ['Event:', payload.eventId],
    ['Proof:', payload.eventHash],
    ['Verified:', green('true')],
  ]));
  process.stdout.write(dim('  Content-addressed: the same object is the same ID on every node.\n'));
  process.stdout.write(dim('  See: `mood object list`, `mood object verify`\n\n'));
}

// ── mood object list ─────────────────────────────────────────────────────────

async function list(sub, flags) {
  const objects = listObjects();

  if (flags.json) {
    emit({
      objects: objects.map((object) => ({ ...object, verified: validateProtocolObject(object).valid })),
    }, '', flags);
    return;
  }

  const lines = ['', bold('MOOD Protocol Objects'), ''];
  if (objects.length === 0) {
    lines.push(dim('  (none yet)'));
    lines.push('');
    lines.push(dim('  Create one: mood object create --type contribution'));
    lines.push('');
    process.stdout.write(lines.join('\n'));
    return;
  }

  objects.forEach((object, i) => {
    const check = validateProtocolObject(object);
    lines.push(`  ${i + 1}. Type:      ${object.type}`);
    lines.push(`     ID:        ${dim(object.id)}`);
    lines.push(`     Issuer:    ${object.issuer?.nodeId || '(unknown)'}`);
    lines.push(`     Status:    ${check.valid ? green('Verified') : yellow('Failed')}`);
    lines.push('');
  });
  process.stdout.write(lines.join('\n'));
}

// ── mood object verify ───────────────────────────────────────────────────────

/**
 * Verify stored objects on two independent levels:
 *
 *   integrity  the ID recomputed from the content matches — the object
 *              was not modified after issuance (this is what every node
 *              on the network will check)
 *   linkage    the contribution it references is stored HERE with the
 *              same proof ID and hash; an absent record is a note, not a
 *              failure (other nodes will not have our records either)
 *
 * A failed verification is a result, not a crash. Exit code is 1 when
 * anything failed, so scripts detect tampering without parsing output.
 */
async function verify(sub, flags, args) {
  const ref = args && args[0];

  const objects = ref ? [findObject({ id: ref })] : listObjects();
  if (ref && !objects[0]) {
    throw new Error(`no protocol object found for ${ref}`);
  }

  const results = objects.map((object) => {
    const integrity = validateProtocolObject(object);
    const linkage = verifyObjectLinkage(object);
    const errors = [...integrity.errors, ...linkage.errors];
    return {
      id: object.id,
      type: object.type,
      eventHash: object.payload?.eventHash || null,
      valid: integrity.valid && linkage.valid,
      integrityValid: integrity.valid,
      linked: linkage.linked,
      note: linkage.note,
      errors,
    };
  });

  const data = {
    total: results.length,
    passed: results.filter((r) => r.valid).length,
    failed: results.filter((r) => !r.valid).length,
    results,
  };

  if (flags.json) {
    emit(data, '', flags);
  } else {
    const lines = ['', bold('Object verification'), ''];
    if (data.total === 0) {
      lines.push(dim('  (no protocol objects stored yet)'));
      lines.push('');
      lines.push(dim('  Create one: mood object create --type contribution'));
      lines.push('');
    }
    results.forEach((r, i) => {
      lines.push(`  ${i + 1}. ${r.valid ? green('PASS') : yellow('FAIL')}   ${r.id}`);
      lines.push(`     Type:  ${r.type}`);
      lines.push(`     Hash:  ${r.eventHash || '(none)'}`);
      if (r.linked) {
        lines.push(`     Linkage: ${r.valid ? 'cross-checked against the stored proof' : 'contradicts the stored proof'}`);
      } else if (r.note) {
        lines.push(dim(`     · ${r.note}`));
      }
      if (!r.valid && r.errors && r.errors.length) {
        for (const e of r.errors) lines.push(`     ${yellow('·')} ${e}`);
      }
      lines.push('');
    });
    if (data.total > 0) {
      lines.push(`  ${data.failed === 0 ? green('Summary: ' + data.passed + '/' + data.total + ' verified') : yellow('Summary: ' + data.passed + '/' + data.total + ' verified — ' + data.failed + ' FAILED')}`);
      lines.push('');
      lines.push(dim('  An object verifies by content: the ID is the hash of the object itself.'));
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
      throw new Error(`unknown subcommand: mood object ${sub} (try create, list, verify)`);
  }
}

export default { run };
