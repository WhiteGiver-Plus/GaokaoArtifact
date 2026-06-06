import { defineConfig } from "vite";

export default defineConfig({
  root: "gh_pages_local_game",
  server: {
    host: "127.0.0.1",
    port: 5175,
    strictPort: false
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
