#!/usr/bin/env python3
"""Verifica o faturamento do MEI contra o limite anual e classifica o excesso.

Exemplos:
  python3 limite_mei.py --ano 2025 --faturamento 84000
  python3 limite_mei.py --ano 2026 --abertura 2026-03 --faturamento 50000
  python3 limite_mei.py --ano 2026 --mensal 7000,6500,8000
  python3 limite_mei.py --ano 2027 --faturamento 100000 --limite 110000   # se o PLP 186 virar lei
  python3 limite_mei.py --historico 2023:63000,2024:84000,2025:84000 --abertura 2023-04

Regras (pesquisa de 16/10/2026): limite R$ 81.000/ano; no ano de abertura
R$ 6.750 x meses de atividade (fração de mês conta como mês inteiro).
Excesso até 20% -> desenquadra em 1º/jan do ano seguinte + DAS sobre o excesso.
Excesso acima de 20% -> desenquadramento retroativo ao início do ano/abertura.
"""
import argparse
import json

LIMITE_ANUAL_PADRAO = 81000.00
# Alíquotas da 1ª faixa do Simples, usadas só como ESTIMATIVA do DAS do excesso.
ALIQ_EXCESSO = {"comercio": 0.04, "servicos": 0.06}


def brl(v):
    return "R$ " + f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def limite_do_ano(ano, abertura, limite_anual):
    if not abertura:
        return limite_anual, 12
    a_ano, a_mes = (int(x) for x in abertura.split("-"))
    if a_ano < ano:
        return limite_anual, 12
    if a_ano > ano:
        raise SystemExit(f"Abertura {abertura} é depois do ano {ano}.")
    meses = 12 - a_mes + 1
    return round(limite_anual / 12 * meses, 2), meses


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--ano", type=int)
    p.add_argument("--abertura", help="AAAA-MM de abertura do CNPJ (só importa se for no próprio ano)")
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--historico", help="vários anos: ANO:FATURAMENTO,ANO:FATURAMENTO,... diz até quando ainda era MEI")
    g.add_argument("--faturamento", type=float, help="receita bruta total do ano")
    g.add_argument("--mensal", help="receitas mês a mês separadas por vírgula (pode ser parcial)")
    p.add_argument("--limite", type=float, default=LIMITE_ANUAL_PADRAO, help="limite anual (padrão 81000)")
    p.add_argument("--atividade", choices=["comercio", "servicos"], default="servicos",
                   help="para estimar o DAS do excesso")
    p.add_argument("--json", action="store_true")
    a = p.parse_args()

    if a.historico:
        return historico(a)
    if a.ano is None:
        p.error("--ano é obrigatório (exceto com --historico)")

    limite, meses_ativos = limite_do_ano(a.ano, a.abertura, a.limite)
    projecao = None
    if a.mensal:
        # valores separados por vírgula, decimais com ponto (ex.: 7000,6500.50)
        valores = [float(x) for x in a.mensal.split(",") if x.strip()]
        total = sum(valores)
        if len(valores) < meses_ativos:
            media = total / len(valores)
            projecao = round(total + media * (meses_ativos - len(valores)), 2)
    else:
        total = a.faturamento

    def classificar(valor):
        if valor <= limite:
            return "dentro", 0.0
        excesso = valor - limite
        return ("excesso_ate_20" if valor <= limite * 1.2 else "excesso_acima_20"), excesso

    situacao, excesso = classificar(total)
    out = {
        "ano": a.ano,
        "limite_aplicavel": limite,
        "meses_de_atividade": meses_ativos,
        "faturamento": round(total, 2),
        "uso_do_limite_pct": round(total / limite * 100, 1),
        "teto_20pct": round(limite * 1.2, 2),
        "situacao": situacao,
        "excesso": round(excesso, 2),
    }
    if situacao == "excesso_ate_20":
        out["das_excesso_estimado"] = round(excesso * ALIQ_EXCESSO[a.atividade], 2)
    if projecao is not None:
        out["projecao_ano"] = projecao
        out["situacao_projetada"], _ = classificar(projecao)

    if a.json:
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return

    print(f"Ano {a.ano} | limite aplicável: {brl(limite)} ({meses_ativos} meses)")
    print(f"Faturamento informado: {brl(total)} -> {out['uso_do_limite_pct']}% do limite")
    msgs = {
        "dentro": "Dentro do limite. Segue MEI normalmente.",
        "excesso_ate_20": (f"Excesso de {brl(excesso)} (até 20%, teto {brl(limite*1.2)}). "
                           "Continua MEI até 31/12, paga DAS complementar sobre o excesso "
                           "(gerado na DASN-SIMEI) e vira ME a partir de 1º/jan do ano seguinte. "
                           f"DAS do excesso ESTIMADO: {brl(out.get('das_excesso_estimado', 0))} "
                           "(o app da DASN calcula o valor exato)."),
        "excesso_acima_20": (f"Excesso de {brl(excesso)} (ACIMA de 20%). Desenquadramento retroativo "
                             "a 1º/jan (ou à abertura): imposto como ME do Simples sobre toda a receita. "
                             "Procure ajuda humana (Sebrae/Sala do Empreendedor/contador)."),
    }
    print(msgs[situacao])
    if situacao == "dentro" and total >= 0.8 * limite:
        print("ATENÇÃO: passou de 80% do limite. Planeje os próximos meses.")
    if projecao is not None:
        print(f"Projeção do ano pelo ritmo atual: {brl(projecao)} -> {out['situacao_projetada']}")


def historico(a):
    anos = sorted((int(k), float(v)) for k, v in (x.split(":") for x in a.historico.split(",") if x.strip()))
    ultimo_mei = None
    print("Ano  | limite        | faturamento   | situação")
    for ano, fat in anos:
        limite, meses = limite_do_ano(ano, a.abertura, a.limite)
        if fat <= limite:
            sit = "dentro"
        elif fat <= limite * 1.2:
            sit = f"excesso até 20% -> deixa de ser MEI em 1º/jan/{ano + 1}"
        else:
            inicio = "abertura" if meses < 12 else f"1º/jan/{ano}"
            sit = f"excesso ACIMA de 20% -> desenquadramento retroativo a {inicio}"
        print(f"{ano} | {brl(limite):>13} | {brl(fat):>13} | {sit}")
        if sit != "dentro" and ultimo_mei is None:
            ultimo_mei = ano if "até 20%" in sit else ano - 1
    if ultimo_mei is None:
        print("Todos os anos dentro do limite: continua MEI.")
        return
    print(f"\nCONCLUSÃO: pelas regras, era MEI só até dez/{ultimo_mei}. Os períodos seguintes devem ser "
          "apurados como ME do Simples Nacional (PGDAS-D), não como DAS-MEI. "
          "Calcule DAS-MEI atrasado só até essa data e procure ajuda humana (Sebrae/Sala do "
          "Empreendedor/contador) antes de transmitir as DASN.")


if __name__ == "__main__":
    main()
