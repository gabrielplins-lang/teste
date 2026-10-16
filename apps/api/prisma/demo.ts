/**
 * Dados de DEMONSTRAÇÃO (clientes e pedidos fictícios) para apresentar o painel.
 * Rodar com `npm run db:demo`. Não use em produção.
 */
import { PrismaClient, type Channel, type OrderStatus, type PaymentMethod } from "@prisma/client";
import { deliveryDays, nextMonth, suggestedDishSlug, todayInBrazil } from "@feijuca/shared";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  const p = (slug: string) => {
    const found = products.find((x) => x.slug === slug);
    if (!found) throw new Error(`Rode o seed antes: produto ${slug} não existe`);
    return found;
  };

  const orders: { name: string; phone: string; hood: string; channel: Channel; status: OrderStatus; pay: PaymentMethod; items: [string, number][]; notes?: string }[] = [
    { name: "Marcos Ribeiro", phone: "21990000101", hood: "Freguesia", channel: "APP", status: "NEW", pay: "PIX", items: [["feijoada-da-lu", 2]] },
    { name: "Ana Paula Souza", phone: "21990000102", hood: "Taquara", channel: "WHATSAPP", status: "NEW", pay: "CASH", items: [["estrogonofe", 1], ["frango-a-parmegiana", 1], ["coca-cola", 1]], notes: "Troco para 100" },
    { name: "Cliente iFood", phone: "21990000103", hood: "Pechincha", channel: "IFOOD", status: "PREPARING", pay: "IFOOD", items: [["combo-p-3-coca", 1]] },
    { name: "Júlio César", phone: "21990000104", hood: "Anil", channel: "APP", status: "PREPARING", pay: "CARD", items: [["lasanha", 1], ["coca-cola-zero", 1]] },
    { name: "Cliente iFood", phone: "21990000105", hood: "Tanque", channel: "IFOOD", status: "OUT_FOR_DELIVERY", pay: "IFOOD", items: [["escondidinho-a-bolonhesa", 2]] },
    { name: "Dona Cida", phone: "21990000106", hood: "Pechincha", channel: "WHATSAPP", status: "DELIVERED", pay: "PIX", items: [["feijoada-p-3", 1]] },
  ];

  for (const o of orders) {
    const customer = await prisma.customer.upsert({ where: { phone: o.phone }, update: {}, create: { name: o.name, phone: o.phone } });
    const zone = await prisma.deliveryZone.findUnique({ where: { neighborhood: o.hood } });
    const items = o.items.map(([slug, quantity]) => ({ productId: p(slug).id, name: p(slug).name, unitPriceCents: p(slug).priceCents, quantity }));
    const subtotal = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
    const fee = zone?.feeCents ?? 700;
    await prisma.order.create({
      data: {
        channel: o.channel, status: o.status, customerId: customer.id, customerName: o.name, customerPhone: o.phone,
        addressLine: "Rua de exemplo, 100", neighborhood: o.hood, paymentMethod: o.pay,
        paymentStatus: o.pay === "IFOOD" || o.status === "DELIVERED" ? "PAID" : "PENDING",
        subtotalCents: subtotal, deliveryFeeCents: fee, totalCents: subtotal + fee, notes: o.notes,
        items: { create: items },
      },
    });
  }

  // Assinantes do Clube no mês atual e no próximo
  const today = todayInBrazil();
  const months = [today.slice(0, 7), nextMonth()];
  const subs: [string, string, "LUNCH" | "DINNER" | "BOTH", number, string][] = [
    ["Fernanda Martins", "21990000201", "BOTH", 1, "Freguesia"],
    ["Roberto Lima", "21990000202", "LUNCH", 3, "Taquara"],
    ["Patrícia Alves", "21990000203", "DINNER", 1, "Pechincha"],
    ["Carlos Andrade", "21990000204", "BOTH", 2, "Anil"],
    ["Luana Santos", "21990000205", "LUNCH", 1, "Curicica"],
  ];
  for (const month of months) {
    for (const [name, phone, meals, people, hood] of subs) {
      const customer = await prisma.customer.upsert({ where: { phone }, update: {}, create: { name, phone } });
      await prisma.subscription.create({
        data: {
          month, meals, people, weekdays: 5, paymentMethod: "PIX", neighborhood: hood, customerId: customer.id,
          lunchAddress: `Rua de exemplo, 200 · ${hood}`, dinnerAddress: `Rua de exemplo, 200 · ${hood}`,
          days: { create: deliveryDays(month, 5).map((date) => ({ date, productId: p(suggestedDishSlug(date)).id })) },
        },
      });
    }
  }
  console.log(`Demonstração criada: ${orders.length} pedidos de hoje e ${subs.length} assinantes por mês.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
