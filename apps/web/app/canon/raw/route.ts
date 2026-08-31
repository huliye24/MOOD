import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * /canon/raw — serves MOOD_CANON.md verbatim as a downloadable Markdown file.
 *
 * The Canon is the source of truth; this route exposes the same bytes that
 * the page renders, so visitors and other agents can verify identity.
 */

const CANON_FILE = "MOOD_CANON.md";

export async function GET() {
  const envOverride = process.env.MOOD_CANON_PATH;
  const candidates = envOverride
    ? [envOverride]
    : [
        path.join(process.cwd(), CANON_FILE),
        path.join(process.cwd(), "..", "..", CANON_FILE),
        path.join(process.cwd(), "..", CANON_FILE),
        path.join(process.cwd(), "..", "..", "..", CANON_FILE),
      ];
  const tried: string[] = [];
  for (const candidate of candidates) {
    tried.push(candidate);
    try {
      const body = await fs.readFile(candidate, "utf8");
      return new Response(body, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": 'attachment; filename="MOOD_CANON.md"',
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch {
      // try the next candidate
    }
  }
  return new Response(
    `# MOOD Canon — visibly unverified\n\nThe canonical file MOOD_CANON.md could not be read from disk.\n\nTried: ${tried.join(" | ")}\n`,
    {
      status: 503,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    },
  );
}
