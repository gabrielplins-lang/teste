# Ferramentas gratuitas

Pesquisa de 16/10/2026. Escolha pelo perfil do usuário.

| Perfil | Recomendação | Por quê |
|---|---|---|
| Não técnico, MEI pequeno | **Google Sheets** + `categorizar_extrato.py` | Grátis, no celular, compartilhável |
| Quer app desktop de contabilidade | **GnuCash** (gnucash.org) | GPL, partidas dobradas, importa OFX/CSV com sugestão automática de contas e marca duplicatas, tela de conciliação |
| Gosta de tecnologia / quer auditoria forte | **hledger** (hledger.org) ou **Beancount + Fava** | Texto puro versionado em git; regras de importação CSV; asserções de saldo que travam se não bater com o extrato |
| Finanças pessoais auto-hospedadas | **Firefly III** | Motor de regras, importador CSV |
| Faturas simples | Wave (plano grátis), Manager.io (desktop grátis) | Importação bancária automática do Wave é paga |
| Obrigações do MEI | PGMEI, DASN-SIMEI, App MEI, Emissor Nacional NFS-e, Regularize | Oficiais e gratuitos |
| Ajuda humana | Sebrae, Sala do Empreendedor | Gratuitos |

## Boas práticas de importação (comunidade plain text accounting)
1. Prefira **OFX** (tem ID único da transação → evita duplicata). CSV de banco muda de
   formato sem aviso.
2. Um arquivo de regras por banco/conta, versionado.
3. Importe uma conta por vez, poucos meses por lote; concilie cada lote antes do próximo.
4. Ao fim de cada extrato, registre o saldo final como **asserção** (hledger: `balance`
   assertion; Beancount: diretiva `balance` no dia 1 do mês seguinte). Divergência bloqueia.
5. Nunca use lançamento de ajuste/`pad` para tapar diferença — investigue.
6. Ligue comprovantes às transações (metadado `document:` no Beancount, tag no hledger,
   coluna "comprovante" na planilha).

## Exemplo de regra hledger equivalente ao CSV de regras
```
# nubank.csv.rules
skip 1
fields date, amount, id, description
date-format %d/%m/%Y
currency R$
account1 ativo:banco:nubank-pj
if SIMPLES NACIONAL|PGMEI
  account2 despesas:impostos:das
if IFOOD
  account2 pessoal:alimentacao
```
