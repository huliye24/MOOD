/**
 * Generic agent adapter — the fallback for "other AI systems".
 *
 * MOOD does not enumerate every agent on earth. Any agent that is not
 * Claude Code, Codex, or Cursor can still be registered through the
 * generic adapter: the connector records its name and treats it as a
 * first-class contributor. No detection strategy exists for generic
 * agents — a human or an AI Agent registers them explicitly.
 */

export const GENERIC_AGENT_TYPE = 'generic-agent';

export default {
  key: 'generic',
  name: 'Generic AI Agent',
  type: GENERIC_AGENT_TYPE,
  commands: [],
  configPaths: [],
  installPaths: () => [],
};

/**
 * Build an adapter descriptor for an arbitrary named agent.
 * `name` is stored verbatim as the agent's display name.
 */
export function genericAdapterFor(name) {
  const clean = String(name || '').trim();
  return {
    key: clean.toLowerCase().replace(/\s+/g, '-'),
    name: clean,
    type: GENERIC_AGENT_TYPE,
    commands: [],
    configPaths: [],
    installPaths: () => [],
  };
}
