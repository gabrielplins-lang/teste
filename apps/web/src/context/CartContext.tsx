import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ProductDTO } from "@feijuca/shared";
import { storage } from "../lib/storage";

export interface CartItem {
  key: string; // produto + observação
  productId: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
  notes: string;
}

interface CartValue {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  add: (p: ProductDTO, quantity: number, notes: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => storage.read<CartItem[]>("feijuca.cart", []));
  useEffect(() => storage.write("feijuca.cart", items), [items]);

  const value = useMemo<CartValue>(() => ({
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotalCents: items.reduce((s, i) => s + i.quantity * i.priceCents, 0),
    add: (p, quantity, notes) =>
      setItems((cur) => {
        const key = `${p.id}::${notes.trim()}`;
        const found = cur.find((i) => i.key === key);
        if (found) return cur.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i));
        return [...cur, { key, productId: p.id, name: p.name, priceCents: p.priceCents, imageUrl: p.imageUrl, quantity, notes: notes.trim() }];
      }),
    setQuantity: (key, quantity) =>
      setItems((cur) => (quantity <= 0 ? cur.filter((i) => i.key !== key) : cur.map((i) => (i.key === key ? { ...i, quantity } : i)))),
    clear: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart fora do CartProvider");
  return ctx;
}
