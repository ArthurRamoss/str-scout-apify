**Channel:** Grupos BR de host/anfitrião Airbnb no Facebook
**Mode:** Playwright + sua cookie do FB (script automatiza post em N grupos)

---

## Grupos-alvo (pesquisar primeiro, alguns pedem aprovação pra entrar)

Lista candidata — você confirma quais são membro ou consegue entrar rápido:

- "Anfitriões Airbnb Brasil" (~50k membros)
- "Locação Curta Temporada — Brasil" (~30k)
- "Airbnb Hosts Brasil" (~20k)
- "Investidores Imobiliários — Locação Temporada" (~10k)
- "Hospedagem Curta Temporada SP" (~15k)
- "Anfitriões RJ — Airbnb" (~8k)
- "Comunidade Hospedagem Profissional" (~12k)
- Grupos regionais menores (Florianópolis, Gramado, etc.)

⚠️ **Importante:** ler as regras de cada grupo. Vários proíbem auto-promoção direta. Pra esses, use a versão "perguntinha" que abaixo.

---

## Versão A — "Compartilhando ferramenta" (grupos que permitem)

**Title:** Ferramenta nova de análise de mercado pra Airbnb (pague por uso, não assinatura)

**Body:**

Fala pessoal! 

Construí uma ferramenta de inteligência de mercado pra STR/Airbnb e tô lançando essa semana. Pensei em compartilhar aqui caso alguém esteja avaliando imóvel novo pra colocar pra alugar.

**Resumo do que faz:**

1. **Check de regulação por cidade** — $0.10 (10 centavos). Cobre cidades como Lisboa, Barcelona, Paris, NYC, LA, Austin, etc.
2. **Análise de mercado completa** — $0.50. Receita estimada, diária média (ADR), ocupação, saturação, listings comparáveis.
3. **Score de viabilidade pra qualquer endereço** — $1.00. 0-100 com recomendação viável/marginal/evitar, projeção de receita líquida, break-even occupancy.

Tudo pago por uso. Sem assinatura, sem trial. Plataforma é Apify (eles fazem o billing).

**Cobertura:**
Lisboa, Porto, Rio de Janeiro nativo via dados abertos. Outras cidades BR via scraping ao vivo (mais lento ~30s mas funciona).

**Pra quem é dev:** dá pra plugar em Claude Desktop / Cursor via MCP. Pergunta pra IA "vale a pena STR esse imóvel" e ela faz a análise sozinha.

Link: apify.com/ramosss/str-scout

Feedback é o que to procurando — feature que faltou, cidade que precisa cobertura melhor, preço que tá fora.

Aviso obrigatório: ferramenta não oficial, sem vínculo com Airbnb Inc.

---

## Versão B — "Pergunta genuína" (grupos rígidos contra promo)

**Title:** Quanto vocês pagariam por uma análise de mercado STR de uma cidade específica?

**Body:**

Pergunta pros mais experientes:

Vocês usam alguma ferramenta paga pra avaliar viabilidade de Airbnb num bairro/imóvel? Tipo AirDNA, Mashvisor, etc?

To curioso porque vi que essas ferramentas geralmente cobram US$ 200-1000/mês por cidade. Pra quem só avalia 3-5 imóveis por trimestre fica $40+ por análise.

Tava pensando se faria sentido uma ferramenta pay-per-call, tipo $1 por análise, sem assinatura. Pra usar quando precisa, ignorar o resto do mês.

Pra quem usa AirDNA ou similar: vale a pena a assinatura mensal pra você? E pra quem NÃO usa: o que te impediu?

Curioso pra ouvir.

(Edit: pra quem perguntou em DM, construí uma versão dessa ideia: apify.com/ramosss/str-scout — pay-per-call, $0.05-$1.00 dependendo da tool. Tô iterando baseado em feedback, então to abrindo pra comentário.)

---

**Notas Playwright:**
- Script `marketing/scripts/playwright/facebook-group-post.ts` lê lista de URLs de grupo (você fornece após confirmar membership)
- Pra cada grupo, abre, valida que está logado (via cookie), abre "Criar publicação", cola o texto, click "Publicar"
- Screenshot após post pra confirmar
- Delay entre grupos (5-15s aleatório) pra evitar rate-limit
- Se algum grupo aplicar "moderation" (post pendente aprovação), a screenshot mostra isso e seguimos pro próximo
