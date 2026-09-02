import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repoRoot = new URL("../../../", import.meta.url);
const webRoot = new URL("../", import.meta.url);

async function readRepo(relativePath) {
  return readFile(new URL(relativePath, repoRoot));
}

async function readWeb(relativePath) {
  return readFile(new URL(relativePath, webRoot), "utf8");
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

test("all published MOODISM source editions remain byte-identifiable", async () => {
  const expected = {
    "docs/manifesto/MOODISM_MANIFESTO_001_ZH.md": "8A2A6E9C3A84BEFDA5770743EDD0561B936EA9A13381A73A135DAF3D62542927",
    "docs/manifesto/MOODISM_MANIFESTO_001_EN.md": "054E5BCA9DB2E759A0B88C4E32BACE9B76AABE24B3889339C2F36DA27EF96E6C",
    "docs/manifesto/MOODISM_MANIFESTO_001_V0.2_ZH.md": "CD0041372F6045A9E7E26678D65DDBC376D6C48BB3D1674A34B121EB12656307",
    "docs/manifesto/MOODISM_MANIFESTO_001_V0.2_EN.md": "81239C29BAE97FB45E41A0BC9258B08B289896BDEFE1ABDE11B810FCC9D4ECBF",
    "docs/manifesto/MOODISM_MANIFESTO_001_V0.3_ZH.md": "9DB8FC9EA7DDE97276240774A253FB8D47A53C58C8E3B8B00373B64102054323",
    "docs/manifesto/MOODISM_MANIFESTO_001_V0.3_EN.md": "3175621B4E41BFEECE3CAAAA78711B600AA0C408F1F384AF97FD4D417176877B",
  };

  for (const [path, hash] of Object.entries(expected)) {
    assert.equal(sha256(await readRepo(path)), hash, `${path} changed; publish a new version instead of rewriting history`);
  }
});

test("the website keeps old routes while making v0.3 the current reading edition", async () => {
  const loader = await readWeb("lib/mood-content.ts");
  const currentZh = await readWeb("app/manifesto/moodism/page.tsx");
  const currentEn = await readWeb("app/manifesto/moodism/en/page.tsx");
  const oldZh = await readWeb("app/manifesto/moodism/v0.1/page.tsx");
  const oldEn = await readWeb("app/manifesto/moodism/v0.1/en/page.tsx");
  const v02Zh = await readWeb("app/manifesto/moodism/v0.2/page.tsx");
  const v02En = await readWeb("app/manifesto/moodism/v0.2/en/page.tsx");

  assert.match(loader, /MOODISM_MANIFESTO_001_V0\.3_ZH\.md/);
  assert.match(loader, /MOODISM_MANIFESTO_001_V0\.3_EN\.md/);
  assert.match(loader, /MOODISM_MANIFESTO_001_V0\.2_ZH\.md/);
  assert.match(loader, /MOODISM_MANIFESTO_001_V0\.2_EN\.md/);
  assert.match(loader, /MOODISM_MANIFESTO_001_ZH\.md/);
  assert.match(loader, /MOODISM_MANIFESTO_001_EN\.md/);
  assert.match(currentZh, /v0\.2/);
  assert.match(currentEn, /v0\.2/);
  assert.match(oldZh, /阅读 v0\.3/);
  assert.match(oldEn, /Read v0\.3/);
  assert.match(v02Zh, /阅读 v0\.3/);
  assert.match(v02En, /Read v0\.3/);
});
