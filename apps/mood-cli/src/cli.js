/**
 * MOOD CLI router.
 *
 * This file is intentionally minimal. It only:
 *   1. Parses argv (no third-party arg parser — we don't want a dep here).
 *   2. Resolves a command module by name.
 *   3. Invokes its `run(args, flags)` function.
 *
 * Adding a new command = adding one file in `src/commands/`.
 *
 * `daemon` is an internal command (spawned by `mood start`), not part
 * of the public surface.
 */

import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import {
  renderHomeScreen,
  emit,
  emitError,
  dim,
  bold,
} from './ui/terminal.js';
import { loadState } from './state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const COMMANDS_DIR = resolve(__dirname, 'commands');
const DAEMON_MODULE = resolve(__dirname, 'daemon.js');

/**
 * Tiny argv parser. Supports:
 *   mood                       → empty args, runs home
 *   mood <cmd>                 → positional command
 *   mood <cmd> sub             → sub-command positional
 *   mood <cmd> --json          → boolean flag
 *   mood <cmd> --key value     → string flag (key followed by next arg)
 *
 * Anything not starting with `--` is treated as positional.
 */
export function parseArgs(argv) {
  const positional = [];
  const flags = { json: false };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') {
      flags.json = true;
    } else if (a === '--no-color') {
      process.env.NO_COLOR = '1';
    } else if (a.startsWith('--')) {
      // --key value | --key=value
      const eq = a.indexOf('=');
      if (eq !== -1) {
        const key = a.slice(2, eq);
        const value = a.slice(eq + 1);
        flags[key] = value;
      } else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('--')) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else {
      positional.push(a);
    }
  }

  return { positional, flags };
}

/**
 * Resolve and dynamically import a command module.
 *
 * We import dynamically so that `mood --help` is instantaneous even if
 * some command modules load heavier crypto libraries.
 */
async function loadCommand(name) {
  // Command names are plain slugs — never a path.
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error(`unknown command: ${name}`);
  }
  if (name === 'daemon') {
    return import(pathToFileURL(DAEMON_MODULE).href);
  }
  const candidate = resolve(COMMANDS_DIR, `${name}.js`);
  const candidateUrl = pathToFileURL(candidate).href;
  try {
    return await import(candidateUrl);
  } catch (err) {
    // Node renders the failing module as either a file:// URL or a
    // platform path depending on the loader stage — accept both.
    const msg = String(err?.message || '');
    if (err?.code === 'ERR_MODULE_NOT_FOUND' && (msg.includes(candidateUrl) || msg.includes(candidate))) {
      throw new Error(`unknown command: ${name} (try \`mood --help\`)`);
    }
    throw err;
  }
}

const HELP = `
${bold('mood')} — MOOD Contribution Network CLI

${bold('Usage:')}
  mood                              Show the home screen
  mood <command> [sub] [--json]     Run a command

${bold('Node lifecycle:')}
  mood init                         Initialize ~/.mood/ and generate identity
  mood start                        Start the local MOOD node runtime
  mood stop                         Stop the local MOOD node runtime
  mood status                       Show node status (snapshot, peers, epoch)

${bold('AI Agent layer:')}
  mood api start [--port <n>]       Start the local API (default 127.0.0.1:8788)
                                    [--key <secret>] require Bearer auth
  mood api status                   Show API status (endpoint, key, health)
  mood api stop                     Stop the local API
  mood connector detect            Detect installed AI Agent tools (Claude Code,
                                    Codex, Cursor) — detection only, never runs them
  mood connector init              Create the local connector identity
  mood connector register          Register agents as MOOD contributors
                                    [--agent <key|name>] explicit agent(s)
  mood connector status            Show connector status (agents, network)

${bold('Identity & Invitations:')}
  mood identity show                Show node identity (public side only)
  mood invite create --email <addr> Issue a .moodinvite for a new node

${bold('Network:')}
  mood peers                        List connected peers
  mood snapshot verify              Verify the latest snapshot digest
  mood protocol                     Show the active MOOD protocol info

${bold('AI Agent mode:')}
  Any command supports \`--json\` to emit a stable JSON envelope.
  Example: mood status --json
  AI Agents call the API: curl http://127.0.0.1:8788/node/status

${dim('The CLI is the human entry; the API is the AI entry.')}
${dim('MOOD is a protocol node, not an application.')}
`;

export async function run(argv) {
  const { positional, flags } = parseArgs(argv);

  // MOOD_JSON=1 switches every command to JSON output — for agents that
  // cannot add a flag to an existing invocation.
  if (process.env.MOOD_JSON === '1') {
    flags.json = true;
  }

  // No command → render the home screen.
  if (positional.length === 0 || positional[0] === 'help' || flags.help) {
    const state = loadState();
    if (flags.json) {
      emit(state, '', flags);
      return;
    }
    if (positional[0] === 'help' || flags.help) {
      process.stdout.write(HELP);
      return;
    }
    process.stdout.write(renderHomeScreen(state));
    return;
  }

  const [name, ...rest] = positional;

  try {
    const mod = await loadCommand(name);
    if (typeof mod.run !== 'function') {
      throw new Error(`command '${name}' has no run() export`);
    }
    await mod.run(rest, flags);
  } catch (err) {
    emitError(err, flags);
  }
}
