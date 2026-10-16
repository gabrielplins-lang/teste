import type { CashReport, Channel, DeliveriesReport, KitchenReport, SubscriberRow } from "@feijuca/shared";
import { CHANNEL_FEE_RATE, FEIJOADA_SLUG, brazilDayRange, clubUnitPrice, mealsPerDay, priceSubscription } from "@feijuca/shared";
import { prisma } from "../../lib/prisma";
import { toOrderDTO } from "../orders/orders.service";

/** Assinaturas que entregam numa data (dia não pausado, assinatura ativa). */
async function clubDeliveriesOn(date: string) {
  return prisma.subscriptionDay.findMany({
    where: { date, paused: false, subscription: { status: "ACTIVE" } },
    include: { product: true, subscription: true },
  });
}

/** O que a cozinha precisa produzir: Clube do dia + pedidos avulsos do dia. */
export async function kitchenReport(date: string): Promise<KitchenReport> {
  const club = new Map<string, { productId: string; name: string; quantity: number }>();
  for (const d of await clubDeliveriesOn(date)) {
    const qty = mealsPerDay(d.subscription.meals) * d.subscription.people;
    const row = club.get(d.productId) ?? { productId: d.productId, name: d.product.name, quantity: 0 };
    row.quantity += qty;
    club.set(d.productId, row);
  }

  const { start, end } = brazilDayRange(date);
  const items = await prisma.orderItem.groupBy({
    by: ["productId", "name"],
    where: { order: { createdAt: { gte: start, lt: end }, status: { not: "CANCELED" } } },
    _sum: { quantity: true },
  });
  const sort = <T extends { quantity: number }>(a: T[]) => a.sort((x, y) => y.quantity - x.quantity);
  return {
    date,
    club: sort([...club.values()]),
    orders: sort(items.map((i) => ({ productId: i.productId, name: i.name, quantity: i._sum.quantity ?? 0 }))),
  };
}

/** Rotas do motoboy: Clube agrupado por bairro + avulsos esperando entrega. */
export async function deliveriesReport(date: string): Promise<DeliveriesReport> {
  const byHood = new Map<string, { neighborhood: string; lunch: number; dinner: number }>();
  for (const d of await clubDeliveriesOn(date)) {
    const hood = d.subscription.neighborhood ?? "Sem bairro";
    const row = byHood.get(hood) ?? { neighborhood: hood, lunch: 0, dinner: 0 };
    if (d.subscription.meals !== "DINNER") row.lunch++;
    if (d.subscription.meals !== "LUNCH") row.dinner++;
    byHood.set(hood, row);
  }
  const { start, end } = brazilDayRange(date);
  const pending = await prisma.order.findMany({
    where: { createdAt: { gte: start, lt: end }, fulfillment: "DELIVERY", status: { in: ["NEW", "PREPARING", "OUT_FOR_DELIVERY"] }, channel: { not: "IFOOD" } },
    include: { items: true },
    orderBy: [{ neighborhood: "asc" }, { createdAt: "asc" }],
  });
  return {
    date,
    club: [...byHood.values()].sort((a, b) => b.lunch + b.dinner - (a.lunch + a.dinner)),
    pending: pending.map(toOrderDTO),
  };
}

/** Vendas do dia por canal e quanto fica com a Lu depois das taxas (estimativa). */
export async function cashReport(date: string): Promise<CashReport> {
  const { start, end } = brazilDayRange(date);
  const groups = await prisma.order.groupBy({
    by: ["channel"],
    where: { createdAt: { gte: start, lt: end }, status: { not: "CANCELED" } },
    _sum: { totalCents: true },
    _count: true,
  });
  const rows = new Map<Channel, { orders: number; grossCents: number }>();
  for (const g of groups) rows.set(g.channel, { orders: g._count, grossCents: g._sum.totalCents ?? 0 });

  // Receita do Clube no dia = refeições entregues × preço do Clube
  const club = await clubDeliveriesOn(date);
  const clubGross = club.reduce((s, d) => s + clubUnitPrice(d.product.priceCents, d.subscription.meals) * mealsPerDay(d.subscription.meals) * d.subscription.people, 0);
  rows.set("CLUB", { orders: club.length, grossCents: clubGross });

  const channels = (["APP", "WHATSAPP", "IFOOD", "CLUB"] as Channel[]).map((channel) => {
    const r = rows.get(channel) ?? { orders: 0, grossCents: 0 };
    const feeCents = Math.round(r.grossCents * CHANNEL_FEE_RATE[channel]);
    return { channel, ...r, feeCents, netCents: r.grossCents - feeCents };
  });

  const cash = await prisma.order.aggregate({
    where: { createdAt: { gte: start, lt: end }, paymentMethod: "CASH", paymentStatus: "PENDING", status: { not: "CANCELED" } },
    _sum: { totalCents: true },
  });
  return { date, channels, pendingCashCents: cash._sum.totalCents ?? 0 };
}

export async function listSubscribers(month?: string): Promise<SubscriberRow[]> {
  const subs = await prisma.subscription.findMany({
    where: month ? { month } : {},
    include: { customer: true, days: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return subs.map((s) => ({
    id: s.id,
    customerName: s.customer.name,
    customerPhone: s.customer.phone,
    meals: s.meals,
    people: s.people,
    neighborhood: s.neighborhood,
    status: s.status,
    month: s.month,
    totalCents: priceSubscription({
      meals: s.meals, people: s.people,
      days: s.days.map((d) => ({ paused: d.paused, priceCents: d.product.priceCents, isFeijoada: d.product.slug === FEIJOADA_SLUG })),
    }).totalCents,
  }));
}
