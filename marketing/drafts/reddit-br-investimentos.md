**Subreddit:** r/investimentos / r/Brasilivre / r/farialimabets
**Title (br_investimentos):** Construí uma ferramenta de análise de Airbnb pra investidor STR — pague $1 por análise em vez de $200/mês

**Body (PT-BR):**

Galera, tava cansado de pagar assinatura mensal de ferramenta de STR (Short-Term Rental, modalidade Airbnb) só pra avaliar 3-4 imóveis por trimestre. Construí uma alternativa **pay-per-query** e tô lançando hoje.

**O que faz:**

| Tool | Pra que serve | Custo |
|---|---|---|
| `search-listings` | Busca imóveis comparáveis numa cidade | $0.05 |
| `regulations` | Verifica se a cidade permite STR (legal/restrito/proibido) | $0.10 |
| `market-analysis` | Relatório completo: receita, ADR, ocupação, saturação | $0.50 |
| `arbitrage-score` | Score 0-100 pra qualquer endereço — viabilidade de virar Airbnb | $1.00 |

**Por que importa pro investidor BR:**

Maioria das ferramentas é gringa, paga em dólar, e nem cobre cidades BR direito. STR Scout cobre **Lisboa, Porto, Rio de Janeiro, e cidades gringas relevantes pra quem investe lá fora** (Miami, Orlando, Nova York, etc.) — útil pra dual citizens e investidores que olham EUA/Europa.

Pra cidades BR específicas, ela cai num scraper ao vivo que retorna dados de qualquer cidade — então qualquer lugar no Brasil funciona, só mais lento na primeira consulta (~30s).

**Como usar:**

1. Cria conta grátis em apify.com (mesma plataforma que cobra os $0.05-1.00 quando você usa)
2. Vai em https://apify.com/ramosss/str-scout
3. Clica "Try for free" e roda uma análise

OU, se você usa Claude Desktop / Cursor, dá pra plugar como MCP server e perguntar direto pra IA "vale a pena STR esse imóvel em Lisboa pra arbitragem?" — ela chama as ferramentas e responde com números.

**Sobre o modelo de negócio:** revenue split 80/20 com Apify. Não vendo dados crus, vendo análise pronta. Sem assinatura, sem trial, sem upsell.

Pega leve com o feedback que é v1 lançada agora. Se tem alguma feature que faltou ou cidade que vocês querem cobertura, comenta aí.

Aviso obrigatório: ferramenta NÃO oficial, sem vínculo com Airbnb Inc.
