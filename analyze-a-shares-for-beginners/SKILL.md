---
name: analyze-a-shares-for-beginners
description: Analyze and compare one or multiple mainland China A-shares for beginners with a frozen cross-checked quote snapshot, transparent evidence coverage, result-first valuation and profitability, official-policy alignment, industry cycle and moat, bear/base/bull scenarios, disclosed ownership, carefully labeled flow and sentiment proxies, sector rotation, products, R&D, turnover, volume ratio, and short-versus-long-horizon suitability. Use for single-stock research, multi-stock comparison, valuation, policy beneficiaries, industry prospects, institutional holdings, capital flows, market hotspots, screening, ranking requests, or beginner-friendly A-share reasoning. Reject Hong Kong, US, fund, bond, futures, and options analysis in this version.
---

# Analyze A-Shares For Beginners

Deliver a compact, result-first A-share research report. Keep calculations auditable, but show formula substitutions only when the user requests detailed mode. Prefer a clear “unavailable” over a precise-looking weak estimate.

## Enforce Scope And Evidence Boundaries

- Support Shanghai, Shenzhen, and Beijing Stock Exchange A-shares only.
- Do not promise returns or issue deterministic buy or sell commands.
- Label validated Sina-Tencent public quotes as public cross-checked near real time, never licensed real time.
- Freeze one final quote snapshot after validation. Give it a snapshot ID and bind every current-price-dependent multiple, upside/downside, price level, turnover, and volume-ratio conclusion to that snapshot. Never mix prices captured at different times.
- Do not call an industry or company a national strategic core merely because a broad policy mentions its theme. Require formal policy task -> implementation mechanism -> verified company exposure.
- Do not infer institution or retail identity from public Level-1 trade size. Large/small-order data are trade-size proxies only. Price-volume pressure is not capital inflow or outflow.
- Do not fabricate weekly or monthly retail ownership changes. Use dated, comparable shareholder-count endpoints; otherwise report unavailable.
- Present future sector leadership as scenarios with confirmation and invalidation conditions, never as certain forecasts.
- Call a price range a bottom reference zone, not a guaranteed bottom. Require at least two distinct anchor families, not merely two differently named indicators.
- Do not add order backlog, newly signed contracts, framework agreements, and announced awards unless non-overlap is explicitly verified.
- Keep fundamental-value and market-environment scores independent and expose earned points, available points, coverage, and confidence.

## Load The Right References

- Read [data quality](references/data-quality.md) before using current prices, ownership, flows, filings, policy, or product claims.
- Read [data provider integration](references/data-provider-integration.md) for licensed quote routing and [public data acquisition](references/public-data-acquisition.md) for the no-account fallback.
- Read [formulas](references/formulas.md) before calculating valuation, profitability, turnover, volume ratio, ownership, or flow proxies.
- Read [valuation modeling](references/valuation-modeling.md) for historical valuation comparability, bear/base/bull valuation, comparables, and bottom reference zones.
- Read [strategic moat and cycle](references/strategic-moat-cycle.md) for plan alignment, barriers, leadership, domestic substitution, import dependence, cycle, products, R&D, and order-overlap control.
- Read [ownership, flows, and market rotation](references/ownership-flows-market.md) for institutions, shareholder-count trends, trade-size proxies, turnover denominators, volume-ratio modes, and sector comparability gates.
- Read [industry, policy, news, and sentiment](references/industry-policy-sentiment.md) and [research operations](references/research-operations.md) for catalysts, sentiment sample gates, thesis tracking, and forecast calibration.
- Read [result dashboard](references/result-dashboard.md) before composing the final report.
- Read [batch comparison output](references/batch-comparison-output.md) whenever the request contains two or more stocks, asks for a shortlist, or asks for ranking.
- Read [output regression lessons](references/output-regression-lessons.md) after every real-stock run and add any newly observed failure mode with a matching rule or test.

## Follow The Workflow

