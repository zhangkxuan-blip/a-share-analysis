# 催化剂、观点跟踪与研究运营

## Catalyst Calendar

Record event ID, expected date or window, event type, primary source, affected operating driver, expected direction, uncertainty, priced-in evidence, and first confirmation metric. Separate scheduled events, conditional events, and rumors. Never turn a rumor into a dated catalyst.

## Thesis Tracker

Maintain one current thesis with supporting facts, counter-evidence, confirmation conditions, weakening conditions, invalidation conditions, next review date, and status. Use `scripts/research_state.mjs` to validate and update the state. An invalidation event must not be overwritten by adding unrelated positive evidence.

## Watchlist And Morning Note

For each watchlist item store only ticker, thesis summary, next catalyst, review date, and non-sensitive user notes. Do not store brokerage credentials, account balances, transactions, cost basis, or position size unless the user explicitly authorizes the exact storage.

Generate a morning note from:

1. overnight macro and commodity changes relevant to the industry;
2. official policy and company announcements since the previous cutoff;
3. catalyst calendar changes;
4. provider health and quote availability;
5. thesis status changes and indicators due for review.

Do not automate notifications or write persistent watchlists unless the user explicitly requests the schedule, destination, and storage location.

## Forecast Calibration

Store dated, falsifiable forecasts rather than vague narratives. For probabilistic events record predicted probability and binary outcome. For directional forecasts record horizon, benchmark, predicted direction, and realized return.

Run `scripts/evaluate_forecasts.mjs` to calculate Brier score, probability calibration buckets, directional accuracy, and sample coverage. Show sample size and unresolved forecasts. Do not compare strategies unless horizons, universes, and costs are comparable.

## Backtest Boundary

Before presenting a historical strategy result, account for survivorship bias, look-ahead bias, announcement-time availability, corporate actions, trading suspension, price limits, fees, slippage, liquidity, and failed orders. Separate exploratory backtests from forward results. Never use an in-sample result as evidence of future return.

## Five-Day And Twenty-Day Rotation Forecasts

Define next week as the next 5 trading days and next month as the next 20 trading days. Store the forecast cutoff, eligible sector universe, scenario probabilities, expected leaders, benchmark, confirmation, and invalidation.

Do not publish one certain leading sector. Use two to four scenarios and label uncalibrated probabilities as judgmental. When testing a rotation rule, use point-in-time constituents and announcements, multiple regimes, realistic trading costs, parameter sensitivity, and out-of-sample or walk-forward evaluation. Prefer stable ranges over the best in-sample parameter.
