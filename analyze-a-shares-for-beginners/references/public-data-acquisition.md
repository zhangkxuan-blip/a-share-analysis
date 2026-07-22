# 无券商账户的公开行情接入

Use this mode only when the user declines broker or licensed-vendor integration.

## Source Layout

- Use Sina full quote as the primary public snapshot because it exposes exchange date and time fields.
- Use Tencent full quote as the second public snapshot and require matching symbol, name, phase, timestamp window, and price tolerance.
- Use Sina or Eastmoney minute bars only for intraday shape and volume distribution, not as proof of institutional identity.
- Use exchange official close and CNInfo filings for end-of-day and corporate facts.

Run `scripts/public_quote_sources.mjs` to fetch, parse, and compare Sina and Tencent snapshots.
Use its fetchPublicMinuteBars function for up to 250 one-minute Sina bars when intraday volume analysis is requested.

## Return Contract

Read quote payloads from result.sources.sina.quote and result.sources.tencent.quote. Read the gate outcome from result.validation. The fetch result intentionally has no top-level quotes array. Treat a missing source quote as degraded data, even when the other public endpoint succeeds.

## Required Label

Always label a passing result `public_cross_checked_near_real_time`. Never call it licensed real time because the public endpoints do not provide a contractual latency SLA or redistribution authorization to this skill.

If either endpoint lacks an exchange timestamp, returns stale data, disagrees on price, changes schema, or is unavailable, fail the current-price analysis. Continue only with a clearly dated public snapshot, official close, or filings.

## Known Risks

- Endpoints can change without notice, rate-limit, block automated clients, or return cached data.
- Two websites may still share an upstream lineage that is not publicly documented.
- North Exchange symbol coverage can differ by provider.
- Browser fetches and local scripts may have different network permissions.
- Public Level-1 volume patterns cannot identify a specific institution or prove accumulation or distribution.
- After close, public sites may continue refreshing server timestamps. Validate the same trade date and price/OHLC agreement instead of applying the intraday 15-second alignment rule.

## Maintenance

Keep fixture tests for both response formats. Treat parser field-count failures as schema-change alarms. Review the endpoint behavior after repeated outages rather than silently changing field indexes.
