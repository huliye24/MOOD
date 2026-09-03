/**
 * Internal shim for tweetnacl-util.
 *
 * tweetnacl-util is CommonJS and Node's ESM lexer cannot statically
 * detect its named exports, so `import { encodeBase64 } from
 * 'tweetnacl-util'` fails at link time. This module performs the default
 * import once and re-exports the helpers as real named ESM exports.
 *
 * @module internal/nacl-util
 */

import naclUtil from 'tweetnacl-util';

export const { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } = naclUtil;
