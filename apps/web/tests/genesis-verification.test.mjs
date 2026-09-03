import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(webRoot, "../..");

test("public website and repository publish the same Genesis verification", async () => {
  const hashRecord = await readFile(path.join(repoRoot, "genesis/genesis-hash.txt"), "utf8");
  const siteRecord = await readFile(path.join(webRoot, "lib/genesis-verification.ts"), "utf8");
  const page = await readFile(path.join(webRoot, "app/genesis/verification/page.tsx"), "utf8");
  const id = hashRecord.match(/Genesis ID:\s*(\S+)/)?.[1];
  const sha256 = hashRecord.match(/SHA256:\s*([a-f0-9]{64})/)?.[1];
  assert.ok(id && sha256);
  assert.ok(siteRecord.includes(id));
  assert.ok(siteRecord.includes(sha256));
  assert.match(page, /GENESIS_VERIFICATION/);
  assert.match(page, /GitHub 公共记录/);
  assert.match(page, /不是上链锚定/);
});
