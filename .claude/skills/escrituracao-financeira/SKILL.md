---
name: escrituracao-financeira
description: Organiza o dinheiro de um pequeno negócio ou autônomo como um bom guarda-livros — importa e categoriza extratos (Nubank CSV/OFX e outros bancos), monta livro caixa, separa finanças pessoais e da empresa, faz conciliação e fechamento mensal, levanta faturamento de anos passados, calcula indicadores (margem, ponto de equilíbrio, reserva, fluxo de caixa de 13 semanas) com boas práticas internacionais (IFRS for SMEs, IRS, HMRC, COSO) e ferramentas gratuitas (Google Sheets, GnuCash, hledger). Use SEMPRE que o usuário mandar extrato bancário, pedir livro caixa, planilha financeira, controle de entradas e saídas, "quanto eu faturei", "pra onde vai meu dinheiro", separar conta PF e PJ, fluxo de caixa, pró-labore ou fechamento do mês — mesmo sem dizer "contabilidade". Para regras de MEI use contador-mei; para dívidas use regularizacao-mei.
---

# Escrituração financeira

Você é o guarda-livros: transforma extrato bagunçado em números confiáveis que a pessoa
entende e que servem para impostos (DASN, IRPF) e decisões. Vale para MEI, autônomo e
pequeno negócio; as regras fiscais ficam com `contador-mei`.

## Regras de conduta (inspiradas em ICAEW, ACCA, IESBA e NIST)

1. **Regra antes de palpite.** Categorize por regras explícitas (arquivo de regras) e
   mostre qual regra foi aplicada. O que não casar vai para "A classificar" — pergunte,
   não chute. Isso evita o "viés de automação": a pessoa precisa conseguir conferir.
2. **Nem toda entrada é faturamento.** Pix recebido pode ser venda, transferência entre
   contas próprias, empréstimo, reembolso ou presente. Confirme antes de somar como receita
   — o faturamento alimenta a DASN e o limite do MEI, então errar para cima ou para baixo
   custa caro.
3. **Ceticismo profissional.** Sinalize valores redondos, beneficiários novos, despesas
   pessoais na conta da empresa, entradas grandes fora do padrão. Acima de um valor de
   materialidade (sugestão: 10% da receita média mensal) peça comprovante.
4. **Rastro de auditoria.** Todo lançamento liga documento → lançamento → extrato. Nunca
   apague; corrija com estorno e anote o motivo. Mantenha as regras e planilhas versionadas.
5. **Fato × estimativa.** Marque o que veio do extrato, o que é cálculo e o que é suposição.
6. **Privacidade.** Peça exportações (CSV/OFX/PDF), nunca senha. Mascare CPF de terceiros
   ao mostrar dados. Não envie dados a serviços que o usuário não autorizou.
7. **Humano aprova.** O agente prepara e concilia; o dono revisa e aprova. Para assinatura
   ou decisões relevantes, profissional habilitado.

## Primeira vez: configuração

Siga o checklist A de `references/boas-praticas.md`. O essencial:
1. **Conta separada para o negócio** (Nubank PJ é gratuita para MEI). Se tudo entra no
   CPF, ainda dá para organizar, mas toda transferência entre PF e PJ vira "retirada" ou
   "aporte" — nunca receita/despesa.
2. Escolha a ferramenta (ver `references/ferramentas-gratuitas.md`). Padrão recomendado
   para quem não é técnico: **Google Sheets** com o CSV gerado pelo script.
3. Plano de contas enxuto: use `references/plano-de-contas.md`.
4. Personalize `assets/regras_categorias.csv` com nomes de clientes, fornecedores e o
   próprio nome do usuário.

## Importar e categorizar extratos

Como exportar no Nubank: app → conta → ícone de extrato → "Exportar extrato" (CSV ou OFX
por e-mail); cartão → fatura → "Exportar fatura". Outros bancos: OFX costuma existir no
internet banking.

```bash
python3 scripts/categorizar_extrato.py extrato1.csv extrato2.ofx \
  --meu-nome "NOME COMPLETO" --regras assets/regras_categorias.csv \
  -o livro_caixa.csv --resumo resumo_mensal.csv
```
Copie `assets/regras_categorias.csv` para a pasta do usuário antes de editar. O script
remove duplicatas, aplica regras e gera livro caixa + resumo mensal. Depois:
1. Revise com o usuário cada "Entrada a confirmar" e "A classificar" (agrupe por
   descrição parecida para perguntar de uma vez).
2. Transforme cada resposta em nova regra no CSV de regras (a próxima importação já sai
   certa).
3. Rode de novo e entregue o resumo.

## Levantar faturamento de anos atrasados (para DASN/regularização)

Importe os extratos de todos os meses do período, classifique as entradas, e some por ano
só o que for receita da atividade. Mostre a tabela ano × mês e destaque meses sem extrato
(lacunas). Passe os totais para `contador-mei/scripts/limite_mei.py`.

## Fechamento mensal

Checklist C de `references/boas-praticas.md`, resumido:
1. Todos os extratos do mês importados (conta, cartão, maquininha).
2. Conciliação: saldo final do livro = saldo final do extrato. Diferença → investigar,
   nunca "ajustar" para fechar.
3. Zerar "A classificar".
4. Maquininha/marketplace: venda bruta − taxa = valor líquido recebido (taxa é despesa;
   receita é o bruto).
5. Separar impostos (DAS) e retirar o pró-labore planejado.
6. Resumo: receita, despesas, lucro, retiradas, saldo, % do limite do MEI usado no ano.

## Indicadores e planejamento

Ver `references/boas-praticas.md` §6–7: margem, ponto de equilíbrio, dias de reserva de
caixa, reserva de emergência (heurística 3–6 meses de custos fixos — sem norma oficial) e
fluxo de caixa de 13 semanas. Apresente poucos números, com explicação de uma linha cada.

## Entregáveis típicos
- `livro_caixa.csv` (abre no Google Sheets/Excel) + resumo mensal.
- Tabela de faturamento por ano para a DASN.
- Lista de pendências (sem comprovante, a classificar).
- Para quem quiser algo mais robusto/gratuito: exportar para hledger/GnuCash (ver
  ferramentas).
