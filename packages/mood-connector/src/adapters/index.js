/**
 * Adapter registry — one file per recognized AI Agent environment.
 *
 * An adapter is pure DESCRIPTION: who the agent is (key, name, type)
 * and how to recognize a local installation (commands, config paths,
 * install paths). Adapters contain no execution, no configuration
 * reading, and no credentials — ever.
 */

import claudeAdapter from './claude.js';
import codexAdapter from './codex.js';
import cursorAdapter from './cursor.js';
import genericAdapter, { genericAdapterFor, GENERIC_AGENT_TYPE } from './generic.js';

export {
  claudeAdapter,
  codexAdapter,
  cursorAdapter,
  genericAdapter,
  genericAdapterFor,
  GENERIC_AGENT_TYPE,
};

/** Agents with a local detection strategy (generic is registration-only). */
export const DETECTABLE_ADAPTERS = [claudeAdapter, codexAdapter, cursorAdapter];

/** All known adapters, keyed by adapter key. */
export const ADAPTERS_BY_KEY = new Map(
  DETECTABLE_ADAPTERS.map((a) => [a.key, a]),
);

/**
 * Resolve an adapter by key. Known keys return the canonical adapter;
 * anything else returns a generic adapter for that name — MOOD connects
 * to "other AI systems" instead of refusing them.
 */
export function resolveAdapter(keyOrName) {
  const raw = String(keyOrName || '').trim();
  if (!raw) return null;
  const adapter = ADAPTERS_BY_KEY.get(raw.toLowerCase());
  if (adapter) return adapter;
  // Accept display names too: "Claude Code" → claude-code.
  for (const a of DETECTABLE_ADAPTERS) {
    if (a.name.toLowerCase() === raw.toLowerCase()) return a;
  }
  return genericAdapterFor(raw);
}
