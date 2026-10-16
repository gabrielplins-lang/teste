/** Dados fixos da loja. Valores marcados como "exemplo" precisam ser confirmados com a Lu. */
export const STORE = {
  name: "Feijuca da Lu",
  tagline: "Sabor brasileiro",
  slogan: "comida boa, todo dia!",
  whatsapp: "5521992396228",
  whatsappDisplay: "(21) 99239-6228",
  instagram: "feijucadalu",
  address: "Rua dos Filósofos, 14, quadra 5 · Jacarepaguá, Rio de Janeiro",
  openingHours: "Seg a sáb, 11h às 21h", // exemplo
  minimumOrderCents: 2500, // exemplo
  defaultDeliveryFeeCents: 700, // exemplo: bairro sem taxa cadastrada
  timezoneOffset: "-03:00", // America/Sao_Paulo (sem horário de verão desde 2019)
} as const;

export const CLUB_WINDOWS = {
  LUNCH: "11h às 13h",
  DINNER: "18h às 20h",
} as const;

/** Feijoada tem preço maior; no Clube vira um adicional sobre o prato base. */
export const FEIJOADA_SLUG = "feijoada-da-lu";

/** Revezamento sugerido pela Lu nos dias que não são de feijoada. */
export const CLUB_ROTATION = [
  "estrogonofe",
  "lasanha",
  "frango-a-parmegiana",
  "panqueca-a-bolonhesa",
  "escondidinho-a-bolonhesa",
];

/** Dias de feijoada no calendário sugerido: quarta (3) e sábado (6), tradição carioca. */
export const FEIJOADA_WEEKDAYS = [3, 6];

/** Estimativa do que cada canal cobra sobre a venda, para o relatório de caixa. */
export const CHANNEL_FEE_RATE = {
  APP: 0.01, // gateway Pix/cartão (estimativa)
  WHATSAPP: 0,
  IFOOD: 0.262, // Plano Entrega 23% + pagamento online ~3,2%
  CLUB: 0.01,
} as const;
