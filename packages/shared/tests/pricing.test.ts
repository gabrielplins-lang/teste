import { describe, expect, it } from "vitest";
import {
  canChangeDay, clubUnitPrice, clubUpcharge, deliveryDays, holidays, priceSubscription, quoteClub, suggestedDishSlug,
} from "../src";

describe("calendário", () => {
  it("novembro de 2026 tem 19 dias de entrega de seg a sex (sem Finados e Consciência Negra)", () => {
    expect(deliveryDays("2026-11", 5)).toHaveLength(19);
  });

  it("inclui feriados do Rio e a Sexta-feira Santa", () => {
    const h = holidays(2026);
    expect(h["2026-04-23"]).toBe("São Jorge");
    expect(h["2026-01-20"]).toBe("São Sebastião");
    expect(h["2026-04-03"]).toBe("Sexta-feira Santa");
  });

  it("troca de prato vale até 20h do dia anterior (Brasília)", () => {
    expect(canChangeDay("2026-11-10", new Date("2026-11-09T19:59:00-03:00"))).toBe(true);
    expect(canChangeDay("2026-11-10", new Date("2026-11-09T20:00:00-03:00"))).toBe(false);
  });

  it("sugere feijoada às quartas e sábados", () => {
    expect(suggestedDishSlug("2026-11-04")).toBe("feijoada-da-lu"); // quarta
    expect(suggestedDishSlug("2026-11-05")).not.toBe("feijoada-da-lu");
  });
});

describe("preços do Clube", () => {
  it("aplica 15% para almoço e janta e 10% para uma refeição", () => {
    expect(clubUnitPrice(2500, "BOTH")).toBe(2125);
    expect(clubUnitPrice(2500, "LUNCH")).toBe(2250);
  });

  it("feijoada vira adicional sobre o prato base", () => {
    expect(clubUpcharge(3500, "BOTH")).toBe(850);
    expect(clubUpcharge(3500, "DINNER")).toBe(900);
    expect(clubUpcharge(2500, "BOTH")).toBe(0);
  });

  it("orça novembro/2026, almoço e janta, 1 pessoa", () => {
    const q = quoteClub({ month: "2026-11", meals: "BOTH", weekdays: 5, people: 1, feijoadaPriceCents: 3500, deliveryFeeCents: 700 });
    expect(q.mealsCount).toBe(38);
    expect(q.totalCents).toBe(80750);
    expect(q.retailCents).toBe(121600);
    expect(q.savingsCents).toBe(40850);
  });

  it("desconta dias pausados e soma feijoada", () => {
    const t = priceSubscription({
      meals: "LUNCH", people: 2, deliveryFeeCents: 700,
      days: [
        { paused: false, priceCents: 2500 },
        { paused: false, priceCents: 3500, isFeijoada: true },
        { paused: true, priceCents: 2500 },
      ],
    });
    expect(t.activeDays).toBe(2);
    expect(t.pausedDays).toBe(1);
    expect(t.mealsCount).toBe(4);
    expect(t.feijoadaDays).toBe(1);
    expect(t.totalCents).toBe(2250 * 2 + 3150 * 2);
  });
});
