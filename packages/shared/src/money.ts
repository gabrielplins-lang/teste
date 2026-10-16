/** Todo valor em dinheiro do sistema é guardado em centavos (inteiro). */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
