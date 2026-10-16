# Feijuca da Lu — App + Clube da Lu

Documento de trabalho. Os números marcados como **(exemplo)** precisam ser confirmados com a Lu.

## O que já sabemos

| Item | Valor |
|---|---|
| Pedidos por dia | 60+ |
| Entrega | Motoboy próprio |
| Área | Jacarepaguá (Freguesia, Pechincha, Taquara, Tanque, Anil, Curicica…) |
| Cardápio | ~10 opções |
| Preços | Pratos da Lu R$ 25 · Feijoada da Lu R$ 35 · Feijoada p/ 3 R$ 95 · Combo p/ 3 + Coca R$ 105 · Coca R$ 15 · Pudim GG R$ 70 (encomenda) |
| Contato | WhatsApp (21) 99239-6228 · @feijucadalu · Rua dos Filósofos, 14, quadra 5 |
| Frete avulso médio | R$ 7 **(exemplo)** |

## Estrutura dos planos

Pratos do Clube: Estrogonofe, Lasanha, Panqueca à bolonhesa, Escondidinho à bolonhesa, Frango à parmegiana e Feijoada da Lu.

| Plano | Desconto | Prato da Lu (R$ 25) | Feijoada (R$ 35) | Janela de entrega |
|---|---|---|---|---|
| Almoço | 10% | R$ 22,50 | R$ 31,50 (+ R$ 9,00) | 11h–13h |
| Janta | 10% | R$ 22,50 | R$ 31,50 (+ R$ 9,00) | 18h–20h |
| Almoço + janta | 15% | R$ 21,25 | R$ 29,75 (+ R$ 8,50) | as duas |

O plano é cobrado pelo preço dos pratos de R$ 25; cada dia de feijoada soma o adicional. Sugestão padrão do calendário: feijoada às quartas e sábados.

- Dias: **seg a sex** ou **seg a sáb**. O preço do mês é calculado com os dias reais de entrega do mês, sem feriados.
- Pessoas: de 1 a 6 por plano (mesmo endereço).
- Entrega grátis no Clube, sempre na janela fixa.

Exemplo, novembro de 2026, seg a sex, 1 pessoa, almoço + janta: 19 dias úteis (descontando Finados e Consciência Negra) → 38 refeições × R$ 21,25 = **R$ 807,50**, mais o adicional dos dias de feijoada. Avulso com frete (R$ 7, exemplo) sairia R$ 1.216,00.

## Regras

1. O assinante escolhe o prato de cada dia. Se não escolher, vale a sugestão da Lu.
2. Troca de prato até as 20h do dia anterior.
3. Até 5 pausas por mês, que viram crédito no mês seguinte.
4. Entrega sem ninguém para receber não vira crédito.
5. Feriados não são cobrados.
6. Renovação automática (Pix Automático ou cartão recorrente); cancelamento com 7 dias de aviso.

## Por que a conta fecha para a Lu

- Sem comissão de marketplace (12% a 23% + ~3,2% de pagamento no iFood).
- Produção prevista: ela sabe na véspera quantas marmitas de cada prato fazer.
- Rota fixa por bairro: um motoboy faz várias entregas por saída, em vez de uma corrida por pedido.
- Receita entra no início do mês.

## Piloto sugerido

- **30 vagas** no primeiro mês. Isso dá ~30 a 60 marmitas a mais por dia, perto da metade do volume atual. Confirmar com a Lu se a cozinha aguenta.
- Divulgação: Instagram, WhatsApp e clientes que já pedem direto. Antes de usar a embalagem do iFood para divulgar, conferir os termos de parceiro.
- Medir: cancelamentos no 2º mês, pratos mais escolhidos, pausas por assinante.

## Ainda falta saber

- Quantas marmitas a mais por dia a cozinha aguenta?
- Frete cobrado hoje.
- Arquivo original da logo (no protótipo ela foi redesenhada em vetor a partir do post).
- Quais benefícios extras entram no Clube (a definir juntos).

## O app é o sistema da Lu

A Lu não usa nenhum sistema hoje. O app cobre a loja inteira, não só o Clube:

| Área | Para quem | O que faz |
|---|---|---|
| Loja (app/PWA) | Cliente | Cardápio, sacola, Pix/cartão, acompanhamento do pedido |
| Clube | Assinante | Montar plano, calendário do mês, pausas, cobrança recorrente |
| Pedidos | Lu | Fila única com pedidos do app, WhatsApp (lançados à mão), iFood e Clube |
| Cozinha | Lu | Quantas marmitas de cada prato: Clube de amanhã + avulsos de hoje |
| Entregas | Motoboy | Rota do Clube por bairro e avulsos agrupados por região |
| Caixa | Lu | Vendas por canal, quanto ficou com ela, a receber |
| Clube (gestão) | Lu | Assinantes, pausas, renovações, Pix que falhou |

Fases:
1. **Loja + Pedidos + Cozinha + Caixa.** Tira a Lu do papel/WhatsApp e já dá o canal próprio de venda.
2. **Clube da Lu** com Pix Automático e o piloto de 30 vagas.
3. **Integração com o iFood** (API de pedidos do iFood para parceiros), para os pedidos do iFood caírem direto na fila. Exige cadastro e homologação no portal de desenvolvedores do iFood. Até lá, ela segue usando o tablet do iFood.

## Protótipo

`prototipo/index.html` é um protótipo navegável com 4 telas: Início (pedido avulso com convite ao Clube), Clube (montador de plano com preço do mês), Meu mês (calendário com escolha de prato e pausa) e Gestão (pedidos, cozinha, entregas, caixa e assinantes). Cardápio e preços são os reais da Lu; pedidos e números da gestão são exemplos.
