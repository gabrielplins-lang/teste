# Feijuca da Lu — App + Clube da Lu

Documento de trabalho. Os números marcados como **(exemplo)** precisam ser confirmados com a Lu.

## O que já sabemos

| Item | Valor |
|---|---|
| Pedidos por dia | 60+ |
| Entrega | Motoboy próprio |
| Área | Jacarepaguá (Freguesia, Pechincha, Taquara, Tanque, Anil, Curicica…) |
| Cardápio | ~10 opções |
| Ticket médio | R$ 30 **(exemplo)** |
| Frete avulso médio | R$ 7 **(exemplo)** |

## Estrutura dos planos

| Plano | Desconto | Preço por refeição (base R$ 30) | Janela de entrega |
|---|---|---|---|
| Almoço | 10% | R$ 27,00 | 11h–13h |
| Janta | 10% | R$ 27,00 | 18h–20h |
| Almoço + janta | 15% | R$ 25,50 | as duas |

- Dias: **seg a sex** ou **seg a sáb**. O preço do mês é calculado com os dias reais de entrega do mês, sem feriados.
- Pessoas: de 1 a 6 por plano (mesmo endereço).
- Entrega grátis no Clube, sempre na janela fixa.

Exemplo, novembro de 2026, seg a sex, 1 pessoa, almoço + janta: 19 dias úteis (descontando Finados e Consciência Negra) → 38 refeições × R$ 25,50 = **R$ 969,00**. Avulso com frete sairia R$ 1.406,00.

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
- Usa algum sistema hoje (Saipos, Anota AI, PDV)?
- Ticket médio real e frete cobrado hoje.
- Quais benefícios extras entram no Clube (a definir juntos).

## Protótipo

`prototipo/index.html` é um protótipo navegável com 4 telas: Início (pedido avulso com convite ao Clube), Clube (montador de plano com preço do mês), Meu mês (calendário com escolha de prato e pausa) e Painel da Lu (produção do dia e rota do motoboy). Cardápio, preços e pedidos são exemplos.
