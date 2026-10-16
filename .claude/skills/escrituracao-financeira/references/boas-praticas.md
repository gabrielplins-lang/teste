# Boas práticas de escrituração (internacionais adaptadas ao Brasil)

Curadoria de 16/10/2026. Fontes principais: IRS Pub 583 (registros), HMRC self-employed
records, Xero month-end close, COSO 2013, ICAEW/ACCA/IESBA (IA e ética), IASB Conceptual
Framework, NBC TG 1002 / ITG 1000 (CFC). URLs em `../../contador-mei/references/fontes.md`.

## Sumário
1. Conceitos que importam
2. Checklist A — configuração inicial
3. Checklist B — rotina semanal
4. Checklist C — fechamento mensal
5. Checklist D — controles para quem trabalha sozinho
6. Indicadores (KPIs)
7. Checklist G — fluxo de caixa de 13 semanas
8. Guarda de documentos

## 1. Conceitos que importam
- **Regime de caixa × competência.** MEI: caixa basta (receita = o que entrou). Competência
  (receita quando ganha, despesa quando incorrida) é o padrão das normas contábeis (IFRS for
  SMEs, NBC TG 1002) e passa a importar se virar ME com contabilidade.
- **Entidade separada.** O negócio é uma "entidade" distinta do dono, mesmo no MEI.
  Retirada do dono **não é despesa**: é "Retiradas" (redução do patrimônio). Aporte do dono
  não é receita.
- **Partidas dobradas.** Ativo = Passivo + PL; todo lançamento tem débito = crédito. Útil
  para conferir — livro caixa simples é uma versão de "uma entrada" da conta Banco.
- **Materialidade.** Foque esforço no que é grande o suficiente para mudar uma decisão ou um
  imposto.
- **Prudência ≠ pessimismo.** Cautela sob incerteza, sem subestimar ou superestimar de
  propósito (IASB 2018).

## 2. Checklist A — configuração inicial
1. Perfil: país, forma (MEI/ME), regime, atividade, data de abertura, bancos e cartões.
2. Conta e cartão exclusivos do negócio. Transferências PF↔PJ = retirada/aporte.
3. Regime: caixa (MEI) ou competência.
4. Plano de contas enxuto (ver `plano-de-contas.md`), com conta "A classificar" que deve
   zerar todo mês.
5. Comprovantes: foto/PDF no momento da compra, nome `AAAA-MM-DD_fornecedor_valor.pdf`,
   pasta por ano/mês, backup em 2 lugares (ex.: Google Drive + celular). Cupom térmico
   apaga — fotografe logo.
6. Regras de categorização iniciais (arquivo de regras) com nomes de clientes/fornecedores.

## 3. Checklist B — rotina semanal (15 min)
1. Exportar extrato e rodar a categorização.
2. Classificar pendências; pedir comprovante do que passar da materialidade.
3. Emitir notas pendentes (se vendeu para CNPJ) e anotar o que tem a receber.

## 4. Checklist C — fechamento mensal (até dia 10; DAS até dia 20)
1. Todos os extratos importados (contas, cartões, maquininhas, marketplaces).
2. **Conciliação bancária:** saldo inicial do livro = do extrato; casar lançamentos;
   saldo final do livro = do extrato. Documentar diferenças. Nunca lançar "ajuste" para
   esconder diferença.
3. Conciliar maquininha/gateway: bruto − taxas = líquido depositado.
4. Zerar "A classificar".
5. Revisar quem deve (a receber) e o que deve (a pagar).
6. Registrar receita do mês no **Relatório Mensal de Receitas Brutas** (MEI).
7. Pagar DAS; separar dinheiro de impostos futuros.
8. Resumo do mês: receita, despesas, lucro, retiradas, saldo; comparar com mês anterior e
   explicar variações grandes.
9. "Travar" o mês (não editar mais; correções viram estorno no mês seguinte com nota).

## 5. Checklist D — controles para quem trabalha sozinho (COSO adaptado)
Sem segregação de funções, use controles compensatórios:
1. O agente concilia; o dono revisa e aprova. IA nunca aprova pagamento.
2. Revisão mensal pelo dono de: conciliação, beneficiários novos, estornos, lançamentos
   manuais.
3. Banco com 2FA e limite de Pix; agente só com acesso de leitura (exportações).
4. Histórico de versões das planilhas/arquivos.
5. Revisão externa periódica (Sebrae/contador) uma vez por ano, se possível.

## 6. Indicadores (KPIs)
| KPI | Fórmula | Leitura |
|---|---|---|
| Margem bruta | (Receita − custo direto) ÷ Receita | Preço cobre o custo? |
| Margem de contribuição | (Preço − custo variável) ÷ Preço | Base do ponto de equilíbrio |
| Ponto de equilíbrio | Custos fixos ÷ margem de contribuição % | Quanto precisa vender por mês |
| Lucro do mês | Receita − despesas (sem retiradas) | O que o negócio gerou |
| Dias de reserva de caixa | Saldo médio ÷ saída média diária | Referência EUA (JPMorgan Chase Institute 2016): mediana 27 dias |
| Runway | Caixa ÷ queima mensal líquida | Alerta abaixo de 3 meses (heurística) |
| Pró-labore sustentável | Valor fixo ≤ lucro médio − impostos | Retirar pelo lucro, não pelo saldo |
| Reserva de emergência | 3–6 meses de custos fixos + DAS | Heurística, sem norma oficial |
| % do limite MEI | Faturamento acumulado ÷ limite | Alerta a partir de 80% |

## 7. Checklist G — fluxo de caixa de 13 semanas
1. Começar pelo saldo real de hoje.
2. Entradas por semana pela data **provável** (não a combinada, se o cliente atrasa).
3. Saídas por semana: fornecedores, aluguel, assinaturas, **DAS (dia 20)**, parcelas de
   acordos, pró-labore.
4. Semanas 1–4 detalhadas; 5–13 por médias/recorrências.
5. Toda segunda: rolar uma semana, comparar previsto × realizado, ajustar premissas.
6. Se o saldo projetado cair abaixo da reserva mínima: antecipar cobrança, adiar gasto,
   renegociar prazo.

## 8. Guarda de documentos
- Brasil: notas, comprovantes e Relatório Mensal por **pelo menos 5 anos** (prazo geral de
  decadência/prescrição tributária) — prática recomendada; conferir regra específica.
- Referências externas (exemplos, não regra brasileira): IRS 3–7 anos conforme o caso;
  HMRC 5 anos após 31/jan.
