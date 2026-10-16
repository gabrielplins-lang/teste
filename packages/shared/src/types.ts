import type { Meals, SubscriptionTotals } from "./pricing";
import type { ISODate, Month, Weekdays } from "./calendar";

/** Formatos que a API devolve. O frontend usa estes tipos para não se perder. */

export type Channel = "APP" | "WHATSAPP" | "IFOOD" | "CLUB";
export type OrderStatus = "NEW" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELED";
export type PaymentMethod = "PIX" | "CARD" | "CASH" | "IFOOD";
export type Fulfillment = "DELIVERY" | "PICKUP";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "PAYMENT_FAILED" | "CANCELED";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: "Recebido",
  PREPARING: "Em preparo",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  NEW: "PREPARING",
  PREPARING: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};
export const CHANNEL_LABEL: Record<Channel, string> = { APP: "App", WHATSAPP: "WhatsApp", IFOOD: "iFood", CLUB: "Clube" };
export const PAYMENT_LABEL: Record<PaymentMethod, string> = { PIX: "Pix", CARD: "Cartão", CASH: "Dinheiro", IFOOD: "Pago no iFood" };

export interface ProductDTO {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  compareAtCents: number | null;
  imageUrl: string | null;
  featured: boolean;
  clubEligible: boolean;
  preorder: boolean;
  serves: number;
  active: boolean;
  categoryId: string;
}

export interface CategoryDTO {
  id: string;
  slug: string;
  name: string;
  products: ProductDTO[];
}

export interface DeliveryZoneDTO {
  neighborhood: string;
  feeCents: number;
  etaMin: number;
  etaMax: number;
}

export interface StoreDTO {
  name: string;
  slogan: string;
  address: string;
  whatsapp: string;
  whatsappDisplay: string;
  instagram: string;
  openingHours: string;
  minimumOrderCents: number;
  zones: DeliveryZoneDTO[];
  pix: { key: string; name: string } | null;
}

export interface OrderItemDTO {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  notes: string | null;
}

export interface OrderDTO {
  id: string;
  number: number;
  status: OrderStatus;
  channel: Channel;
  customerName: string;
  customerPhone: string;
  fulfillment: Fulfillment;
  addressLine: string | null;
  neighborhood: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: "PENDING" | "PAID";
  changeForCents: number | null;
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  notes: string | null;
  createdAt: string;
  items: OrderItemDTO[];
}

export interface SubscriptionDayDTO {
  date: ISODate;
  paused: boolean;
  productId: string;
  productName: string;
  canChange: boolean;
}

export interface SubscriptionDTO {
  id: string;
  customerName: string;
  meals: Meals;
  weekdays: Weekdays;
  people: number;
  month: Month;
  status: SubscriptionStatus;
  neighborhood: string | null;
  paymentMethod: "PIX" | "CARD";
  days: SubscriptionDayDTO[];
  totals: SubscriptionTotals;
}

export interface KitchenReport {
  date: ISODate;
  club: { productId: string; name: string; quantity: number }[];
  orders: { productId: string; name: string; quantity: number }[];
}

export interface DeliveriesReport {
  date: ISODate;
  club: { neighborhood: string; lunch: number; dinner: number }[];
  pending: OrderDTO[];
}

export interface CashReport {
  date: ISODate;
  channels: { channel: Channel; orders: number; grossCents: number; feeCents: number; netCents: number }[];
  pendingCashCents: number;
}

export interface SubscriberRow {
  id: string;
  customerName: string;
  customerPhone: string;
  meals: Meals;
  people: number;
  neighborhood: string | null;
  status: SubscriptionStatus;
  month: Month;
  totalCents: number;
}
