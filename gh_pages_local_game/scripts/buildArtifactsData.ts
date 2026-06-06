import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadArtifacts } from "../src/core/index.js";

const artifacts = await loadArtifacts();
const outputFile = path.join(process.cwd(), "gh_pages_local_game", "src", "artifacts.generated.ts");
const payload = JSON.stringify(artifacts, null, 2).replace(/</g, "\\u003c");

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(
  outputFile,
  `import type { ArtifactConfig } from "./core/browser.js";\n\nexport const LOCAL_ARTIFACTS = ${payload} satisfies ArtifactConfig[];\n`,
  "utf8"
);

console.log(`Built ${path.relative(process.cwd(), outputFile)} with ${artifacts.length} artifacts.`);
