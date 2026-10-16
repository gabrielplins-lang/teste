import type { ClubQuoteInput, CreateSubscriptionInput, SubscriptionDTO, UpdateDayInput, AddressInput } from "@feijuca/shared";
import {
  CLUB_MAX_PAUSES, FEIJOADA_SLUG, canChangeDay, deliveryDays, priceSubscription, quoteClub, suggestedDishSlug,
} from "@feijuca/shared";
import type { Product, Subscription, SubscriptionDay } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { badRequest, notFound } from "../../lib/http-error";

type FullSubscription = Subscription & {
  customer: { name: string };
  days: (SubscriptionDay & { product: Product })[];
};

const include = { customer: { select: { name: true } }, days: { include: { product: true }, orderBy: { date: "asc" as const } } };

async function feijoadaPrice(): Promise<number> {
  const p = await prisma.product.findUnique({ where: { slug: FEIJOADA_SLUG } });
  return p?.priceCents ?? 3500;
}

export async function quote(input: ClubQuoteInput) {
  return quoteClub({ ...input, feijoadaPriceCents: await feijoadaPrice() });
}

export function toSubscriptionDTO(s: FullSubscription, now = new Date()): SubscriptionDTO {
  return {
    id: s.id,
    customerName: s.customer.name,
    meals: s.meals,
    weekdays: s.weekdays === 6 ? 6 : 5,
    people: s.people,
    month: s.month,
    status: s.status,
    neighborhood: s.neighborhood,
    paymentMethod: s.paymentMethod,
    days: s.days.map((d) => ({
      date: d.date, paused: d.paused, productId: d.productId, productName: d.product.name, canChange: canChangeDay(d.date, now),
    })),
    totals: priceSubscription({
      meals: s.meals,
      people: s.people,
      days: s.days.map((d) => ({ paused: d.paused, priceCents: d.product.priceCents, isFeijoada: d.product.slug === FEIJOADA_SLUG })),
    }),
  };
}

const line = (a?: AddressInput) =>
  a ? [`${a.street}, ${a.number}`, a.complement, a.neighborhood, a.reference && `Ref.: ${a.reference}`].filter(Boolean).join(" · ") : null;

/** Cria a assinatura do mês já com o cardápio sugerido pela Lu em cada dia. */
export async function createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionDTO> {
  if (input.meals !== "DINNER" && !input.lunchAddress) throw badRequest("Informe o endereço do almoço");
  if (input.meals === "DINNER" && !input.dinnerAddress && !input.lunchAddress) throw badRequest("Informe o endereço da janta");

  const clubProducts = await prisma.product.findMany({ where: { clubEligible: true, active: true } });
  const bySlug = new Map(clubProducts.map((p) => [p.slug, p]));
  const fallback = clubProducts[0];
  if (!fallback) throw badRequest("Nenhum prato do Clube está ativo no cardápio");

  const customer = await prisma.customer.upsert({
    where: { phone: input.customer.phone },
    update: { name: input.customer.name },
    create: input.customer,
  });

  const dates = deliveryDays(input.month, input.weekdays);
  const sub = await prisma.subscription.create({
    data: {
      month: input.month,
      meals: input.meals,
      weekdays: input.weekdays,
      people: input.people,
      paymentMethod: input.paymentMethod,
      lunchAddress: line(input.lunchAddress),
      dinnerAddress: line(input.dinnerAddress ?? input.lunchAddress),
      neighborhood: (input.lunchAddress ?? input.dinnerAddress)?.neighborhood ?? null,
      customerId: customer.id,
      days: { create: dates.map((date) => ({ date, productId: (bySlug.get(suggestedDishSlug(date)) ?? fallback).id })) },
    },
    include,
  });
  return toSubscriptionDTO(sub);
}

export async function getSubscription(id: string): Promise<SubscriptionDTO> {
  const sub = await prisma.subscription.findUnique({ where: { id }, include });
  if (!sub) throw notFound("Assinatura");
  return toSubscriptionDTO(sub);
}

/** Troca o prato ou pausa um dia, respeitando o prazo das 20h e o limite de pausas. */
export async function updateDay(id: string, date: string, input: UpdateDayInput, now = new Date()): Promise<SubscriptionDTO> {
  const sub = await prisma.subscription.findUnique({ where: { id }, include });
  if (!sub) throw notFound("Assinatura");
  const day = sub.days.find((d) => d.date === date);
  if (!day) throw notFound("Dia de entrega");
  if (!canChangeDay(date, now)) throw badRequest("O prazo para mudar este dia acabou (20h da véspera)");

  const data: { productId?: string; paused?: boolean } = {};
  if (input.productId) {
    const p = await prisma.product.findUnique({ where: { id: input.productId } });
    if (!p || !p.clubEligible || !p.active) throw badRequest("Esse prato não faz parte do Clube");
    data.productId = p.id;
    data.paused = false;
  }
  if (input.paused !== undefined) {
    const pauses = sub.days.filter((d) => d.paused && d.date !== date).length;
    if (input.paused && pauses >= CLUB_MAX_PAUSES) throw badRequest(`Você já usou as ${CLUB_MAX_PAUSES} pausas do mês`);
    data.paused = input.paused;
  }
  await prisma.subscriptionDay.update({ where: { id: day.id }, data });
  return getSubscription(id);
}
