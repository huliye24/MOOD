import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(root, "..", "..");
const removedRoutes = ["listen", "playlists", "studio", "track", "t", "c", "whitepaper", "evidence", "beta-login", "console", "drafts", "inbox"];

test("Moodify application surfaces are absent from the MOOD web app", async () => {
  for (const route of removedRoutes) {
    await assert.rejects(access(path.join(root, "app", route)), undefined, `/${route} must remain outside MOOD`);
  }
  await assert.rejects(access(path.join(root, "lib", "music-client.ts")));
  await assert.rejects(access(path.join(root, "components", "ui", "audio.tsx")));
});

test("public MOOD identity has no Moodify branding", async () => {
  const files = [
    "app/token/page.tsx",
    "app/library/page.tsx",
    "components/mood/MoodShell.tsx",
    "public/manifest.webmanifest",
    "public/sw.js",
  ];
  for (const file of files) {
    const source = await readFile(path.join(root, file), "utf8");
    assert.doesNotMatch(source, /Moodify|moodify|rongjingmusic/i, `${file} leaks application branding`);
  }
});

test("manifesto defines the protocol/application boundary", async () => {
  const boundary = await readFile(path.join(repositoryRoot, "docs", "manifesto", "mood-not-moodify.md"), "utf8");
  assert.match(boundary, /MOOD is the protocol\. Moodify is an independent application built on the protocol\./);
  assert.match(boundary, /compatibility fact/);
});
