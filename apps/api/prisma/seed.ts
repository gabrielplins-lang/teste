/**
 * Popula o banco com o cardápio real da Feijuca da Lu e as taxas de entrega de Jacarepaguá.
 * Rodar com `npm run db:seed`. Pode rodar de novo: só cria o que falta, sem mexer no que a Lu editou.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { slug: "feijoadas", name: "Feijoadas" },
  { slug: "pratos-da-lu", name: "Pratos da Lu" },
  { slug: "classicos-do-forno", name: "Clássicos do forno" },
  { slug: "bebidas", name: "Bebidas" },
  { slug: "sobremesas", name: "Sobremesa por encomenda" },
];

const products = [
  { slug: "feijoada-da-lu", cat: "feijoadas", name: "Feijoada da Lu", priceCents: 3500, featured: true, clubEligible: true,
    description: "500g de feijoada, 300g de arroz, 200g de couve e saquinho de farofa." },
  { slug: "feijoada-p-3", cat: "feijoadas", name: "Feijoada p/ 3", priceCents: 9500, serves: 3, featured: true,
    description: "1kg de feijoada, 750g de arroz e acompanhamentos. Foto ilustrativa, não contém laranja." },
  { slug: "combo-p-3-coca", cat: "feijoadas", name: "Combo p/ 3 pessoas + Coca", priceCents: 10500, serves: 3,
    description: "Feijoada p/ 3 acompanhada de Coca-Cola." },
  { slug: "estrogonofe", cat: "pratos-da-lu", name: "Estrogonofe", priceCents: 2500, featured: true, clubEligible: true,
    description: "Estrogonofe com batata palha e arroz." },
  { slug: "lasanha", cat: "pratos-da-lu", name: "Lasanha", priceCents: 2500, clubEligible: true,
    description: "Lasanha à bolonhesa gratinada com queijo." },
  { slug: "panqueca-a-bolonhesa", cat: "pratos-da-lu", name: "Panqueca à bolonhesa", priceCents: 2500, clubEligible: true,
    description: "500g: duas panquecas com queijo e 300g de arroz." },
  { slug: "escondidinho-a-bolonhesa", cat: "classicos-do-forno", name: "Escondidinho à bolonhesa", priceCents: 2500, clubEligible: true,
    description: "Escondidinho à bolonhesa, com camadas cremosas de purê." },
  { slug: "frango-a-parmegiana", cat: "classicos-do-forno", name: "Frango à parmegiana", priceCents: 2500, clubEligible: true,
    description: "Frango à parmegiana, acompanha arroz, feijão e batata frita." },
  { slug: "coca-cola", cat: "bebidas", name: "Coca-Cola", priceCents: 1500, description: "Coca-Cola geladinha." },
  { slug: "coca-cola-zero", cat: "bebidas", name: "Coca-Cola Zero", priceCents: 1500, description: "Coca-Cola Zero bem gelada." },
  { slug: "pudim-gg", cat: "sobremesas", name: "Pudim GG", priceCents: 7000, compareAtCents: 8000, preorder: true,
    description: "Pudim cremoso, com calda dourada de caramelo. Por encomenda." },
];

// Taxas de entrega de exemplo por bairro (ajustar com a Lu).
const zones = [
  { neighborhood: "Freguesia", feeCents: 500, etaMin: 25, etaMax: 40 },
  { neighborhood: "Pechincha", feeCents: 500, etaMin: 25, etaMax: 40 },
  { neighborhood: "Taquara", feeCents: 700, etaMin: 30, etaMax: 45 },
  { neighborhood: "Tanque", feeCents: 700, etaMin: 30, etaMax: 45 },
  { neighborhood: "Anil", feeCents: 700, etaMin: 30, etaMax: 45 },
  { neighborhood: "Gardênia Azul", feeCents: 800, etaMin: 35, etaMax: 50 },
  { neighborhood: "Curicica", feeCents: 900, etaMin: 35, etaMax: 55 },
  { neighborhood: "Cidade de Deus", feeCents: 900, etaMin: 35, etaMax: 55 },
  { neighborhood: "Praça Seca", feeCents: 900, etaMin: 35, etaMax: 55 },
  { neighborhood: "Vila Valqueire", feeCents: 1000, etaMin: 40, etaMax: 60 },
];

async function main() {
  const catIds: Record<string, string> = {};
  for (const [position, c] of categories.entries()) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: { name: c.name, position }, create: { ...c, position } });
    catIds[c.slug] = row.id;
  }
  for (const [position, p] of products.entries()) {
    const { cat, ...data } = p;
    const imageUrl = `/img/produtos/${p.slug}.jpg`;
    // Produto que já existe não é alterado: preço e status são editados pela Lu no painel.
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...data, imageUrl, position, categoryId: catIds[cat] },
    });
  }
  for (const z of zones) {
    await prisma.deliveryZone.upsert({ where: { neighborhood: z.neighborhood }, update: {}, create: z });
  }
  console.log(`Cardápio: ${products.length} produtos · Bairros: ${zones.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
