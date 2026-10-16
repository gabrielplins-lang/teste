import type { CategoryDTO, ProductDTO, StoreDTO, UpdateProductInput } from "@feijuca/shared";
import { STORE } from "@feijuca/shared";
import type { Product } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { notFound } from "../../lib/http-error";

export function toProductDTO(p: Product): ProductDTO {
  return {
    id: p.id, slug: p.slug, name: p.name, description: p.description, priceCents: p.priceCents,
    compareAtCents: p.compareAtCents, imageUrl: p.imageUrl, featured: p.featured, clubEligible: p.clubEligible,
    preorder: p.preorder, serves: p.serves, active: p.active, categoryId: p.categoryId,
  };
}

export async function getCatalog(includeInactive = false): Promise<CategoryDTO[]> {
  const cats = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { products: { where: includeInactive ? {} : { active: true }, orderBy: { position: "asc" } } },
  });
  return cats.map((c) => ({ id: c.id, slug: c.slug, name: c.name, products: c.products.map(toProductDTO) }));
}

export async function getStore(): Promise<StoreDTO> {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { feeCents: "asc" } });
  return {
    name: STORE.name, slogan: STORE.slogan, address: STORE.address, whatsapp: STORE.whatsapp,
    whatsappDisplay: STORE.whatsappDisplay, instagram: STORE.instagram, openingHours: STORE.openingHours,
    minimumOrderCents: STORE.minimumOrderCents,
    zones: zones.map(({ neighborhood, feeCents, etaMin, etaMax }) => ({ neighborhood, feeCents, etaMin, etaMax })),
    pix: env.PIX_KEY ? { key: env.PIX_KEY, name: env.PIX_NAME } : null,
  };
}

export async function deliveryFeeFor(neighborhood: string): Promise<number> {
  const zone = await prisma.deliveryZone.findFirst({ where: { neighborhood: { equals: neighborhood.trim(), mode: "insensitive" } } });
  return zone?.feeCents ?? STORE.defaultDeliveryFeeCents;
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<ProductDTO> {
  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) throw notFound("Produto");
  return toProductDTO(await prisma.product.update({ where: { id }, data }));
}
