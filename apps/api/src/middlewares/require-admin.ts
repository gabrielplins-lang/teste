import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../lib/http-error";

/** Protege as rotas do painel de gestão. Espera "Authorization: Bearer <token>". */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) throw new HttpError(401, "Faça login no painel");
  try {
    jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    throw new HttpError(401, "Sessão expirada, entre de novo");
  }
};
