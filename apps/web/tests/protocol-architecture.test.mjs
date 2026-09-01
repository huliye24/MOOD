import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const routes = ["state-machine", "contribution-proof", "reputation", "rights", "treasury", "governance"];
const sources = ["state-machine.md", "contribution-proof.md", "reputation-engine.md", "rights-system.md", "treasury.md", "governance-process.md"];

test("Pack 003 routes and Markdown sources are present", async () => {
  await Promise.all(routes.map((route) => access(path.join(root, "app", "protocol", route, "page.tsx"))));
  await Promise.all(sources.map((source) => access(path.join(root, "content", "mood", "protocol", source))));
});

test("protocol components load Markdown and retain truth-status labels", async () => {
  const architecture = await readFile(path.join(root, "components", "mood", "ProtocolArchitecture.tsx"), "utf8");
  const loader = await readFile(path.join(root, "lib", "mood-content.ts"), "utf8");
  assert.match(architecture, /CONCEPTUAL ARCHITECTURE/);
  assert.match(architecture, /NOT AN ACTIVE-SERVICE CLAIM/);
  for (const source of sources) assert.ok(loader.includes(source), `missing ${source}`);
});
