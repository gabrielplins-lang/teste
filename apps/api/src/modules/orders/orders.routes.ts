import { Router } from "express";
import { createOrderSchema } from "@feijuca/shared";
import { createOrder, getOrder } from "./orders.service";

export const ordersRoutes = Router();

ordersRoutes.post("/", async (req, res) => {
  const input = createOrderSchema.parse(req.body);
  res.status(201).json(await createOrder(input, "APP"));
});

// Acompanhamento do pedido pelo cliente (o id é longo e difícil de adivinhar)
ordersRoutes.get("/:id", async (req, res) => {
  res.json(await getOrder(req.params.id));
});
