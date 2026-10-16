import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// Usa o DATABASE_URL do .env quando não vier do ambiente (no CI ele vem do workflow).
if (!process.env.DATABASE_URL && existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  test: {
    // Os testes de API usam um banco de verdade (DATABASE_URL) e rodam em sequência.
    fileParallelism: false,
    env: {
      ADMIN_PASSWORD: "senha-de-teste",
      JWT_SECRET: "segredo-de-teste-com-16+",
      NODE_ENV: "test",
    },
  },
});
