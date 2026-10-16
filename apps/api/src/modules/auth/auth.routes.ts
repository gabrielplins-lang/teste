import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { loginSchema } from "@feijuca/shared";
import { env } from "../../config/env";
import { HttpError } from "../../lib/http-error";

export const authRoutes = Router();

authRoutes.post("/login", (req, res) => {
  const { password } = loginSchema.parse(req.body);
  const a = Buffer.from(password), b = Buffer.from(env.ADMIN_PASSWORD);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new HttpError(401, "Senha incorreta");
  const token = jwt.sign({ role: "admin" }, env.JWT_SECRET, { expiresIn: "12h" });
  res.json({ token });
});
