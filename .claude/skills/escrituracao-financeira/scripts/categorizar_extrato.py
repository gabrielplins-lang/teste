#!/usr/bin/env python3
"""Lê extratos (Nubank CSV de conta ou cartão, CSV genérico ou OFX), aplica regras de
categorização e gera um livro caixa em CSV + resumo mensal.

Exemplos:
  python3 categorizar_extrato.py extrato_jan.csv extrato_fev.csv -o livro_caixa.csv
  python3 categorizar_extrato.py nubank.ofx --regras minhas_regras.csv --meu-nome "Fulano de Tal"
  python3 categorizar_extrato.py *.csv -o livro.csv --resumo resumo.csv

Princípios: regra determinística antes de julgamento; o que não casar vai para
"A classificar" (nunca chutar). Entradas sem regra ficam como "Entrada a confirmar"
porque nem todo dinheiro que entra é faturamento (pode ser transferência própria,
empréstimo, reembolso). Duplicatas (mesmo id, ou mesma data+valor+descrição) são ignoradas.
"""
import argparse
import csv
import datetime as dt
import os
import re
import sys
from collections import defaultdict

AQUI = os.path.dirname(os.path.abspath(__file__))
REGRAS_PADRAO = os.path.join(AQUI, "..", "assets", "regras_categorias.csv")


def parse_valor(s):
    s = str(s).strip().replace("R$", "").replace(" ", "")
    if "," in s and "." in s:  # 1.234,56
        s = s.replace(".", "").replace(",", ".")
    elif "," in s:
        s = s.replace(",", ".")
    return float(s)


def parse_data(s):
    s = s.strip()[:10]
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y%m%d"):
        try:
            return dt.datetime.strptime(s, fmt).date()
        except ValueError:
            pass
    raise ValueError(f"data não reconhecida: {s}")


def ler_ofx(path):
    txt = open(path, encoding="latin-1", errors="replace").read()
    out = []
    for bloco in re.findall(r"<STMTTRN>(.*?)(?:</STMTTRN>|(?=<STMTTRN>)|</BANKTRANLIST>)", txt, re.S | re.I):
        def tag(t):
            m = re.search(rf"<{t}>([^<\r\n]*)", bloco, re.I)
            return m.group(1).strip() if m else ""
        desc = " ".join(x for x in (tag("NAME"), tag("MEMO")) if x)
        out.append({"data": parse_data(tag("DTPOSTED")[:8]), "valor": parse_valor(tag("TRNAMT")),
                    "descricao": desc, "id": tag("FITID"), "origem": os.path.basename(path)})
    return out


def ler_csv(path):
    with open(path, encoding="utf-8-sig", errors="replace") as f:
        amostra = f.read(4096)
        f.seek(0)
        sep = ";" if amostra.count(";") > amostra.count(",") else ","
        rd = csv.DictReader(f, delimiter=sep)
        cols = {c.lower().strip(): c for c in rd.fieldnames or []}
        out = []
        # Nubank cartão: date,title,amount (valor positivo = gasto)
        cartao = "title" in cols and "amount" in cols
        for r in rd:
            g = lambda *nomes: next((r[cols[n]] for n in nomes if n in cols and r[cols[n]] not in (None, "")), "")
            try:
                data = parse_data(g("data", "date", "data lançamento", "data lancamento"))
                valor = parse_valor(g("valor", "amount", "value", "valor (r$)"))
            except (ValueError, TypeError):
                continue
            if cartao:
                valor = -valor
            desc = g("descrição", "descricao", "title", "histórico", "historico", "description")
            out.append({"data": data, "valor": valor, "descricao": desc,
                        "id": g("identificador", "id"), "origem": os.path.basename(path)})
        return out


def carregar_regras(path, meu_nome):
    regras = []
    if meu_nome:
        regras.append((re.compile(re.escape(meu_nome), re.I), "Transferência entre contas próprias", "transferencia", f"nome:{meu_nome}"))
    with open(path, encoding="utf-8") as f:
        linhas = [l for l in f if l.strip() and not l.lstrip().startswith("#")]
    for r in csv.DictReader(linhas):
        regras.append((re.compile(r["padrao"], re.I), r["categoria"], r["tipo"], r["padrao"]))
    return regras


def categorizar(t, regras):
    for rx, cat, tipo, origem in regras:
        if rx.search(t["descricao"]):
            return cat, tipo, origem
    if t["valor"] > 0:
        return "Entrada a confirmar (venda? transferência?)", "a_classificar", ""
    return "A classificar", "a_classificar", ""


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("arquivos", nargs="+")
    p.add_argument("--regras", default=REGRAS_PADRAO)
    p.add_argument("--meu-nome", help="seu nome como aparece em Pix entre suas contas")
    p.add_argument("-o", "--saida", default="livro_caixa.csv")
    p.add_argument("--resumo", help="CSV de resumo mensal (opcional)")
    a = p.parse_args()

    trans, vistos = [], set()
    for arq in a.arquivos:
        itens = ler_ofx(arq) if arq.lower().endswith((".ofx", ".qfx")) else ler_csv(arq)
        for t in itens:
            chave = t["id"] or f'{t["data"]}|{t["valor"]:.2f}|{t["descricao"]}'
            if chave in vistos:
                continue
            vistos.add(chave)
            trans.append(t)
    if not trans:
        sys.exit("Nenhuma transação lida. Confira o formato do arquivo.")
    trans.sort(key=lambda t: t["data"])

    regras = carregar_regras(a.regras, a.meu_nome)
    resumo = defaultdict(lambda: defaultdict(float))
    with open(a.saida, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["data", "descricao", "entrada", "saida", "categoria", "tipo", "regra_aplicada", "origem", "id", "comprovante"])
        for t in trans:
            cat, tipo, regra = categorizar(t, regras)
            v = t["valor"]
            w.writerow([t["data"].isoformat(), t["descricao"], f"{v:.2f}" if v > 0 else "",
                        f"{-v:.2f}" if v < 0 else "", cat, tipo, regra, t["origem"], t["id"], ""])
            mes = t["data"].strftime("%Y-%m")
            resumo[mes][tipo + ("_in" if v > 0 else "_out")] += abs(v)
            resumo[mes]["n_a_classificar"] += 1 if tipo == "a_classificar" else 0

    print(f"{len(trans)} transações -> {a.saida}")
    cab = ["mes", "receita", "entradas_a_confirmar", "despesas", "impostos", "pessoal", "a_classificar(qtd)"]
    linhas = []
    for mes in sorted(resumo):
        r = resumo[mes]
        linhas.append([mes, round(r["receita_in"], 2), round(r["a_classificar_in"], 2),
                       round(r["despesa_out"] + r["a_classificar_out"], 2), round(r["imposto_out"], 2),
                       round(r["pessoal_out"], 2), int(r["n_a_classificar"])])
    print(" | ".join(cab))
    for l in linhas:
        print(" | ".join(str(x) for x in l))
    if a.resumo:
        with open(a.resumo, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerows([cab] + linhas)
    print("Revise 'A classificar' e 'Entrada a confirmar' com o usuário antes de somar faturamento.")


if __name__ == "__main__":
    main()
