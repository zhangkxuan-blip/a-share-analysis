# 实时数据与事实质量门禁

## Definitions

- Call a quote real time only when it comes from an authorized or licensed feed, includes a source event timestamp, and satisfies the configured latency rule.
- Call a public webpage quote near real time or delayed unless authorization and latency are known.
- Call post-close data official close as of YYYY-MM-DD, not current intraday data.
- Treat fundamentals as periodic data. Always show report period and announcement time.

## Source Priority

1. Exchange-authorized Level-1 or Level-2 feed, or authenticated broker market-data interface.
2. Exchange or CNInfo filings and official closing data.
3. A second independent licensed vendor for quote comparison.
4. Official government, statistics, regulator, and industry-authority publications.
5. Reputable media for event discovery and context.
6. Xueqiu and stock forums for opinion and sentiment only.

Never make an undocumented public endpoint the sole source of a real-time claim.

## Provider Health Card And Fallback

Before using a provider, record provider name, instrument coverage, authorization or license status, quote class (`real_time`, `near_real_time`, `delayed`, or `official_close`), contractual or observed latency, timestamp semantics, units, last successful fetch, current error, and fallback rank.

Use a declared fallback chain:

1. Authorized exchange feed or authenticated broker interface.
2. A second independent licensed vendor for cross-checking.
3. Exchange official close or filing data for non-intraday analysis.
4. Public finance pages only as delayed context or discovery leads unless their authorization and latency are proven.

Downgrading providers must also downgrade the claim. Never keep the word real time after falling back to a delayed or timestamp-free source. Do not confuse provider redundancy with independent validation when two sites ultimately redistribute the same upstream feed.

## Required Quote Fields

Require symbol, exchange, name, source, license_status, source_timestamp, fetched_at, market_phase, price, previous_close, currency, adjustment, and explicit volume and amount units.

## Real-Time Validation

1. Parse timestamps with an explicit timezone; use Asia/Shanghai for A-shares.
2. Reject a source timestamp more than 2 seconds in the future by default.
3. Require an authorized primary source. Use configurable maximum age; default to 5 seconds only when the feed contract supports it.
4. Compare a second timestamped snapshot aligned to a configurable time window.
5. Use price tolerance max(minimum_tick, primary_price * 0.001) by default. Label it engineering tolerance, not exchange guarantee.
6. Compare volume and amount only when snapshots cover the same cumulative interval and units.
7. Fail closed on missing timestamps, stale primary data, incompatible adjustment, symbol or name mismatch, or price conflict.

During call auction, suspension, midday break, close, or non-trading days, evaluate freshness against that phase. A suspended price can be valid when status and timestamp are valid.

## Financial And Corporate-Action Validation

- Prefer filed consolidated statements and the latest applicable report.
- Record report type, period, announcement date, restatement status, currency, and unit.
- After loading the latest filed report, scan later-dated earnings previews, preliminary results, and newly filed reports through the analysis cutoff. Keep forecasts separate from filed actuals, but use the fresher disclosure as an explicit second valuation anchor when it materially changes earnings power.
- Compare each financial disclosure's actual publication timestamp with the frozen quote timestamp. If it was published after that quote or after the close, label it not_reflected_in_snapshot_price; never discuss the close as though the market had already traded on it.
- Use weighted-average shares for EPS and average equity or assets for return ratios.
- Reconcile splits, dividends, rights issues, placements, buybacks, and ex-right adjustments.
- Separate attributable profit, non-recurring items, minority interests, and forecasts.

## Policy And News Validation

- Record publisher, title, document number when available, publication time, effective date, expiry or review date, and URL.
- Distinguish enacted rules, drafts, meeting statements, reports, interpretations, and rumors.
- Confirm company-specific material events against exchange announcements.
- Use event occurrence time, not only article publication time, to detect recycled news.

## Failure Output

When validation fails, state failed fields, what data was obtained, what cannot be claimed, and whether previous-close or filed-report analysis can continue. Never silently substitute stale data.

Known bundle boundary: this skill includes quote validation logic but no licensed market-data entitlement, broker login, or vendor credential. Data acquisition must be supplied by the runtime or user-authorized connector. Never write credentials into the skill.

## Authoritative Starting Points

- SSE market data: https://english.sse.com.cn/markets/dataservice/products/
- SSE trading: https://one.sse.com.cn/onething/gptz/
- SZSE: https://www.szse.cn/
- BSE: https://www.bse.cn/
- CNInfo: https://www.cninfo.com.cn/

## Ownership, Flow, And Product Data

- Record ownership cutoff, announcement date, denominator, holder classification, and reporting lag.
- Treat top-ten holders and fund reports as partial disclosed ownership, not the complete institutional register.
- Treat shareholder-count changes as concentration proxies, not exact retail holding changes.
- Require a documented provider classification before using large-, medium-, or small-order flow and prohibit investor-identity claims from Level-1 trades.
- For products and R&D, separate announcement, verification, shipment, mass production, and recognized revenue. Record R&D expense, capitalization, report period, and source.

## Frozen Snapshot And Module Cutoffs

After cross-source validation, create a final snapshot record with `snapshotId`, security code, price, previous close, volume, amount, source timestamps, capture time, and validation status. Current-price-dependent calculations must carry this snapshot ID. If the final price changes, recompute the whole dependent set; never patch only the headline price.

Maintain a cutoff record per module: quote, financial statements, ownership, shareholder count, policy, industry cycle, news, sentiment, and sector rotation. Report age in calendar or trading days as appropriate.

For shares and corporate actions, reconcile total shares, tradable shares, true free float when available, ex-right adjustments, splits, placements, and restricted-share releases. A derived denominator must state its class and date.

Use an evidence ledger with claim ID, claim class, source, as-of, definition, transformation, confidence, and unresolved conflict. A missing field remains unavailable.

## Cross-Module Consistency Gates

- One final snapshot ID for every price-dependent output.
- One accounting period and share basis for comparable valuation.
- One sector taxonomy and identical 5/20-day windows for rotation.
- One deduplicated sentiment sample card for each sentiment conclusion.
- Separate disclosed stock ownership from transaction-size proxies.
- Do not add potentially overlapping order figures.
