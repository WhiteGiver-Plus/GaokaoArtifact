import { defineConfig } from "vite";

export default defineConfig({
  root: "web_game",
  publicDir: "public",
  server: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: false
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
