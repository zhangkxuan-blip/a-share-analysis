import assert from "node:assert/strict";
import { validateQuotePair } from "../scripts/validate_quotes.mjs";

const base = {
  symbol: "600000", exchange: "SSE", name: "浦发银行", source: "licensed-feed",
  license_status: "authorized", market_phase: "continuous_auction", price: 10,
  previous_close: 9.9, currency: "CNY", adjustment: "unadjusted"
};
const now = "2026-07-20T10:00:05+08:00";
const fresh = validateQuotePair(
  {...base, source_timestamp: "2026-07-20T10:00:03+08:00", fetched_at: now},
  {...base, source: "second-feed", price: 10.005, source_timestamp: "2026-07-20T10:00:02+08:00", fetched_at: now},
  {now}
);
assert.equal(fresh.ok, true);
assert.equal(fresh.canClaimRealtime, true);
const stale = validateQuotePair(
  {...base, source_timestamp: "2026-07-20T09:59:50+08:00", fetched_at: now},
  {...base, source: "second-feed", source_timestamp: "2026-07-20T09:59:50+08:00", fetched_at: now},
  {now}
);
assert.equal(stale.ok, false);
assert.ok(stale.errors.some(e => e.code === "stale_primary"));
const conflict = validateQuotePair(
  {...base, source_timestamp: "2026-07-20T10:00:03+08:00", fetched_at: now},
  {...base, source: "second-feed", price: 10.2, source_timestamp: "2026-07-20T10:00:03+08:00", fetched_at: now},
  {now}
);
assert.equal(conflict.ok, false);
assert.ok(conflict.errors.some(e => e.code === "price_conflict"));
const future = validateQuotePair(
  {...base, source_timestamp: "2026-07-20T10:00:10+08:00", fetched_at: now},
  {...base, source: "second-feed", source_timestamp: "2026-07-20T10:00:03+08:00", fetched_at: now},
  {now}
);
assert.ok(future.errors.some(e => e.code === "future_timestamp"));
const close = validateQuotePair(
  {...base, market_phase: "closed", source_timestamp: "2026-07-17T15:00:00+08:00", fetched_at: now},
  {...base, source: "second-feed", market_phase: "closed", source_timestamp: "2026-07-17T15:00:00+08:00", fetched_at: now},
  {now}
);
assert.equal(close.ok, true);
assert.equal(close.canClaimRealtime, false);
assert.equal(close.validAs, "official_close");
export const passed = true;
