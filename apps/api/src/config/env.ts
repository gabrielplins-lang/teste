import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1, "Defina DATABASE_URL no .env"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  ADMIN_PASSWORD: z.string().min(6, "ADMIN_PASSWORD precisa de pelo menos 6 caracteres"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET precisa de pelo menos 16 caracteres"),
  PIX_KEY: z.string().optional(),
  PIX_NAME: z.string().default("Feijuca da Lu"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Configuração inválida:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
