import type { Channel, CreateOrderInput, OrderDTO, OrderStatus } from "@feijuca/shared";
import { NEXT_STATUS, STORE, brazilDayRange, formatBRL } from "@feijuca/shared";
import type { Order, OrderItem, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { badRequest, notFound } from "../../lib/http-error";
import { deliveryFeeFor } from "../catalog/catalog.service";

type OrderWithItems = Order & { items: OrderItem[] };

export function toOrderDTO(o: OrderWithItems): OrderDTO {
  return {
    id: o.id, number: o.number, status: o.status, channel: o.channel, customerName: o.customerName,
    customerPhone: o.customerPhone, fulfillment: o.fulfillment, addressLine: o.addressLine, neighborhood: o.neighborhood,
    paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus, changeForCents: o.changeForCents,
    subtotalCents: o.subtotalCents, deliveryFeeCents: o.deliveryFeeCents, totalCents: o.totalCents, notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({ productId: i.productId, name: i.name, unitPriceCents: i.unitPriceCents, quantity: i.quantity, notes: i.notes })),
  };
}

/** Cria o pedido calculando os preços no servidor (nunca confiar no valor que vem do app). */
export async function createOrder(input: CreateOrderInput, channel: Channel = "APP"): Promise<OrderDTO> {
  const ids = [...new Set(input.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
  if (products.length !== ids.length) throw badRequest("Algum item da sacola não está mais disponível");
  const byId = new Map(products.map((p) => [p.id, p]));

  const items = input.items.map((i) => {
    const p = byId.get(i.productId)!;
    return { productId: p.id, name: p.name, unitPriceCents: p.priceCents, quantity: i.quantity, notes: i.notes };
  });
  const subtotal = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
  if (channel === "APP" && subtotal < STORE.minimumOrderCents) {
    throw badRequest(`O pedido mínimo é ${formatBRL(STORE.minimumOrderCents)}`);
  }

  const delivery = input.fulfillment === "DELIVERY" && input.address;
  const fee = delivery ? await deliveryFeeFor(input.address!.neighborhood) : 0;
  const a = input.address;
  const addressLine = delivery && a
    ? [`${a.street}, ${a.number}`, a.complement, a.reference && `Ref.: ${a.reference}`].filter(Boolean).join(" · ")
    : null;

  const customer = await prisma.customer.upsert({
    where: { phone: input.customer.phone },
    update: { name: input.customer.name },
    create: input.customer,
  });

  const order = await prisma.order.create({
    data: {
      channel,
      fulfillment: input.fulfillment,
      customerId: customer.id,
      customerName: input.customer.name,
      customerPhone: input.customer.phone,
      addressLine,
      neighborhood: delivery ? a!.neighborhood : null,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "IFOOD" ? "PAID" : "PENDING",
      changeForCents: input.paymentMethod === "CASH" ? input.changeForCents : null,
      subtotalCents: subtotal,
      deliveryFeeCents: fee,
      totalCents: subtotal + fee,
      notes: input.notes,
      items: { create: items },
    },
    include: { items: true },
  });
  return toOrderDTO(order);
}

export async function getOrder(id: string): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) throw notFound("Pedido");
  return toOrderDTO(order);
}

export async function listOrders(filter: { date?: string; status?: OrderStatus }): Promise<OrderDTO[]> {
  const where: Prisma.OrderWhereInput = {};
  if (filter.date) {
    const { start, end } = brazilDayRange(filter.date);
    where.createdAt = { gte: start, lt: end };
  }
  if (filter.status) where.status = filter.status;
  const orders = await prisma.order.findMany({ where, include: { items: true }, orderBy: { createdAt: "desc" } });
  return orders.map(toOrderDTO);
}

/** Avança o status na ordem certa, ou cancela. */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw notFound("Pedido");
  if (status !== "CANCELED" && NEXT_STATUS[order.status] !== status) {
    throw badRequest("Esse pedido não pode ir para esse status agora");
  }
  const updated = await prisma.order.update({ where: { id }, data: { status }, include: { items: true } });
  return toOrderDTO(updated);
}

export async function markPaid(id: string): Promise<OrderDTO> {
  const updated = await prisma.order.update({ where: { id }, data: { paymentStatus: "PAID" }, include: { items: true } });
  return toOrderDTO(updated);
}
