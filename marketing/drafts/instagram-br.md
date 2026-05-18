**Channel:** Instagram (BR STR investor community)
**Mode:** Manual upload via app (Instagram blocks API auto-post for free accounts)
**Strategy:** 3 carrossel posts ao longo de 1-2 semanas + stories diários por 3 dias

---

## Post 1 — "Como eu validei 5 imóveis pra Airbnb gastando $5"

**Slide 1 (capa):**
🏠 Como validar 5 imóveis pra Airbnb
🏠 gastando US$ 5
🏠 (em vez de $200/mês de assinatura)

**Slide 2:**
O problema:
Toda ferramenta séria de análise STR cobra US$ 200+/mês.
Pra avaliar 5 imóveis por trimestre você paga US$ 40 por análise.

Cabe no seu jogo? Pra mim não cabia.

**Slide 3:**
Construí uma alternativa: **STR Scout**

Pague por consulta. $1 por análise completa de um endereço.

Sem assinatura. Sem trial. Sem upsell.

**Slide 4 — exemplo real:**
Endereço: 1234 South Congress, Austin TX
Aluguel longo prazo: $2800/mês

Análise:
✅ Regulação: permitido
⚠️ Score: 41/100 → EVITAR
❌ Projeção líquida: -$22k/ano
❌ Break-even occupancy: 55%
❌ Mercado mediano: 24% (oversaturated)

Custo da análise: $1

**Slide 5 — CTA:**
👉 Link na bio
🔗 apify.com/ramosss/str-scout

Aviso obrigatório: ferramenta NÃO oficial, sem vínculo com Airbnb Inc.

---

## Post 2 — "As cidades que BANIRAM Airbnb que você não sabia"

**Slide 1 (capa):**
🚫 As cidades que estão BANINDO ou
🚫 restringindo Airbnb pesado
🚫 (e que você precisa saber)

**Slide 2 — Nova York:**
🇺🇸 NYC — RESTRITO
Lei 18/2023:
• Host tem que estar presente
• Máximo 2 hóspedes
• Só residência primária
• Registro obrigatório no Mayor's Office

= Não-hosted whole-home Airbnb basicamente proibido.

**Slide 3 — Barcelona:**
🇪🇸 Barcelona — BANIDO
Sem novas licenças HUTB desde 2014.
Prefeitura anunciou phase-out total até 2028.

Comprou apartamento em Barcelona pra Airbnb? Bad call.

**Slide 4 — Lisboa:**
🇵🇹 Lisboa — RESTRITO POR ZONA
"Zonas de contenção" no centro:
• Alfama, Bairro Alto, Castelo, Mouraria
• Suspensão de novas licenças AL nessas zonas

Verifica ANTES de comprar.

**Slide 5:**
🇫🇷 Paris — 120 noites/ano cap
🇬🇧 Londres — 90 noites/ano cap
🇺🇸 Miami Beach — banido em zonas residenciais, multa $20k

**Slide 6 — CTA:**
Quer checar a regulação de uma cidade específica?
Tool faz isso por $0.10 (10 centavos USD).

👉 Link na bio

---

## Post 3 — "Pra quem investe em STR e usa Claude/ChatGPT/Cursor"

**Slide 1 (capa):**
🤖 Você usa Claude ou Cursor?
🤖 Aí seu agente pode analisar
🤖 Airbnb por você direto

**Slide 2 — o que é MCP:**
MCP = Model Context Protocol
Forma do Claude/Cursor chamarem ferramentas externas.

Tipo: "Claude, vê se esse imóvel em Austin vale STR" → ele chama a ferramenta certa e retorna a resposta.

**Slide 3 — config:**
Edita o config do Claude Desktop:
```json
{
  "mcpServers": {
    "str-scout": {
      "url": "https://ramosss--str-scout.apify.actor/mcp",
      "headers": {
        "Authorization": "Bearer <seu_token_apify>"
      }
    }
  }
}
```

**Slide 4:**
Pronto. Reinicia Claude.

Pergunta:
"Score 1234 South Congress, Austin TX pra STR"

Ele chama: regulations → market-analysis → arbitrage-score
Retorna: 41/100 (AVOID), com narrative completa.

**Slide 5 — CTA:**
Quem é dev BR investidor de STR vai gostar.

👉 apify.com/ramosss/str-scout

---

**Stories diários durante 3 dias:**
- Dia 1: screenshot da análise rolando + "$1 por isso?"
- Dia 2: print do log do Claude chamando a tool sozinho
- Dia 3: enquete "qual cidade vocês querem que eu adicione regulações?" (engagement bait)
