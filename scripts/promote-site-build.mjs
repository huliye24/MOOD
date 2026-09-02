import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const webRoot = resolve(repositoryRoot, "apps/web");

await cp(resolve(webRoot, "dist"), resolve(repositoryRoot, "dist"), {
  force: true,
  recursive: true,
});

await mkdir(resolve(repositoryRoot, ".openai"), { recursive: true });
await cp(
  resolve(webRoot, ".openai/hosting.json"),
  resolve(repositoryRoot, ".openai/hosting.json"),
  { force: true },
);

console.log("Promoted the verified apps/web Sites artifact to the repository root.");
