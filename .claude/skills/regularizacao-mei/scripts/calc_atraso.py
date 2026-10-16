#!/usr/bin/env python3
"""Estima a dívida de DAS-MEI em atraso (principal + multa + juros) e as multas de DASN-SIMEI.

É uma ESTIMATIVA para planejar. O valor oficial sai no PGMEI (guia com data de pagamento)
e, para Dívida Ativa, no Regularize/PGFN.

Exemplos:
  python3 calc_atraso.py --inicio 2023-10 --fim 2026-09 --atividade servicos
  python3 calc_atraso.py --inicio 2023-10 --fim 2026-09 --atividade comercio --pagos 2023-10,2023-11 \
      --dasn-pendentes 2023,2024,2025 --pagamento 2026-10-31
  python3 calc_atraso.py --inicio 2024-01 --fim 2024-12 --atividade ambos --selic-mensal 1.1 --csv saida.csv

Regras (pesquisa 16/10/2026): vencimento dia 20 do mês seguinte; multa 0,33%/dia máx. 20%;
juros = Selic acumulada desde o mês seguinte ao vencimento + 1% no mês do pagamento.
A Selic mensal real varia; use --selic-mensal para ajustar (padrão 1,0% a.m. ~ 12,7% a.a.).
"""
import argparse
import csv
import datetime as dt

# (ano, mes_inicial) -> salário mínimo vigente a partir daquela competência
SALARIO_MINIMO = [
    ((2022, 1), 1212.00),
    ((2023, 1), 1302.00),
    ((2023, 5), 1320.00),  # virada em maio/2023 — mês exato INCERTO (maio ou junho)
    ((2024, 1), 1412.00),
    ((2025, 1), 1518.00),
    ((2026, 1), 1621.00),
]
ADICIONAL = {"comercio": 1.00, "servicos": 5.00, "ambos": 6.00}


def brl(v):
    return "R$ " + f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def ym(s):
    y, m = (int(x) for x in s.split("-"))
    return y, m


def add_month(y, m, n=1):
    t = y * 12 + (m - 1) + n
    return t // 12, t % 12 + 1


def months_between(a, b):
    return (b[0] * 12 + b[1]) - (a[0] * 12 + a[1])


def salario(y, m):
    valor = None
    for (ay, am), v in SALARIO_MINIMO:
        if (y, m) >= (ay, am):
            valor = v
    if valor is None:
        raise SystemExit(f"Sem salário mínimo cadastrado para {y}-{m:02d}")
    return valor


def das_valor(y, m, atividade, caminhoneiro=False):
    inss = round(salario(y, m) * (0.12 if caminhoneiro else 0.05), 2)
    return round(inss + ADICIONAL[atividade], 2)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--inicio", required=True, help="primeira competência em atraso AAAA-MM")
    p.add_argument("--fim", required=True, help="última competência em atraso AAAA-MM")
    p.add_argument("--atividade", choices=list(ADICIONAL), required=True)
    p.add_argument("--caminhoneiro", action="store_true")
    p.add_argument("--pagos", default="", help="competências já pagas, separadas por vírgula")
    p.add_argument("--pagamento", help="data prevista de pagamento AAAA-MM-DD (padrão: hoje)")
    p.add_argument("--selic-mensal", type=float, default=1.0, help="Selic média ao mês em %% (estimativa)")
    p.add_argument("--dasn-pendentes", default="", help="anos-calendário sem DASN entregue, ex.: 2023,2024,2025")
    p.add_argument("--dasn-notificado", action="store_true", help="já recebeu notificação/intimação (perde redução de 50%%)")
    p.add_argument("--csv", help="salvar detalhamento em CSV")
    a = p.parse_args()

    pag = dt.date.fromisoformat(a.pagamento) if a.pagamento else dt.date.today()
    pagos = {x.strip() for x in a.pagos.split(",") if x.strip()}
    linhas = []
    cur, fim = ym(a.inicio), ym(a.fim)
    while cur <= fim:
        y, m = cur
        comp = f"{y}-{m:02d}"
        principal = das_valor(y, m, a.atividade, a.caminhoneiro)
        if comp not in pagos:
            vy, vm = add_month(y, m)
            venc = dt.date(vy, vm, 20)
            dias = max(0, (pag - venc).days)
            multa = round(principal * min(0.0033 * dias, 0.20), 2) if dias else 0.0
            juros = 0.0
            if dias:
                n_selic = max(0, months_between(add_month(vy, vm), (pag.year, pag.month)))
                juros = round(principal * (n_selic * a.selic_mensal / 100 + 0.01), 2)
            status = "a vencer" if venc >= dt.date.today() else "atrasado"
            linhas.append({"competencia": comp, "vencimento": venc.isoformat(), "status": status, "principal": principal,
                           "dias_atraso": dias, "multa": multa, "juros": juros,
                           "total": round(principal + multa + juros, 2)})
        cur = add_month(y, m)

    tot_p = sum(l["principal"] for l in linhas)
    tot_m = sum(l["multa"] for l in linhas)
    tot_j = sum(l["juros"] for l in linhas)
    print(f"DAS em atraso: {len(linhas)} meses | pagamento previsto em {pag.isoformat()} | Selic {a.selic_mensal}% a.m.")
    print(f"  Principal: {brl(tot_p)}")
    print(f"  Multa:     {brl(tot_m)}")
    print(f"  Juros:     {brl(tot_j)}")
    print(f"  TOTAL DAS: {brl(tot_p + tot_m + tot_j)}")
    a_vencer = [l["competencia"] for l in linhas if l["status"] == "a vencer"]
    if a_vencer:
        print(f"  (inclui competências ainda a vencer hoje: {', '.join(a_vencer)} — pague no prazo e não terá multa)")
    print("  Só vale para os anos em que ainda era MEI: confira o limite de cada ano com limite_mei.py --historico.")

    tot_dasn = 0.0
    anos = [int(x) for x in a.dasn_pendentes.split(",") if x.strip()]
    if anos:
        print("\nDASN-SIMEI pendentes (multa estimada):")
        for ano in anos:
            prazo = dt.date(ano + 1, 5, 31)
            # 2% por mês-calendário ou fração após 31/05 do ano seguinte
            meses = max(1, months_between((prazo.year, prazo.month), (pag.year, pag.month)))
            # tributos declarados = DAS do ano inteiro (12 competências)
            tributos = sum(das_valor(ano, mm, a.atividade, a.caminhoneiro) for mm in range(1, 13))
            multa = tributos * min(0.02 * meses, 0.20)
            if not a.dasn_notificado:
                multa *= 0.5  # entregue antes de procedimento de ofício
            multa = round(max(multa, 50.0), 2)  # a redução não fura o mínimo de R$ 50
            tot_dasn += multa
            print(f"  {ano}: prazo {prazo.isoformat()} | ~{meses} meses de atraso | multa ~ {brl(multa)}")
        print(f"  TOTAL DASN: {brl(tot_dasn)}")

    print(f"\nTOTAL GERAL ESTIMADO: {brl(tot_p + tot_m + tot_j + tot_dasn)}")
    print("Valores oficiais: PGMEI (DAS) e DASN-SIMEI (multa gerada na transmissão). "
          "Se o PLP 186/2026 for sancionado, débitos até 13/10/2026 podem ser perdoados (ver referências).")

    if a.csv:
        with open(a.csv, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(linhas[0].keys()) if linhas else ["competencia"])
            w.writeheader()
            w.writerows(linhas)
        print(f"Detalhamento salvo em {a.csv}")


if __name__ == "__main__":
    main()
