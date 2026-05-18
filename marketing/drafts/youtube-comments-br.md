**Channel:** Comentários em vídeos de creators BR de STR
**Mode:** Playwright + sua cookie do YouTube (script comenta em N URLs)
**Estratégia:** comentários de VALOR, não spam. Cada comentário responde algo específico do vídeo + agrega contexto + mention discreta ao tool

---

## Creators BR-alvo (pesquisar últimos 5-10 vídeos de cada)

- **Eduardo Hayashi** (Anfitrião Profissional)
- **Hospede360** (community channel)
- **Renan Bonifácio** (locação curta temporada)
- **Eduardo Cunha** (investimento STR)
- **Plenosocial** (gestão de hospedagem)
- **Locação Profissional** (Hayashi's other channel)
- **Mestres da Locação** (podcast/canal)
- **Ricardo Ferreira / Anfitrião BR**
- **Outros canais menores BR de STR investing**

⚠️ Não comentar em TODOS os vídeos do mesmo canal no mesmo dia (YouTube rate-limita). Distribuir 1-2 comentários por canal por dia ao longo de 5-7 dias.

---

## Template 1 — Vídeo sobre análise de mercado de cidade específica

(Quando o creator analisa Lisboa, Florianópolis, Gramado, etc.)

> Boa análise da [cidade]! Pra quem quiser cruzar com dados de mercado em tempo real, eu construí uma tool que retorna ADR mediano, ocupação estimada e score de saturação de qualquer cidade por $0.50 (apify.com/ramosss/str-scout). Tinha pago AirDNA antes mas o ratio custo/benefício pra avaliar poucas cidades por trimestre não fechava. Não vinculado ao Airbnb, ferramenta independente.

---

## Template 2 — Vídeo sobre escolha de imóvel pra STR

(Quando o creator fala sobre vetting de propriedade)

> Excelente checklist! Adiciono uma coisa que aprendi recentemente: regulação local muda jogo. Lisboa por exemplo tem "zonas de contenção" onde novas licenças AL estão suspensas. Construí uma tool ($0.10 por consulta) que retorna status regulatório de várias cidades — mais barato que descobrir depois de comprar. Link: apify.com/ramosss/str-scout. Disclaimer: tool não oficial, sem vínculo com Airbnb.

---

## Template 3 — Vídeo sobre precificação / dynamic pricing

(Quando o creator fala em ajustar preço de listing)

> Excelente conteúdo sobre pricing. Pra benchmarking, recomendo cruzar com o ADR mediano da sua cidade — o que P25/P75 indica é se você tá undercharging ou overcharging. Tem uma tool que faz essa análise por $0.50 (apify.com/ramosss/str-scout) sem precisar assinar nada. Útil pra fazer ajuste pontual sem committment mensal.

---

## Template 4 — Vídeo sobre arbitrage (locação longa → STR)

(Vídeos discutindo o modelo de sublocar pra Airbnb)

> Arbitrage é exatamente o que mais quebra na conta: a gente acha que ocupação é 60-70% mas o mercado mediano é 20-30% em mercados saturados. Construí uma tool ($1 por análise) que faz o score de viabilidade pra endereço específico — combina regulação + comps + projeção de net income com break-even occupancy. Link: apify.com/ramosss/str-scout (não oficial, sem vínculo Airbnb).

---

## Template 5 — Vídeo sobre regulação

(Vídeos discutindo leis Airbnb por cidade)

> Excelente cobertura. Vale adicionar pra audiência: Barcelona phase-out até 2028 anunciado, Lisboa restringiu "zonas de contenção", NYC virou basicamente só "host present". Pra quem quer consulta rápida atualizada por cidade, fiz uma tool por $0.10 a consulta (apify.com/ramosss/str-scout). Tô atualizando trimestralmente. Ferramenta não oficial.

---

## Regras gerais pra evitar shadowban / moderação

1. **Sempre agregue valor primeiro.** Só mencione o tool depois de 1-2 frases de contexto útil.
2. **NUNCA poste o mesmo comentário literal em 2 vídeos.** Varie o opening, a frase de transição.
3. **Não mencione concorrentes pelo nome** salvo no padrão "antes pagava X" (referência casual). Falar mal de concorrente direto = downvote magnet.
4. **Sempre disclaimer:** "não oficial / sem vínculo com Airbnb" no fim do comentário ou claramente embedded.
5. **Distribuir no tempo:** 2-3 comentários por dia máximo. Mais que isso o algoritmo vai flagar.

---

**Playwright script (`youtube-comment.ts`):**
- Input: lista de URLs de vídeo + qual template pra cada
- Pra cada URL: abre vídeo, scroll até a área de comentários (lazy load), preenche o comentário, click "Comentar"
- Screenshot após posting
- Delay 30-60s entre cada (humanize)
- Se YouTube apresentar challenge (captcha, "are you human"), halt and ask user
