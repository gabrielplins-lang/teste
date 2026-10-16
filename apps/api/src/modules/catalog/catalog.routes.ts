import { Router } from "express";
import { getCatalog, getStore } from "./catalog.service";

export const catalogRoutes = Router();

catalogRoutes.get("/store", async (_req, res) => {
  res.json(await getStore());
});

catalogRoutes.get("/catalog", async (_req, res) => {
  res.json(await getCatalog());
});
