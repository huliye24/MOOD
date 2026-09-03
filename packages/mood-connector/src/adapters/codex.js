/**
 * Codex adapter.
 *
 * Describes how to RECOGNIZE a local Codex CLI installation. Detection
 * is existence-only: this adapter never launches `codex`, never reads
 * configuration contents, and never touches credentials. Codex is the
 * engine; MOOD is the network layer on top of it.
 */

export default {
  key: 'codex',
  name: 'Codex',
  vendor: 'OpenAI',
  type: 'coding-agent',
  commands: ['codex'],
  // Home-relative config markers — existence only, never read.
  configPaths: ['.codex'],
  installPaths: () => [],
};
