# IRPF do titular do MEI

Pesquisado em 16/10/2026. O MEI (CNPJ) não paga IR além do DAS, mas o **dono** (CPF) pode
precisar declarar o lucro que retirou.

## Passo a passo do cálculo

1. **Receita bruta do ano** (soma do Relatório Mensal / DASN).
2. **Parcela isenta por presunção** = receita bruta × percentual (Lei 9.249/95 art. 15,
   citado no Perguntão do Simples) [ALTA]:
   - **8%** comércio, indústria, transporte de **cargas**
   - **16%** transporte de **passageiros**
   - **32%** serviços
   (Cuidado: algumas matérias dizem 16% para indústria — está errado.)
3. **Lucro evidenciado** = receita bruta − despesas comprovadas (inclui o DAS). Só use se
   houver livro caixa/comprovantes; se não houver, assume-se que todo o lucro = parcela
   isenta presumida.
4. **Parte tributável** = lucro evidenciado − parcela isenta (se positivo).
   - Parte isenta → ficha "Rendimentos Isentos e Não Tributáveis", lucros e dividendos
     (linha 13), fonte pagadora = CNPJ do MEI.
   - Parte tributável → "Rendimentos Tributáveis Recebidos de PJ", fonte = CNPJ do MEI.
5. Somar a parte tributável a outros rendimentos (salário, aluguel etc.) para ver se passa do
   limite de obrigatoriedade.

Script: `python3 scripts/irpf_mei.py --receita 60000 --despesas 20000 --atividade servicos`

## Quem é obrigado a declarar — IRPF 2026 (ano-base 2025) [ALTA]

Fonte: https://www.gov.br/fazenda/pt-br/assuntos/noticias/2026/marco/receita-federal-anuncia-regras-para-declaracao-do-imposto-de-renda-da-pessoa-fisica-2026

- Rendimentos tributáveis > **R$ 35.584,00**
- Isentos/exclusivos > **R$ 200 mil**
- Bens > **R$ 800 mil** em 31/12
- Ganho de capital, bolsa > R$ 40 mil, atividade rural > R$ 177.920, novo residente

Para a declaração de 2027 (ano-base 2026) os limites ainda não estavam publicados —
confirmar.

## Mudança: Lei 15.270/2025 (isenção até R$ 5 mil/mês)

- Vigente desde 01/01/2026, via **redutor** aplicado após a tabela: zera o imposto até
  R$ 5.000/mês; redução parcial até R$ 7.350. [MÉDIA]
- Vale na fonte e no carnê-leão de 2026; **na declaração só a partir de 2027** (ano-base
  2026). A DIRPF 2026 usa as regras antigas.
- Tabela mensal (sem o redutor): isento até 2.428,80; 7,5% até 2.826,65 (−182,16); 15% até
  3.751,05 (−394,16); 22,5% até 4.664,68 (−675,49); 27,5% acima (−908,73). [MÉDIA]

## Carnê-leão

Para rendimento de pessoa física ou do exterior recebido **no CPF** (não no CNPJ do MEI).
Mensal, até o último dia útil do mês seguinte, pelo e-CAC/app. Se o dinheiro do negócio
entra no CPF, isso é sinal para separar contas (ver skill escrituracao-financeira).

## Ferramentas

- Meu Imposto de Renda (online/app, declaração pré-preenchida) — gov.br/receitafederal
- Cartilha CFC "Declare Certo" (IRPF 2026): https://cfc.org.br/wp-content/uploads/2026/04/cartilha_declare_certo.pdf
