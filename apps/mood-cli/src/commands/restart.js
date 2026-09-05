/**
 * `mood restart` — stop the node daemon (if running), then start it again.
 *
 * Node Deployment Alpha 001 operator command. Restart owns no lifecycle
 * logic of its own: it composes stopNode() and startNode() so there is
 * exactly one implementation of node start/stop semantics.
 */

import { emit, renderKeyValue, green } from '../ui/terminal.js';
import { effectiveStatus, loadState } from '../state.js';
import { stopNode } from './stop.js';
import { startNode } from './start.js';

export async function run(args, flags) {
  const wasRunning = effectiveStatus() === 'Running';
  const stopResult = wasRunning
    ? await stopNode()
    : { stopped: false, wasRunning: false, clean: null };

  const startResult = await startNode();

  const result = {
    restarted: startResult.started || startResult.alreadyRunning,
    wasRunning: stopResult.wasRunning,
    cleanStop: stopResult.clean,
    ...startResult,
  };

  if (flags.json) {
    emit(result, '', flags);
    return;
  }

  process.stdout.write(renderKeyValue('MOOD Node restarted.', [
    ['Was running:', stopResult.wasRunning ? 'yes' : 'no (was stopped)'],
    ['Stop:', stopResult.wasRunning ? (stopResult.clean ? 'clean' : 'forced') : '—'],
    ['Status:', green(startResult.status || 'Running')],
    ['PID:', String(startResult.pid)],
    ['Node:', loadState().nodeId || '—'],
  ]));
}

export default { run };
