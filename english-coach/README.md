# Mike, seu professor de inglês por voz

Um professor de inglês "das ruas" (americano casual) que conversa com você por voz todo dia, corrige com paciência, treina pronúncia e acompanha seu progresso.

O cérebro dele é o prompt em [`PROMPT.md`](PROMPT.md). Ele funciona em qualquer app de IA que tenha modo de voz e instruções personalizadas.

## Como ativar (5 minutos)

### Opção A: Claude (app no celular)
1. No claude.ai, crie um **Projeto** chamado "English with Mike".
2. Em **Instruções do projeto**, cole todo o conteúdo do `PROMPT.md` (da linha `---` para baixo).
3. No celular, abra o projeto, comece uma conversa e toque no ícone de **voz**.
4. Diga: "Hey Mike, let's start."

### Opção B: ChatGPT (modo de voz avançado)
1. Crie um **GPT personalizado** ou um **Projeto**, e cole o prompt nas instruções.
2. Abra no celular e use o modo de voz.

### Qual escolher para pronúncia?
Seja sincero com você mesmo sobre isso: alguns modos de voz **transformam sua fala em texto** antes da IA responder. Nesse caso o professor não "ouve" seu sotaque, ele só vê o que o transcritor entendeu. O prompt já trata isso (se a transcrição sair estranha, ele assume que foi a pronúncia e te faz repetir), mas a correção de som fino tem limite.

Modos de voz que processam o **áudio direto** (como o voz avançado do ChatGPT e o Gemini Live) percebem melhor o sotaque. Uma boa combinação:
- **Mike** (este prompt) para conversa, vocabulário, gírias, fluidez e correção de frases.
- Um app de pronúncia dedicado (ex.: ELSA Speak) por 5 minutos por dia para os sons difíceis (TH, H, vogais curtas/longas).

## Rotina diária recomendada
- **15 a 30 min com o Mike** por dia. Consistência vale mais que duração.
- No fim, diga **"end session"**. Ele te dá um bloco **PROGRESS LOG**.
- Cole esse bloco no fim das instruções do projeto, na seção "My progress logs". Assim ele lembra de você no dia seguinte e revisa o que você errou. Mantenha só os últimos 5 a 7 logs para o prompt não ficar gigante.
- Faça o "desafio do dia" que ele passar.

## Comandos rápidos (pode falar em português)
| Você diz | O que acontece |
|---|---|
| "mais devagar" / "slow down" | Ele fala mais devagar |
| "repete" / "again" | Repete a última frase |
| "como fala ...?" | Ensina o jeito natural de dizer |
| "corrige tudo" | Corrige todos os erros |
| "só conversa" | Menos correção, mais papo |
| "mais difícil" | Sobe o nível |
| "fim da aula" / "end session" | Encerra e gera o log de progresso |

## Personalizar
- **Sotaque britânico** em vez de americano: troque "American" por "British (London)" no prompt e ajuste as gírias.
- **Foco profissional** (reuniões, entrevistas): adicione na seção "Teaching method" os temas que quiser.
- **Nome e personalidade**: troque "Mike" pelo que preferir.
