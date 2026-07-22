# A股估值建模

## Prerequisites

Require three to five years of filed consolidated income statements, balance sheets, cash-flow statements, share-count history, corporate actions, and segment information. Record periods, units, restatements, and announcement dates. Do not invent missing history or analyst estimates.

## Build The Model

1. Model revenue from auditable operating drivers such as volume, price, stores, users, capacity, utilization, or market share.
2. Project gross margin, operating expenses, tax, working capital, depreciation, capital expenditure, and financing consistently across the three statements.
3. Reconcile ending cash, debt, retained earnings, and diluted shares.
4. Derive FCFF from the modeled statements rather than applying an arbitrary growth rate to one cash-flow number.
5. Build bear, base, and bull cases by changing operating assumptions. Make scenario probabilities sum to one and state why.
6. Run `scripts/valuation_scenarios.mjs` for DCF, WACC-terminal-growth sensitivity, and comparable valuation.

## Comparable Companies

Select peers by business model, revenue source, margin structure, growth, capital intensity, geography, and cycle exposure. Exclude a peer or normalize its metric when earnings are negative, distorted by one-offs, or use a different accounting period.

Report the peer count, selected multiple, minimum, 25th percentile, median, 75th percentile, maximum, and every excluded peer with reason. Prefer median to mean when the distribution is skewed. Never use a high-growth peer multiple without explaining the target company's growth gap.

## Sector-Specific Methods

- Banks: emphasize PB, ROE, dividend discount, net interest margin, asset quality, and provision coverage; avoid EV/EBITDA.
- Insurers: emphasize embedded value, new-business value, solvency, and investment spread.
- Cyclicals: normalize mid-cycle volume, spread, utilization, and margins; do not capitalize peak earnings.
- Pre-profit growth companies: use scenario revenue, gross profit, cash runway, and dilution; mark PE unavailable.
- Asset-heavy utilities: reconcile regulated returns, capex, debt, and dividend capacity.

## Quality Gates

- Require WACC greater than terminal growth.
- Reconcile enterprise value to common equity value.
- Use diluted rather than basic shares when dilution is material.
- Show how much enterprise value comes from terminal value.
- Flag a model when terminal value exceeds 85% of enterprise value, when one assumption explains most of the upside, or when peer dispersion is too wide for a useful point estimate.
- Present a range and change conditions, not a deterministic target or trade command.

## Historical Position And Result-First Scenarios

- Use at least 24 valid observations; prefer monthly observations spanning five to ten years and multiple market regimes.
- Compare the same valuation definition, share basis, accounting period, and adjustment convention. Exclude negative or near-zero denominators.
- Report current multiple, percentile, p10, p25, median, p75, p90, peer median, and the reasonableness conclusion.
- Show conservative, neutral, and optimistic per-share values plus versus-current percentages and a probability-weighted reference when probabilities are valid.
- Keep full DCF and sensitivity calculations available for audit, but default to the result table and the operating assumptions that explain the range.

## Bottom Reference Zone

Combine at least two independent anchors: normalized valuation floor, bear-case value, technical or volume-profile support, or a sector-appropriate asset anchor. Show overlap, dispersion, volatility buffer, confidence, and invalidation. If the anchors do not overlap, do not force a bottom estimate.

## Same-Definition Historical Valuation Gate

A numerical historical percentile is allowed only when current and historical multiples share the same earnings/book period, consolidated scope, diluted or basic share basis, price-adjustment convention, treatment of negative denominators, and vendor calculation method. Record each item. If any material item is unknown, replace the percentile with a low-confidence directional indication and identify the mismatch.

## Scenario Assumption Provenance

For each bear/base/bull input, attach the best available provenance: filed guidance, audited history, disclosed order conversion, margin bridge, official industry forecast, comparable-company range, or analyst judgment. Analyst judgment must be labeled scenario rather than fact.

Do not calculate a probability-weighted value merely because three subjective probabilities sum to 100%. Require `probabilitiesCalibrated: true` backed by an explicit historical base rate or calibration record. Otherwise show scenario ranges and relative upside/downside only.

## Independent Bottom-Anchor Families

Classify every anchor as one of: technical, earnings_cashflow, asset_value, or trading_volume. Require at least two distinct families. Differently named PE-based anchors remain one family. If family centers do not overlap within a stated tolerance, return unavailable or a low-confidence support-observation zone rather than forcing quartiles into a range.
