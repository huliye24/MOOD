/**
 * Claude Code adapter.
 *
 * Describes how to RECOGNIZE a local Claude Code installation. Detection
 * is existence-only: this adapter never launches `claude`, never reads
 * configuration contents, and never touches credentials. Claude Code is
 * the engine; MOOD is the network layer on top of it.
 */

export default {
  key: 'claude-code',
  name: 'Claude Code',
  vendor: 'Anthropic',
  type: 'coding-agent',
  commands: ['claude'],
  // Home-relative config markers — existence only, never read.
  configPaths: ['.claude', '.claude.json'],
  installPaths: () => [],
};
