import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const configDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(configDir, "..");
const packageJson = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8")) as { version?: string };
const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || readGitCommit();
const buildTime = process.env.BUILD_TIME || new Date().toISOString();

export default defineConfig({
  root: "gh_pages_local_game",
  base: "./",
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version ?? "0.0.0"),
    __APP_COMMIT__: JSON.stringify(commit),
    __APP_BUILD_TIME__: JSON.stringify(buildTime)
  },
  server: {
    host: "127.0.0.1",
    port: 5175,
    strictPort: false
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "gh_pages_local_game/index.html",
        debug: "gh_pages_local_game/debug/index.html",
        resultDebug: "gh_pages_local_game/result-debug/index.html"
      }
    }
  }
});

function readGitCommit(): string {
  try {
    return execSync("git rev-parse --short=12 HEAD", {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "ignore"]
    })
      .toString()
      .trim() || "unknown";
  } catch {
    return "unknown";
  }
}
