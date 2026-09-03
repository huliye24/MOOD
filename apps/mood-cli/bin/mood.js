#!/usr/bin/env node
/**
 * MOOD CLI — entry point
 *
 * When installed globally via `npm install -g mood`, the command `mood`
 * resolves to this file. The file is intentionally tiny: it only anchors
 * module resolution and ensures uncaught errors are handled, then hands
 * control over to the real CLI implementation in src/cli.js.
 *
 * The working directory is NOT changed: commands like `mood invite create`
 * write into the user's current directory, like any Unix tool.
 */

import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cli = await import(pathToFileURL(resolve(__dirname, '..', 'src', 'cli.js')).href);
cli.run(process.argv.slice(2)).catch((err) => {
  // Always emit a stable JSON envelope on failure so AI agents can
  // parse the error rather than parsing a stack trace.
  if (process.env.MOOD_JSON === '1' || process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify({
      ok: false,
      error: err.message || String(err),
    }) + '\n');
  } else {
    process.stderr.write(`\n✗ mood: ${err.message || err}\n`);
  }
  process.exit(1);
});
