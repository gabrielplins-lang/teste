/**
 * Testes de ponta a ponta da API. Precisam de um banco com migrations e seed aplicados:
 *   npm run db:deploy -w @feijuca/api && npm run db:seed -w @feijuca/api
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { nextMonth } from "@feijuca/shared";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";

const app = createApp();
const phone = "21900000001";
let token = "";

beforeAll(async () => {
  await prisma.customer.deleteMany({ where: { phone } }).catch(() => {});
  const res = await request(app).post("/api/auth/login").send({ password: "senha-de-teste" });
  token = res.body.token;
});

afterAll(async () => {
  const c = await prisma.customer.findUnique({ where: { phone } });
  if (c) {
    await prisma.order.deleteMany({ where: { customerId: c.id } });
    await prisma.subscription.deleteMany({ where: { customerId: c.id } });
    await prisma.customer.delete({ where: { id: c.id } });
  }
  await prisma.$disconnect();
});

describe("loja", () => {
  it("lista o cardápio por categoria", async () => {
    const res = await request(app).get("/api/catalog").expect(200);
    const names = res.body.flatMap((c: { products: { name: string }[] }) => c.products.map((p) => p.name));
    expect(names).toContain("Feijoada da Lu");
  });

  it("cria pedido com preço e frete calculados no servidor", async () => {
    const cat = (await request(app).get("/api/catalog")).body;
    const feij = cat[0].products.find((p: { slug: string }) => p.slug === "feijoada-da-lu");
    const res = await request(app)
      .post("/api/orders")
      .send({
        customer: { name: "Teste", phone },
        fulfillment: "DELIVERY",
        address: { street: "Rua Teste", number: "1", neighborhood: "Freguesia" },
        paymentMethod: "PIX",
        items: [{ productId: feij.id, quantity: 2 }],
      })
      .expect(201);
    expect(res.body.subtotalCents).toBe(7000);
    expect(res.body.deliveryFeeCents).toBe(500);
    expect(res.body.totalCents).toBe(7500);

    // A Lu avança o status no painel
    await request(app).patch(`/api/admin/orders/${res.body.id}/status`).set("Authorization", `Bearer ${token}`).send({ status: "PREPARING" }).expect(200);
    await request(app).patch(`/api/admin/orders/${res.body.id}/status`).set("Authorization", `Bearer ${token}`).send({ status: "DELIVERED" }).expect(400);
  });

  it("bloqueia o painel sem login", async () => {
    await request(app).get("/api/admin/orders").expect(401);
  });
});

describe("Clube da Lu", () => {
  it("cria assinatura com cardápio sugerido e permite trocar e pausar dias", async () => {
    const month = nextMonth();
    const res = await request(app)
      .post("/api/club/subscriptions")
      .send({
        customer: { name: "Teste", phone },
        month, meals: "BOTH", weekdays: 5, people: 1, paymentMethod: "PIX",
        lunchAddress: { street: "Rua Teste", number: "1", neighborhood: "Taquara" },
      })
      .expect(201);
    expect(res.body.days.length).toBeGreaterThan(15);

    const day = res.body.days.find((d: { canChange: boolean }) => d.canChange);
    const paused = await request(app).patch(`/api/club/subscriptions/${res.body.id}/days/${day.date}`).send({ paused: true }).expect(200);
    expect(paused.body.totals.pausedDays).toBe(1);

    const active = paused.body.days.find((d: { paused: boolean }) => !d.paused);
    const kitchen = await request(app).get(`/api/admin/kitchen?date=${active.date}`).set("Authorization", `Bearer ${token}`).expect(200);
    expect(kitchen.body.club.length).toBeGreaterThan(0);
  });
});
