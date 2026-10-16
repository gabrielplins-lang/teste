#!/usr/bin/env python3
"""Calcula a parcela isenta e a parcela tributável do lucro do MEI para o IRPF do titular.

Exemplos:
  python3 irpf_mei.py --receita 60000 --atividade servicos
  python3 irpf_mei.py --receita 84000 --despesas 30000 --atividade comercio
  python3 irpf_mei.py --receita 84000 --despesas 30000 --atividade servicos --outros-tributaveis 12000

Presunção (Lei 9.249/95 art. 15): 8% comércio/indústria/transporte de cargas,
16% transporte de passageiros, 32% serviços.
Limite de obrigatoriedade usado: IRPF 2026 (ano-base 2025) = R$ 35.584,00 de tributáveis.
"""
import argparse

PRESUNCAO = {"comercio": 0.08, "industria": 0.08, "cargas": 0.08, "passageiros": 0.16, "servicos": 0.32}
LIMITE_TRIBUTAVEIS_IRPF2026 = 35584.00


def brl(v):
    return "R$ " + f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--receita", type=float, required=True, help="receita bruta do ano")
    p.add_argument("--despesas", type=float, help="despesas COMPROVADAS do ano (inclui DAS). OMITA se não houver livro caixa/comprovantes; "
                        "passar 0 significa 'tenho registros e não tive despesa' e torna tributável o lucro acima da parcela isenta")
    p.add_argument("--atividade", choices=list(PRESUNCAO), required=True)
    p.add_argument("--receita-servicos", type=float, help="se for misto: parte da receita que é serviço")
    p.add_argument("--outros-tributaveis", type=float, default=0.0, help="salário, aluguel etc. no CPF")
    a = p.parse_args()

    if a.receita_servicos is not None:
        isenta = a.receita_servicos * PRESUNCAO["servicos"] + (a.receita - a.receita_servicos) * PRESUNCAO[a.atividade]
    else:
        isenta = a.receita * PRESUNCAO[a.atividade]

    print(f"Receita bruta: {brl(a.receita)}")
    print(f"Parcela isenta presumida: {brl(isenta)}")
    if a.despesas is None:
        print("Sem livro caixa: declare a parcela isenta como 'Lucros e dividendos' (Rendimentos Isentos, "
              "fonte = CNPJ do MEI). Sem parcela tributável apurada.")
        tributavel = 0.0
    else:
        lucro = a.receita - a.despesas
        tributavel = max(0.0, lucro - isenta)
        isenta_declarada = min(isenta, max(lucro, 0.0))
        print(f"Lucro evidenciado (receita - despesas): {brl(lucro)}")
        print(f"-> Isento (lucros e dividendos): {brl(isenta_declarada)}")
        print(f"-> Tributável (recebido de PJ, fonte = CNPJ do MEI): {brl(tributavel)}")

    total_trib = tributavel + a.outros_tributaveis
    print(f"Total de rendimentos tributáveis no CPF: {brl(total_trib)}")
    if total_trib > LIMITE_TRIBUTAVEIS_IRPF2026:
        print(f"Acima de {brl(LIMITE_TRIBUTAVEIS_IRPF2026)}: obrigado a declarar (regra do IRPF 2026; confira o ano vigente).")
    else:
        print("Abaixo do limite de tributáveis. Confira os outros critérios (bens > R$ 800 mil, isentos > R$ 200 mil etc.).")
    print("Estimativa educativa — confira no programa/Meu Imposto de Renda.")


if __name__ == "__main__":
    main()
