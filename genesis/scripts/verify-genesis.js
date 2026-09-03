const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const genesisDir = path.join(__dirname, "..");
const files = [
  "genesis.json",
  "contributors.json",
  "contributions.json",
  "genesis-proofs.json",
  "genesis-reputation.json",
];

const combined = files
  // The first record was generated from a Windows checkout. Canonicalize each
  // source file to its recorded CRLF representation so verification remains
  // reproducible from Linux, macOS, and GitHub's LF-rendered source.
  .map((file) => fs.readFileSync(path.join(genesisDir, file), "utf8").replace(/\r?\n/g, "\r\n"))
  .join("\n---\n");
const computed = crypto.createHash("sha256").update(combined, "utf8").digest("hex");
const recordedText = fs.readFileSync(path.join(genesisDir, "genesis-hash.txt"), "utf8");
const recorded = recordedText.match(/SHA256:\s*([a-f0-9]{64})/)?.[1];

console.log(`Computed SHA256: ${computed}`);
console.log(`Recorded SHA256: ${recorded ?? "missing"}`);
if (!recorded || computed !== recorded) {
  console.error("Genesis state is INVALID");
  process.exit(1);
}
console.log("Genesis state is VALID");
