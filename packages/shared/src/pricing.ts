import { deliveryDays, type Month, type Weekdays, weekdayOf, parseISODate, type ISODate } from "./calendar";
import { CLUB_ROTATION, FEIJOADA_SLUG, FEIJOADA_WEEKDAYS, STORE } from "./store";

export type Meals = "LUNCH" | "DINNER" | "BOTH";

/** Desconto do Clube sobre o preço do cardápio. */
export const CLUB_DISCOUNT: Record<Meals, number> = { LUNCH: 0.1, DINNER: 0.1, BOTH: 0.15 };
export const CLUB_BASE_PRICE_CENTS = 2500; // preço dos "Pratos da Lu"
export const CLUB_MAX_PAUSES = 5;
export const CLUB_MAX_PEOPLE = 6;

export const MEALS_LABEL: Record<Meals, string> = { LUNCH: "Almoço", DINNER: "Janta", BOTH: "Almoço e janta" };

export function mealsPerDay(meals: Meals): number {
  return meals === "BOTH" ? 2 : 1;
}

export function clubUnitPrice(priceCents: number, meals: Meals): number {
  return Math.round(priceCents * (1 - CLUB_DISCOUNT[meals]));
}

/** Quanto um prato custa a mais que o prato base no Clube (ex.: feijoada). */
export function clubUpcharge(priceCents: number, meals: Meals): number {
  return Math.max(0, clubUnitPrice(priceCents, meals) - clubUnitPrice(CLUB_BASE_PRICE_CENTS, meals));
}

export interface ClubQuote {
  month: Month;
  deliveryDays: number;
  mealsCount: number;
  unitPriceCents: number;
  totalCents: number;
  retailCents: number;
  savingsCents: number;
  feijoadaUpchargeCents: number;
}

/** Preço de um plano com pratos base (R$ 25). Dias de feijoada somam o adicional depois. */
export function quoteClub(input: {
  month: Month;
  meals: Meals;
  weekdays: Weekdays;
  people: number;
  feijoadaPriceCents: number;
  deliveryFeeCents?: number;
}): ClubQuote {
  const fee = input.deliveryFeeCents ?? STORE.defaultDeliveryFeeCents;
  const days = deliveryDays(input.month, input.weekdays).length;
  const perDay = mealsPerDay(input.meals);
  const mealsCount = days * perDay * input.people;
  const unit = clubUnitPrice(CLUB_BASE_PRICE_CENTS, input.meals);
  const totalCents = mealsCount * unit;
  const retailCents = mealsCount * CLUB_BASE_PRICE_CENTS + days * perDay * fee;
  return {
    month: input.month,
    deliveryDays: days,
    mealsCount,
    unitPriceCents: unit,
    totalCents,
    retailCents,
    savingsCents: retailCents - totalCents,
    feijoadaUpchargeCents: clubUpcharge(input.feijoadaPriceCents, input.meals),
  };
}

export interface PricedDay {
  paused: boolean;
  priceCents: number; // preço de cardápio do prato escolhido
  isFeijoada?: boolean;
}

export interface SubscriptionTotals {
  activeDays: number;
  pausedDays: number;
  mealsCount: number;
  feijoadaDays: number;
  totalCents: number;
  retailCents: number;
  savingsCents: number;
}

/** Total real do mês conforme os pratos escolhidos e os dias pausados. */
export function priceSubscription(input: {
  meals: Meals;
  people: number;
  days: PricedDay[];
  deliveryFeeCents?: number;
}): SubscriptionTotals {
  const fee = input.deliveryFeeCents ?? STORE.defaultDeliveryFeeCents;
  const perDay = mealsPerDay(input.meals);
  const k = perDay * input.people;
  let total = 0, retail = 0, active = 0, paused = 0, feij = 0;
  for (const d of input.days) {
    if (d.paused) { paused++; continue; }
    active++;
    if (d.isFeijoada) feij++;
    total += clubUnitPrice(d.priceCents, input.meals) * k;
    retail += d.priceCents * k + fee * perDay;
  }
  return {
    activeDays: active,
    pausedDays: paused,
    mealsCount: active * k,
    feijoadaDays: feij,
    totalCents: total,
    retailCents: retail,
    savingsCents: retail - total,
  };
}

/** Prato sugerido para um dia: feijoada às quartas e sábados, revezamento nos outros. */
export function suggestedDishSlug(date: ISODate): string {
  if (FEIJOADA_WEEKDAYS.includes(weekdayOf(date))) return FEIJOADA_SLUG;
  return CLUB_ROTATION[parseISODate(date).d % CLUB_ROTATION.length];
}
