import { defineConfig } from "vite";

export default defineConfig({
  root: "gh_pages_local_game",
  base: "./",
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
        debug: "gh_pages_local_game/debug/index.html"
      }
    }
  }
});
