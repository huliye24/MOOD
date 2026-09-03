/**
 * API key middleware — optional, off by default.
 *
 * The API binds to 127.0.0.1 only, so by default no key is required:
 * anything that can reach the port is already on this machine. When the
 * operator starts the API with a key (MOOD_API_KEY env — `mood api start
 * --key <secret>`), every endpoint except /health requires:
 *
 *   Authorization: Bearer <API_KEY>
 *
 * The key lives only in process memory. It is never written to disk,
 * never logged, never echoed. Comparison is constant-time.
 *
 * /health stays open so liveness probes (monitoring agents, container
 * health checks) can check availability without holding the key — it
 * reveals only that the service is up.
 */

import { timingSafeEqual } from 'crypto';

export function createAuthMiddleware({ apiKey } = {}) {
  const required = typeof apiKey === 'string' && apiKey.length > 0 ? apiKey : null;

  if (!required) {
    return (req, res, next) => next();
  }

  return (req, res, next) => {
    const header = req.get('authorization') || '';
    const [scheme, value] = header.split(' ', 2);

    if (scheme !== 'Bearer' || !value || !keysMatch(value, required)) {
      res.status(401).json({
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid API key',
        },
      });
      return;
    }
    next();
  };
}

/**
 * Constant-time string comparison.
 */
function keysMatch(presented, expected) {
  const a = Buffer.from(String(presented));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) {
    // Compare against self to keep timing flat, then fail.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
