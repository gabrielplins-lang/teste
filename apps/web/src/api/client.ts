import type {
  CashReport, CategoryDTO, ClubQuote, ClubQuoteInput, CreateOrderInput, CreateSubscriptionInput, DeliveriesReport,
  KitchenReport, OrderDTO, OrderStatus, ProductDTO, StoreDTO, SubscriberRow, SubscriptionDTO, UpdateDayInput,
  UpdateProductInput, AdminCreateOrderInput,
} from "@feijuca/shared";
import { getAdminToken, clearAdminToken } from "../lib/storage";

const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit & { admin?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init.admin) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, { ...init, headers: { ...headers, ...(init.headers as object) } });
  } catch {
    throw new ApiError(0, "Sem conexão com o servidor. Confira sua internet.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && init.admin) clearAdminToken();
    throw new ApiError(res.status, body.error ?? "Algo deu errado. Tente de novo.");
  }
  return body as T;
}

const json = (data: unknown) => JSON.stringify(data);

export const api = {
  // Loja
  store: () => request<StoreDTO>("/store"),
  catalog: () => request<CategoryDTO[]>("/catalog"),
  createOrder: (input: CreateOrderInput) => request<OrderDTO>("/orders", { method: "POST", body: json(input) }),
  order: (id: string) => request<OrderDTO>(`/orders/${id}`),

  // Clube
  quote: (input: ClubQuoteInput) => request<ClubQuote>("/club/quote", { method: "POST", body: json(input) }),
  subscribe: (input: CreateSubscriptionInput) => request<SubscriptionDTO>("/club/subscriptions", { method: "POST", body: json(input) }),
  subscription: (id: string) => request<SubscriptionDTO>(`/club/subscriptions/${id}`),
  updateDay: (id: string, date: string, input: UpdateDayInput) =>
    request<SubscriptionDTO>(`/club/subscriptions/${id}/days/${date}`, { method: "PATCH", body: json(input) }),

  // Gestão
  login: (password: string) => request<{ token: string }>("/auth/login", { method: "POST", body: json({ password }) }),
  admin: {
    orders: (date?: string) => request<OrderDTO[]>(`/admin/orders${date ? `?date=${date}` : ""}`, { admin: true }),
    createOrder: (input: AdminCreateOrderInput) => request<OrderDTO>("/admin/orders", { method: "POST", body: json(input), admin: true }),
    setStatus: (id: string, status: OrderStatus) =>
      request<OrderDTO>(`/admin/orders/${id}/status`, { method: "PATCH", body: json({ status }), admin: true }),
    markPaid: (id: string) => request<OrderDTO>(`/admin/orders/${id}/paid`, { method: "POST", admin: true }),
    kitchen: (date: string) => request<KitchenReport>(`/admin/kitchen?date=${date}`, { admin: true }),
    deliveries: (date: string) => request<DeliveriesReport>(`/admin/deliveries?date=${date}`, { admin: true }),
    cash: (date: string) => request<CashReport>(`/admin/cash?date=${date}`, { admin: true }),
    subscribers: () => request<SubscriberRow[]>("/admin/subscribers", { admin: true }),
    products: () => request<CategoryDTO[]>("/admin/products", { admin: true }),
    updateProduct: (id: string, input: UpdateProductInput) =>
      request<ProductDTO>(`/admin/products/${id}`, { method: "PATCH", body: json(input), admin: true }),
  },
};
