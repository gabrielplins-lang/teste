import { z } from "zod";
import { CLUB_MAX_PEOPLE } from "./pricing";

/** Validações usadas pelo backend (e pelo frontend antes de enviar). */

const phone = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length >= 10 && v.length <= 13, "Informe um WhatsApp com DDD");

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome"),
  phone,
});

export const addressSchema = z.object({
  street: z.string().trim().min(2, "Informe a rua"),
  number: z.string().trim().min(1, "Informe o número"),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().min(2, "Informe o bairro"),
  reference: z.string().trim().optional(),
});

export const channelSchema = z.enum(["APP", "WHATSAPP", "IFOOD", "CLUB"]);
export const paymentMethodSchema = z.enum(["PIX", "CARD", "CASH", "IFOOD"]);
export const orderStatusSchema = z.enum(["NEW", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELED"]);

export const createOrderSchema = z
  .object({
    customer: customerSchema,
    fulfillment: z.enum(["DELIVERY", "PICKUP"]),
    address: addressSchema.optional(),
    paymentMethod: paymentMethodSchema,
    changeForCents: z.number().int().positive().optional(),
    notes: z.string().trim().max(500).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().min(1).max(50),
          notes: z.string().trim().max(200).optional(),
        }),
      )
      .min(1, "A sacola está vazia"),
  })
  .refine((o) => o.fulfillment === "PICKUP" || !!o.address, { message: "Informe o endereço de entrega", path: ["address"] });

/** Pedido lançado pela Lu no painel (WhatsApp, telefone ou iFood). */
export const adminCreateOrderSchema = z.object({
  channel: channelSchema.exclude(["CLUB"]),
  order: createOrderSchema,
});

export const mealsSchema = z.enum(["LUNCH", "DINNER", "BOTH"]);
export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mês inválido");

export const clubQuoteSchema = z.object({
  month: monthSchema,
  meals: mealsSchema,
  weekdays: z.union([z.literal(5), z.literal(6)]),
  people: z.number().int().min(1).max(CLUB_MAX_PEOPLE),
});

export const createSubscriptionSchema = clubQuoteSchema.extend({
  customer: customerSchema,
  lunchAddress: addressSchema.optional(),
  dinnerAddress: addressSchema.optional(),
  paymentMethod: z.enum(["PIX", "CARD"]),
});

export const updateDaySchema = z
  .object({ productId: z.string().optional(), paused: z.boolean().optional() })
  .refine((v) => v.productId !== undefined || v.paused !== undefined, "Nada para alterar");

export const loginSchema = z.object({ password: z.string().min(1) });

export const updateProductSchema = z.object({
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  priceCents: z.number().int().positive().optional(),
  compareAtCents: z.number().int().positive().nullable().optional(),
  name: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AdminCreateOrderInput = z.infer<typeof adminCreateOrderSchema>;
export type ClubQuoteInput = z.infer<typeof clubQuoteSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateDayInput = z.infer<typeof updateDaySchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
