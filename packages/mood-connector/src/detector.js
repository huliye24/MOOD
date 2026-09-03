/**
 * AI environment detection.
 *
 * Answers exactly one question: "which AI Agent tools are installed on
 * this machine?" — and answers it without ever running one of them.
 *
 * Detection is existence-only:
 *   - a command file named after the tool somewhere on PATH
 *   - a known config directory/file under the user's home
 *   - a known install location for the platform
 *
 * This module NEVER spawns a process, NEVER reads a file's contents,
 * and NEVER inspects credentials. If a tool config happens to contain
 * API keys, MOOD never learns them — we check `exists`, nothing else.
 */

import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { DETECTABLE_ADAPTERS } from './adapters/index.js';

/**
 * The user's home directory, resolvable from an injected env (tests) or
 * the real environment. Windows leads with USERPROFILE, POSIX with HOME.
 */
export function resolveUserHome(env = process.env) {
  return env.USERPROFILE || env.HOME || homedir();
}

/** PATH lookup, tolerant of Windows key casing (PATH / Path). */
function pathEntries(env) {
  const pathVar = env.PATH || env.Path || env.path || '';
  return String(pathVar).split(process.platform === 'win32' ? ';' : ':')
    .filter(Boolean);
}

/** Candidate command file names for this platform (npm shims incl.). */
function commandCandidates(cmd) {
  if (process.platform === 'win32') {
    return [cmd, `${cmd}.cmd`, `${cmd}.exe`, `${cmd}.bat`, `${cmd}.ps1`];
  }
  return [cmd];
}

/** Does `cmd` exist as a FILE in some PATH directory? (never executes it) */
function commandOnPath(cmd, env) {
  for (const dir of pathEntries(env)) {
    for (const candidate of commandCandidates(cmd)) {
      const full = join(dir, candidate);
      try {
        if (statSync(full).isFile()) return true;
      } catch {
        // not there — keep scanning
      }
    }
  }
  return false;
}

/**
 * Detect every known AI Agent environment.
 *
 * Returns an array of descriptors (deterministic order = adapter order):
 *   { key, name, type, detected: boolean, sources: string[] }
 * `sources` says WHY an agent counts as installed ('command', 'config',
 * 'install-path') — evidence, never file contents.
 */
export function detectAgents({ env = process.env } = {}) {
  const userHome = resolveUserHome(env);

  return DETECTABLE_ADAPTERS.map((adapter) => {
    const sources = [];

    if (adapter.commands.some((cmd) => commandOnPath(cmd, env))) {
      sources.push('command');
    }
    for (const rel of adapter.configPaths) {
      if (existsSync(join(userHome, rel))) {
        sources.push('config');
        break;
      }
    }
    const installs = adapter.installPaths ? adapter.installPaths(env, userHome) : [];
    if (installs.some((p) => existsSync(p))) {
      sources.push('install-path');
    }

    return {
      key: adapter.key,
      name: adapter.name,
      type: adapter.type,
      detected: sources.length > 0,
      sources,
    };
  });
}

/** Only the agents that are actually installed. */
export function detectedAgents(options) {
  return detectAgents(options).filter((a) => a.detected);
}
