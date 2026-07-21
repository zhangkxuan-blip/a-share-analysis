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

## Authoritative Starting Points

- SSE market data: https://english.sse.com.cn/markets/dataservice/products/
- SSE trading: https://one.sse.com.cn/onething/gptz/
- SZSE: https://www.szse.cn/
- BSE: https://www.bse.cn/
- CNInfo: https://www.cninfo.com.cn/
