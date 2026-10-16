import { STORE } from "@feijuca/shared";

export const whatsappLink = (text: string, phone: string = STORE.whatsapp) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

export const formatPhone = (digits: string) => {
  const d = digits.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits;
};
