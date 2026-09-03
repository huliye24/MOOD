/**
 * Cursor adapter (optional detection).
 *
 * Cursor is a GUI editor, so its markers differ per platform. Detection
 * is existence-only: this adapter never launches Cursor, never reads
 * configuration contents, and never touches credentials.
 */

import { join } from 'path';

export default {
  key: 'cursor',
  name: 'Cursor',
  vendor: 'Anysphere',
  type: 'coding-agent',
  commands: ['cursor'],
  configPaths: [],
  installPaths: (env, userHome) => {
    if (process.platform === 'win32') {
      return env.LOCALAPPDATA
        ? [join(env.LOCALAPPDATA, 'Programs', 'cursor')]
        : [];
    }
    if (process.platform === 'darwin') {
      return ['/Applications/Cursor.app'];
    }
    return [join(userHome, '.config', 'Cursor'), '/usr/bin/cursor'];
  },
};
