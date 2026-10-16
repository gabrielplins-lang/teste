import { Router } from "express";
import { clubQuoteSchema, createSubscriptionSchema, updateDaySchema } from "@feijuca/shared";
import { createSubscription, getSubscription, quote, updateDay } from "./club.service";

export const clubRoutes = Router();

clubRoutes.post("/quote", async (req, res) => {
  res.json(await quote(clubQuoteSchema.parse(req.body)));
});

clubRoutes.post("/subscriptions", async (req, res) => {
  res.status(201).json(await createSubscription(createSubscriptionSchema.parse(req.body)));
});

clubRoutes.get("/subscriptions/:id", async (req, res) => {
  res.json(await getSubscription(req.params.id));
});

clubRoutes.patch("/subscriptions/:id/days/:date", async (req, res) => {
  res.json(await updateDay(req.params.id, req.params.date, updateDaySchema.parse(req.body)));
});
