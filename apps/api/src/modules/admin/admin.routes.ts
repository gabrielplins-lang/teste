import { Router } from "express";
import { z } from "zod";
import { adminCreateOrderSchema, orderStatusSchema, todayInBrazil, updateProductSchema } from "@feijuca/shared";
import { requireAdmin } from "../../middlewares/require-admin";
import { getCatalog, updateProduct } from "../catalog/catalog.service";
import { createOrder, listOrders, markPaid, updateOrderStatus } from "../orders/orders.service";
import { cashReport, deliveriesReport, kitchenReport, listSubscribers } from "./admin.service";

export const adminRoutes = Router();
adminRoutes.use(requireAdmin);

const dateQuery = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });
const day = (q: unknown) => dateQuery.parse(q).date ?? todayInBrazil();

// Pedidos
adminRoutes.get("/orders", async (req, res) => {
  const q = z.object({ date: z.string().optional(), status: orderStatusSchema.optional() }).parse(req.query);
  res.json(await listOrders({ date: q.date ?? todayInBrazil(), status: q.status }));
});

adminRoutes.post("/orders", async (req, res) => {
  const { channel, order } = adminCreateOrderSchema.parse(req.body);
  res.status(201).json(await createOrder(order, channel));
});

adminRoutes.patch("/orders/:id/status", async (req, res) => {
  const { status } = z.object({ status: orderStatusSchema }).parse(req.body);
  res.json(await updateOrderStatus(req.params.id, status));
});

adminRoutes.post("/orders/:id/paid", async (req, res) => {
  res.json(await markPaid(req.params.id));
});

// Relatórios do dia
adminRoutes.get("/kitchen", async (req, res) => res.json(await kitchenReport(day(req.query))));
adminRoutes.get("/deliveries", async (req, res) => res.json(await deliveriesReport(day(req.query))));
adminRoutes.get("/cash", async (req, res) => res.json(await cashReport(day(req.query))));

// Clube
adminRoutes.get("/subscribers", async (req, res) => {
  const { month } = z.object({ month: z.string().optional() }).parse(req.query);
  res.json(await listSubscribers(month));
});

// Cardápio
adminRoutes.get("/products", async (_req, res) => res.json(await getCatalog(true)));
adminRoutes.patch("/products/:id", async (req, res) => {
  res.json(await updateProduct(req.params.id, updateProductSchema.parse(req.body)));
});
