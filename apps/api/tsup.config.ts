import { defineConfig } from "tsup";

// Gera dist/server.js já com o pacote @feijuca/shared embutido.
export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  clean: true,
  noExternal: ["@feijuca/shared"],
});
