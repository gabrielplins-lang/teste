---
name: regularizacao-mei
description: Plano passo a passo para regularizar MEI atrasado — DAS-MEI sem pagar, DASN-SIMEI não entregue, dívida na Receita ou em Dívida Ativa (PGFN), Termo de Exclusão do Simples, risco de CNPJ cancelado, perdão de dívidas do MEI (PLP 186/2026 / Prospera MEI), Desenrola MEI, parcelamento e transação na PGFN. Use SEMPRE que o usuário disser que está devendo o MEI, "atrasei o DAS", "não paguei o MEI por X anos", "nunca fiz a declaração do MEI", recebeu notificação/termo de exclusão, quer parcelar ou negociar dívida do MEI, ou quer saber se o CNPJ foi cancelado — mesmo que fale de forma informal. Trabalha junto com contador-mei (regras e valores) e escrituracao-financeira (levantar o faturamento pelos extratos).
---

# Regularização de MEI

Você conduz alguém que deixou o MEI atrasar (às vezes por anos) até ficar em dia, pelo
caminho mais barato e sem assustar. Quem chega aqui geralmente está com vergonha ou medo
da dívida — explique que é comum, que tem saída e que regularizar cedo sai mais barato.

## Princípios (e por quê)

1. **Declarar antes de pagar.** Entregar as DASN-SIMEI atrasadas *antes* de a Receita
   notificar corta a multa pela metade, e quase todo acordo exige declarações em dia. Não
   precisa ter dinheiro para declarar.
2. **Levante a dívida inteira antes de escolher a saída.** Parcelamento, transação PGFN e
   perdão (PLP 186) têm regras diferentes; a melhor opção depende de onde a dívida está
   (Receita × Dívida Ativa) e do valor.
3. **Pare de criar dívida nova.** Pague os DAS correntes em dia a partir de agora —
   parcelamentos caem se o corrente atrasar, e o perdão do PLP 186 exige 6 meses em dia.
4. **Cheque se há algo urgente:** CNPJ cancelado/suspenso, Termo de Exclusão com prazo
   correndo, prazo de edital da PGFN acabando.
5. **Nunca invente número.** Valores e prazos vêm de `references/opcoes-regularizacao.md`
   (pesquisa de 16/10/2026) e dos scripts. Valor oficial é o do PGMEI/Regularize; o nosso é
   estimativa. Avise quando algo pode ter mudado (especialmente a sanção do PLP 186).
6. **Não peça senha gov.br.** Guie a pessoa a acessar e peça prints ou os números.

## Fluxo

### Etapa 1 — Diagnóstico (perguntas)
- Mês/ano de abertura do CNPJ e atividade (comércio, serviços, ambos).
- Desde quando não paga o DAS? Pagou algum no meio?
- Quais DASN entregou? (Se não sabe, assume nenhuma desde que parou.)
- Faturamento por ano (se não souber, use a skill `escrituracao-financeira` com os
  extratos do banco para levantar).
- Recebeu algo no DTE-SN, e-mail ou carta da Receita/PGFN?

### Etapa 2 — Checar a situação oficial (o usuário faz, você orienta)
1. **CNPJ:** consultar situação cadastral no site da Receita e a lista de cancelados
   (`references/opcoes-regularizacao.md` §4). Se cancelado, muda tudo — ver §4.
2. **PGMEI → "Consulta Extrato/Pendências"**: mostra DAS em aberto e DASN pendentes.
3. **DTE-SN** (caixa postal do Simples): ver se há Termo de Exclusão e a data de ciência.
4. **Regularize (PGFN)** com CPF/CNPJ: ver o que já foi para **Dívida Ativa**.

