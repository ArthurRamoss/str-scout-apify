**Channel:** LinkedIn (audiência BR — realtors, property managers, dev community)
**Mode:** Playwright + sua cookie LinkedIn (script posta no seu feed)

---

## Post (PT-BR, tom profissional/founder shipping receipt)

Acabei de lançar o **STR Scout** — uma ferramenta de inteligência de mercado pra Airbnb / locação curta temporada com modelo de cobrança pay-per-call (não-assinatura).

**O problema que resolve:**
Ferramentas tradicionais (AirDNA, Mashvisor) cobram US$ 200-1000/mês de assinatura. Pra investidor brasileiro avaliando 3-5 imóveis por trimestre, isso é US$ 40+ por análise — antieconômico.

**Como funciona:**
4 ferramentas, pagamento por uso:
- $0.05 — Buscar imóveis comparáveis em uma cidade
- $0.10 — Consulta de regulação local (NYC, LA, Lisboa, Barcelona, Paris, etc.)
- $0.50 — Análise de mercado completa (receita, ADR, ocupação, saturação, comps, AI summary)
- $1.00 — Score de viabilidade (0-100) pra qualquer endereço — combina regulação + demanda + lucratividade + saturação

**Diferencial técnico:**
A ferramenta é exposta via Model Context Protocol (MCP), o que significa que ela funciona dentro do Claude Desktop, Cursor, Cline — agentes de IA podem chamar as funções diretamente. Pelo que vi, é o primeiro servidor MCP de inteligência STR num registry mainstream.

**Cobertura:**
~30 metros com dados abertos curados (US, Europa, Ásia-Pacífico), incluindo Lisboa, Porto e Rio de Janeiro. Outras cidades usam scraping ao vivo como fallback.

**Stack:**
TypeScript MCP SDK + Apify Standby + StreamableHTTPServerTransport. Mesmo conjunto de handlers serve REST, MCP e batch run — três superfícies, uma base de código.

Live: https://apify.com/ramosss/str-scout

Feedback é bem-vindo, especialmente dos investidores STR e devs construindo agentes AI no Brasil.

Aviso obrigatório: ferramenta não-oficial, sem vínculo com Airbnb Inc.

---

**Hashtags (LinkedIn permite até 3-5 efetivas):**
#proptech #shorttermrental #airbnb #mcp #ai

---

**Playwright notes (`linkedin-post.ts`):**
- LinkedIn: cookie + go to feed home, click "Start a post", paste content, click "Post"
- Anti-bot: LinkedIn agressivo com automação. Se challenge aparecer, halt + manual fallback
- Screenshot do post live
- Alternativa: usar a API oficial do LinkedIn (`r_basicprofile w_member_social` scope) — exige criar app no LinkedIn Developer Portal, OAuth flow, mais complexo. Cookie é caminho mais rápido.
