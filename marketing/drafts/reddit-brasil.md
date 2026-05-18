**Subreddit:** r/brasil (cuidado: r/brasil rejeita auto-promo direto; melhor postar em r/empreendedorismo ou r/programacao com tom técnico/de aprendizado)
**Alternativas melhores:** r/empreendedorismo, r/programacao, r/desenvolvedores
**Title (r/empreendedorismo):** Lancei meu primeiro produto digital (pay-per-call, $0.05-$1.00 por uso) — aprendizados da v1

**Body (PT-BR, tom "founder compartilhando lições"):**

Fala pessoal,

Acabei de lançar **STR Scout** — uma ferramenta de inteligência de mercado pra Airbnb / locação curta. Quero compartilhar o que aprendi montando a v1 em poucos dias, principalmente os trade-offs de monetização.

**Resumo do produto (pra contexto):**
- 4 tools (search, regulations, market-analysis, arbitrage-score)
- Pago por uso ($0.05 → $1.00 por chamada, depende da tool)
- Plataforma: Apify Store (que faz billing/distribuição)
- Plug direto em Claude Desktop / Cursor via MCP (Model Context Protocol)

**5 aprendizados que valem a pena:**

**1. Pay-per-call destrói subscription quando o ICP usa esporadicamente.**
Concorrentes cobram $200/mês. Usuário médio (investidor de STR) usa pra avaliar 3-5 imóveis por trimestre — paga $40 por análise. Eu cobro $1. Mesmo retalho de margem por análise mas zero fricção pra comprar.

**2. Plataforma > infra própria pra ship rápido.**
Apify hospeda, faz billing, KYC (compliance fiscal pesado pra quem mora no BR pagando user em USD). 80/20 split mas vale cada % perdida — não precisei montar Stripe + tax compliance + checkout.

**3. MCP é canal de distribuição inexplorado.**
Plataformas como mcphub, mcp.so, glama.ai listam servidores MCP. Zero competidor em vertical de STR/Airbnb. Tráfego de dev AI agent → free leads.

**4. Disclaimer obrigatório pelo ToS.**
Qualquer Actor na Apify Store que toca em serviço de terceiro tem que ter "Unofficial. Not affiliated with [serviço]" claramente. Cláusula 2.1. Sem isso = unpublished.

**5. KYC primeiro, marketing depois.**
Cl. 11.2.4: 12 meses sem KYC completo = forfeit de toda receita acumulada. W-8BEN + Wise pra recebimento USD no BR. Travei 1 hora fazendo isso pra não esquecer.

Live em https://apify.com/ramosss/str-scout — feedback sincero é o que to procurando, principalmente "que feature falta" / "preço tá errado pra quem".

Aviso obrigatório: ferramenta não-oficial, sem vínculo com Airbnb Inc.
