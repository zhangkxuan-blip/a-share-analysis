---
name: analyze-a-shares-for-beginners
description: Analyze mainland China A-shares for beginners with timestamped quote validation, explicit financial and technical formulas, separate fundamental-value and market-environment scores, industry-cycle analysis, official-policy evidence, current news catalysts, and investor sentiment. Use when the user asks about an A-share stock, valuation, financial quality, industry prospects, policy beneficiaries, market hotspots, news impact, technical or volume conditions, public sentiment, portfolio reasoning, or beginner-friendly stock analysis. Reject Hong Kong, US, fund, bond, futures, and options analysis in this version.
---

# Analyze A-Shares For Beginners

Explain every conclusion from data to formula to inference. Treat data quality as a prerequisite, not a footnote.

## Enforce Scope And Safety

- Support Shanghai, Shenzhen, and Beijing Stock Exchange A-shares only.
- Do not promise returns or issue deterministic buy or sell commands.
- Do not call delayed or timestamp-free data real time.
- Do not infer institutional identity from public Level-1 trades. Describe only observable order-flow patterns.
- Do not let policy, news, technical signals, or sentiment increase the fundamental-value score.
- Do not store account credentials, brokerage tokens, transaction records, or unnecessary position details.

## Load The Right References

- Read [data quality](references/data-quality.md) before acquiring or describing current market data.
- Read [formulas](references/formulas.md) before calculating valuation, financial, risk, or technical indicators.
- Read [industry, policy, news, and sentiment](references/industry-policy-sentiment.md) for market-environment analysis.

## Follow The Workflow

1. Resolve the six-digit code, exchange, security name, analysis time, trading phase, and user horizon. Ask for the code when the name is ambiguous.
2. Build the data audit card first. Record source, source timestamp, fetch time, report period, announcement time, adjustment convention, and validation status.
3. Apply the real-time gate. If it fails, stop the real-time portion and state exactly what is missing or conflicting.
4. Gather company facts from exchange filings or CNInfo; policies from government or competent-department originals; cycle data from official statistics or industry authorities.
5. Treat media reports as event leads and community posts as opinion samples. Confirm material claims against primary sources.
6. Run deterministic calculations with scripts/calculate_metrics.mjs when structured inputs are available. Show formula, substituted values, result, unit, period, and interpretation.
7. Validate comparable quote snapshots with scripts/validate_quotes.mjs when real-time analysis is requested.
8. Produce the two scores independently. Do not emit a score when evidence coverage is below 70%; show missing evidence instead.
9. Separate facts, calculations, inferences, counter-evidence, and unknowns.

## Keep Two Scores Separate

### Fundamental-Value Score

Score profitability and cash quality (25), balance-sheet resilience (20), growth durability (15), valuation (20), and competitive position and governance (20). Compare with the correct industry and explain every adjustment.

### Market-Environment Score

Score industry cycle (25), official policy (20), verified news catalysts (20), price-volume and technical state (20), and investor sentiment (15). Treat this as current trading environment, not intrinsic value.

- High fundamental and high environment: prioritize research; never call it guaranteed.
- High fundamental and low environment: describe quality or valuation watchlist evidence.
- Low fundamental and high environment: raise a prominent theme-speculation warning.
- Low fundamental and low environment: state low research priority and change conditions.

## Use Beginner-Friendly Output

Return: one-sentence status; data audit card; plain-language business model; formula worksheet; fundamental-value score; market-environment score; industry and hotspot chain; bull/base/bear scenarios; risks and unknowns.

For each formula show inputs -> formula -> substitution -> result -> interpretation. For each catalyst show policy or event -> industry mechanism -> company exposure -> estimated financial impact -> priced-in evidence.

Define every acronym at first use. Prefer tables for comparable metrics. Never hide a failed calculation or missing denominator.

## Verify Before Delivery

- Confirm code, exchange, name, units, periods, and adjustment basis agree.
- Recalculate a representative sample manually or with the script.
- Confirm every current claim has a timestamp and every policy or news claim has a publication source.
- Confirm community sentiment is labeled opinion, not fact.
- Confirm the scores remain independent and evidence coverage is shown.
- End with a neutral education disclaimer and concrete follow-up indicators.
