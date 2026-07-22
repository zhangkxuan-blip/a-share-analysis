# A股实时数据供应商接入

## Architecture

Use this flow:

`authorized connector -> normalized quote contract -> provider router -> dual-source validation -> audit card -> analysis`

Keep provider-specific SDKs outside the skill. Make each connector return the normalized structures below. Use `scripts/provider_router.mjs` to select and validate providers.

## Source Tiers

1. Use an exchange-authorized Level-1 or Level-2 vendor or authenticated broker interface as the primary source.
2. Use a second licensed provider with a different upstream feed for cross-checking.
3. Use exchange official close and filings when intraday data is unavailable.
4. Use public pages, AkShare-style aggregators, and undocumented endpoints only as delayed context or discovery leads.

Official starting points:

- SSE real-time products and licensing: https://english.sse.com.cn/markets/dataservice/products/
- SZSE data services: https://www.szse.cn/English/services/dataServices/index.html
- BSE market-data authorization: https://www.bse.cn/application/guide.html

The exchange pages distinguish real-time, delayed, and end-of-day products and require authorization for redistribution or use. Never infer authorization from a library name.

## Normalized Provider Contract

Require a provider health record:

```json
{
  "id": "broker-a",
  "upstream_id": "licensed-upstream-a",
  "authorization_status": "broker_authenticated",
  "quote_class": "real_time",
  "health_status": "healthy",
  "priority": 10,
  "expected_latency_ms": 1000,
  "last_success_at": "2026-07-20T10:00:05+08:00",
  "snapshot": {}
}
```

Require the snapshot fields defined in `data-quality.md`. Preserve the provider event timestamp; do not replace it with fetch time. Record cumulative volume and amount units explicitly.

## Routing Rules

- Select only healthy, authorized, real-time providers for a real-time claim.
- Require two providers with different `upstream_id` values.
- Apply the stricter of the provider SLA and configured freshness threshold.
- Fail closed on stale timestamps, price conflicts, incompatible adjustment, or shared upstream lineage.
- If validation fails, keep the best available snapshot but classify it as `not_real_time`, `delayed`, or `official_close`.
- Never retry indefinitely. Record the failure and continue with filings or official-close analysis when useful.

## Connector Implementation

Implement a new connector by providing one `fetchQuote(symbol)` operation that returns the provider record and normalized snapshot. Keep credentials in the runtime secret store or environment injection. Never place keys, cookies, brokerage accounts, or refresh tokens in this skill.

Verify a connector with market-open, midday-break, suspended, post-close, stale, future-timestamp, corporate-action, and provider-outage fixtures before enabling it.

## Deployment Solution

Use three phases:

1. Run the included router with fixture or caller-supplied snapshots immediately.
2. Connect the user's authenticated broker or licensed data vendor to the normalized contract.
3. Add a second independently licensed provider and monitor freshness, disagreement rate, failure rate, and fallback frequency.

Without phases 2 and 3, report that the real-time infrastructure is incomplete even when the analysis workflow itself is available.

## No-Account Public Alternative

When the user declines broker and vendor integration, use the Sina-Tencent adapter in `scripts/public_quote_sources.mjs`. This provides a timestamped, dual-website, near-real-time snapshot without credentials. Keep it outside the licensed real-time tier and follow `public-data-acquisition.md`.