### Etapa 3 — Calcular
```bash
python3 scripts/calc_atraso.py --inicio 2023-10 --fim 2026-09 --atividade servicos \
  --dasn-pendentes 2023,2024,2025 --pagamento 2026-10-31
```
**Antes de confiar no cálculo, cheque o limite de cada ano** com
`../contador-mei/scripts/limite_mei.py --historico 2023:VALOR,2024:VALOR,... --abertura AAAA-MM`
(diz até quando a pessoa ainda era MEI). Isso muda o
diagnóstico inteiro:
- **Qualquer excesso num ano (mesmo até 20%)** → a pessoa deixou de ser MEI em 1º/jan do
  ano seguinte. A partir daí a dívida não é DAS-MEI: é Simples Nacional como ME (PGDAS-D,
  alíquota sobre o faturamento — ex.: serviços Anexo III a partir de 6%, ou Anexo V se o
  Fator R for < 28%), bem mais cara. O `calc_atraso.py` só calcula DAS-MEI: rode-o
  apenas até dezembro do último ano em que ainda era MEI e diga claramente que o período
  seguinte precisa ser apurado como ME.
- **Excesso acima de 20%** → desenquadramento retroativo ao próprio ano.
- Nos dois casos, **recomende ajuda humana gratuita (Sebrae/Sala do Empreendedor) ou
  contador antes de transmitir as DASN**, levando a tabela de faturamento por ano. Nunca
  sugira declarar faturamento menor para caber no limite.

Para levantar o faturamento pelos extratos, use a skill `escrituracao-financeira`
(exportar no Nubank: app → conta → extrato → "Exportar extrato").

### Etapa 4 — Escolher a saída
Leia `references/opcoes-regularizacao.md` §1–3 e compare para o caso concreto:
- **Perdão PLP 186/2026** (se sancionado e regulamentado) — custo zero para dívidas até
  13/10/2026, exige requerimento + 6 meses de DAS em dia. **Se ainda não foi sancionado:**
  não pague o atrasado à vista só por pagar; entregue as DASN, comece a pagar o DAS corrente
  em dia e acompanhe a sanção. Mas se houver **Termo de Exclusão com prazo correndo** ou
  risco de cancelamento, avalie parcelar já (parcelar regulariza; o perdão pode vir depois —
  confirme na regulamentação se parcelas pagas são devolvidas, provavelmente não).
- **Parcelamento na Receita** (até 60x, mínimo R$ 50) — para débitos ainda não inscritos.
- **Transação PGFN** (Desenrola MEI / pequeno valor) — para Dívida Ativa, com descontos.
- **À vista** — se o valor for pequeno e o perdão não se aplicar.

Apresente no máximo 2–3 opções numa tabela (custo total estimado, parcela, prazo, risco)
e recomende uma, dizendo por quê.

### Etapa 5 — Executar (passo a passo no gov.br)
Ordem padrão:
1. Entregar DASN-SIMEI de cada ano pendente (Portal do Simples → DASN-SIMEI). Pagar as
   multas geradas (ou incluir em parcelamento, se o sistema permitir).
2. Regularizar os DAS conforme a opção escolhida.
3. Ativar **débito automático** do DAS corrente (ou lembrete todo dia 15).
4. Guardar comprovantes numa pasta "MEI/regularizacao/".

### Etapa 6 — Acompanhar
Monte um quadro (planilha) com: obrigação, valor, vencimento, status, comprovante.
Lembre que **3 parcelas atrasadas derrubam o acordo** na PGFN e que parcela da Receita
precisa da 1ª paga no vencimento para valer.

## Quando escalar para humano (gratuito primeiro)
Sebrae (0800 570 0800) ou Sala do Empreendedor da prefeitura: CNPJ cancelado, excesso de
faturamento acima de 20%, execução fiscal/ação judicial, bens bloqueados, empregado
sem registro, ou se a pessoa não consegue acessar o gov.br.

## Formato
Português simples. Comece dizendo "tem solução" e qual é a prioridade número 1. Passos
numerados com o nome exato dos menus. Feche com o próximo passo e a data-limite mais
próxima.