1. Resolve code, exchange, name, timestamp, market phase, and intended horizon.
2. Build a module data audit: quote time, report period, ownership cutoff, policy/news/sentiment cutoffs, methodology, staleness, and missing evidence.
3. Route licensed snapshots through `scripts/provider_router.mjs`; otherwise use `scripts/public_quote_sources.mjs`. Validate and then freeze one final snapshot before any dependent calculation.
4. Gather filings from the exchange or CNInfo; policies from the national plan, State Council, NDRC, MIIT, or competent authority; cycle indicators from official statistics or industry authorities.
5. Map policy instrument -> industry mechanism -> company exposure -> revenue/cost effect -> implementation horizon -> priced-in evidence.
6. Map demand, supply, capacity, inventory, price, margin, capex, and market share to cycle stage and evidence-based duration.
7. Evaluate barriers, leadership, substitutability, scarcity, pricing power, component-level import dependence, and domestic substitution from operating facts.
8. Run `scripts/calculate_metrics.mjs`, `scripts/valuation_scenarios.mjs`, and `scripts/decision_metrics.mjs` when structured inputs are available.
9. Pass historical multiples through the same-definition gate: denominator period, share basis, adjustment convention, accounting scope, and vendor methodology must be comparable. Otherwise use only a low-confidence “near historical low/high indication,” never a numeric percentile.
10. Build bear/base/bull values from traceable assumptions. Do not show probability-weighted value unless probabilities are calibrated from an explicit base rate and the structured input declares `probabilitiesCalibrated: true`, or the user explicitly requests a hypothetical weighting with assumptions.
11. Use filed top shareholders and fund disclosures for named institutions. Use shareholder count and trade-size indicators only as labeled proxies.
12. Rank 5-day and 20-day sectors only from comparable windows for return, breadth, turnover-share change, and verifiable ETF or financing flows. If the gate fails, mark sector ranking unavailable rather than stitching together daily media anecdotes.
13. Apply the sentiment sample gate and deduplication rules. Sparse snippets may support a low-confidence observation, not a scored crowd-consensus claim.
14. Produce a score only when coverage reaches 70%. Show raw earned/available points and coverage; normalized /100 scores are optional and must not hide missing modules.
15. Classify horizon suitability and state current status, confirmation, weakening, invalidation, and next catalyst. Track forecasts with `scripts/evaluate_forecasts.mjs`.
16. For two or more stocks, switch to batch mode. Use separate business-quality and valuation/timing axes. Do not emit a precise linear ranking unless the rubric, earned/available points, coverage, tie-breakers, and missing-data treatment are visible.

## Default Output: Three Layers

1. **One-screen decision brief:** one-sentence status, frozen quote card, transparent two-score card, three positive drivers, three risks, suitability, confirmation/invalidation, and next catalyst.
2. **Compact 18-topic table:** one row per requested topic with result, decisive metric, as-of, confidence, and claim class. Mark missing items unavailable.
3. **Evidence and gap ledger:** sources, data cutoffs, proxies, unresolved conflicts, and what would close each gap.

Do not repeat the 18 topics again as six long prose modules. Expand only the three to five items that change the conclusion. Offer calculations and full evidence chains as an optional appendix.

For multi-stock work, preserve the same three layers through compact cross-stock tables instead of multiplying the single-stock template. Every requested topic must remain visible for every security or be marked unavailable.

## Scoring And Claim Classes

- Score card columns: module, earned points, available points, coverage, confidence.
- If available points are below 70% of designed points, do not publish a normalized score.
- Label material claims as fact, derived metric, proxy, or scenario.
- A proxy cannot silently become a fact in the conclusion.
- Separate business value from market timing; a strong company may still have a weak market setup.

## Verify Before Delivery

- Confirm code, exchange, name, units, periods, share basis, adjustment convention, and final snapshot ID.
- Confirm every current-price-dependent output uses the frozen snapshot.
- Confirm policy claims use formal sources and do not jump from industry support to company certainty.
- Confirm institution names come from disclosures; trade-size and signed-volume proxies never use institution/retail or inflow/outflow identity labels.
- Confirm historical valuation passes the same-definition gate before showing a percentile.
- Confirm scenario assumptions have provenance and probability weighting is calibrated or omitted.
- Confirm the bottom zone uses at least two anchor families and reports dispersion, confidence, and invalidation.
- Confirm turnover names its denominator class and intraday volume ratio names its benchmark mode.
- Confirm sector windows are comparable, sentiment meets the sample gate, and order numbers are not double counted.
- Confirm all 18 topics appear or are explicitly unavailable.
- For batch reports, confirm no unlabeled ordinal ranking, bare scenario-price triplet, technical-only “bottom,” undated holding percentage, or returns-only “sector-flow leader” appears.
- Confirm the final answer contains no duplicated module-by-module restatement.
