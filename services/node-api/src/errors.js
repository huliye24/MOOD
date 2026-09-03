/**
 * Stable machine error envelope.
 *
 * Success responses are the documented per-endpoint shapes. Every error
 * is the same shape so an AI Agent needs exactly one error parser:
 *
 *   { "ok": false, "error": { "code": "...", "message": "..." } }
 *
 * `code` is a stable machine enum (agents branch on it); `message` is
 * human-debuggable text (agents show it or log it, never parse it).
 */

export function fail(res, status, code, message) {
  res.status(status).json({
    ok: false,
    error: { code, message },
  });
}

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
