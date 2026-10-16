# Feijuca da Lu

App de delivery da **Feijuca da Lu** (Jacarepaguá, RJ) com o **Clube da Lu**, a assinatura mensal de almoço e janta, e o **painel de gestão** da loja.

- **Loja** (`/`): cardápio no estilo dos apps de delivery, sacola, checkout com Pix, cartão ou dinheiro, e acompanhamento do pedido.
- **Clube da Lu** (`/clube`): monta o plano, mostra o preço do mês e a economia; o assinante escolhe o prato de cada dia e pausa entregas (`/clube/meu-mes`).
- **Gestão** (`/gestao`): pedidos de todos os canais numa fila só (app, WhatsApp, iFood, Clube), produção da cozinha, rotas por bairro, caixa por canal, assinantes e cardápio.

## Estrutura

```
apps/
  api/                    Backend: Node + Express + Prisma (PostgreSQL)
    prisma/
      schema.prisma       Tabelas do banco
      migrations/         Histórico do banco (gerado pelo Prisma)
      seed.ts             Cardápio real e taxas por bairro
      demo.ts             Pedidos e assinantes de exemplo (só para apresentar)
    src/
      config/env.ts       Variáveis de ambiente validadas
      lib/                Prisma e erros HTTP
      middlewares/        Login do painel e tratamento de erros
      modules/
        catalog/          Loja, cardápio e taxas de entrega
        orders/           Pedidos avulsos
        club/             Clube da Lu (assinaturas e dias)
        admin/            Relatórios do painel (cozinha, entregas, caixa)
        auth/             Login do painel
      app.ts              Monta as rotas
      server.ts           Sobe o servidor
    tests/                Testes de ponta a ponta da API

  web/                    Frontend: React + Vite (instalável no celular)
    public/               Logo, manifesto e fotos dos pratos
    src/
      api/client.ts       Todas as chamadas à API
      components/         Peças reutilizáveis (botões, painel inferior, ícones…)
      context/            Sacola e avisos
      pages/
        loja/             Tela da loja
        sacola/           Checkout
        pedido/           Acompanhamento e histórico
        clube/            Clube da Lu e calendário do assinante
        gestao/           Painel da Lu
      styles/             CSS por área (tokens de cor e fonte em tokens.css)

packages/
  shared/                 Regras usadas pelos dois lados
    src/pricing.ts        Preços e descontos do Clube
    src/calendar.ts       Dias de entrega, feriados do Rio, prazo das 20h
    src/schemas.ts        Validação dos formulários
    src/store.ts          Dados da loja (WhatsApp, endereço, horários)
```

## Rodar no seu computador

Precisa de **Node 20+** e de um **PostgreSQL** (o jeito mais fácil é o Docker Desktop).

```bash
npm install                     # instala tudo
npm run db:up                   # sobe o PostgreSQL no Docker
cp apps/api/.env.example apps/api/.env   # ajuste a senha do painel
npm run db:migrate              # cria as tabelas
npm run db:seed                 # carrega o cardápio da Lu
npm run db:demo                 # (opcional) pedidos e assinantes de exemplo
npm run dev                     # API em :3333 e site em :5173
```

Abra http://localhost:5173 (loja) e http://localhost:5173/gestao (painel, senha do `.env`).

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm test` | Testes das regras do Clube e da API |
| `npm run typecheck` | Confere os tipos do projeto inteiro |
| `npm run build` | Gera a versão de produção |
| `npm run db:studio -w @feijuca/api` | Abre o banco num editor visual |

## Colocar no ar (Render)

O arquivo `render.yaml` cria o banco, a API e o site de uma vez.

1. Crie uma conta em https://render.com e conecte o GitHub.
2. **New > Blueprint** e escolha este repositório.
3. Preencha as variáveis que ele pedir:
   - `ADMIN_PASSWORD`: a senha do painel da Lu.
   - `CORS_ORIGIN`: o endereço do site (ex.: `https://feijuca-web.onrender.com`).
   - `VITE_API_URL`: o endereço da API (ex.: `https://feijuca-api.onrender.com`).
   - `PIX_KEY`: a chave Pix que aparece no checkout.
4. Depois do primeiro deploy, aponte um domínio próprio (ex.: `feijucadalu.com.br`) no site.

Custo aproximado no Render: banco ~US$ 6/mês + API ~US$ 7/mês; o site estático é grátis. Alternativas: Railway (tudo junto) ou Vercel (site) + Neon/Supabase (banco).

## Valores para confirmar com a Lu

Estão em `packages/shared/src/store.ts` e `apps/api/prisma/seed.ts`:

- Taxa de entrega e tempo de cada bairro (hoje são exemplos).
- Horário de funcionamento e pedido mínimo.
- Janelas de entrega do Clube (11h às 13h e 18h às 20h).
- Arquivo original da logo (a atual foi redesenhada em `apps/web/src/components/Logo.tsx`).
- Foto do estrogonofe (salvar como `apps/web/public/img/produtos/estrogonofe.jpg`). As outras fotos vieram de prints e podem ser trocadas por versões em alta.

## Próximos passos

1. **Pix Automático / cartão recorrente** para o Clube (Asaas, Mercado Pago ou Pagar.me). Hoje o checkout mostra a chave Pix e a Lu marca como pago no painel.
2. **Login do cliente por código no WhatsApp**, para o assinante abrir o calendário em qualquer celular. Hoje a assinatura fica salva no celular onde foi feita.
3. **Avisos automáticos no WhatsApp** quando o pedido muda de status.
4. **Integração com o iFood** (API de pedidos para parceiros), para os pedidos de lá entrarem sozinhos na fila.
