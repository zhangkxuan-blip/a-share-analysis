import assert from "node:assert/strict";
import { routeProviders } from "../scripts/provider_router.mjs";

const now = "2026-07-20T10:00:05+08:00";
const baseSnapshot = {
  symbol: "600000", exchange: "SSE", name: "浦发银行", license_status: "authorized",
  source_timestamp: "2026-07-20T10:00:03+08:00", fetched_at: now,
  market_phase: "continuous_auction", price: 10, previous_close: 9.9,
  currency: "CNY", adjustment: "unadjusted"
};
const providers = [
  {id:"p1",upstream_id:"u1",authorization_status:"authorized",quote_class:"real_time",health_status:"healthy",priority:1,expected_latency_ms:1000,snapshot:{...baseSnapshot,source:"p1"}},
  {id:"p2",upstream_id:"u2",authorization_status:"licensed",quote_class:"level_1",health_status:"healthy",priority:2,expected_latency_ms:1000,snapshot:{...baseSnapshot,source:"p2",price:10.005,license_status:"licensed"}}
];
const ok = routeProviders(providers,{now});
assert.equal(ok.canClaimRealtime,true);
assert.deepEqual(ok.selectedProviders,["p1","p2"]);
const sameUpstream = routeProviders(providers.map(item=>({...item,upstream_id:"shared"})),{now});
assert.equal(sameUpstream.canClaimRealtime,false);
assert.ok(sameUpstream.errors.some(error=>error.code==="no_independent_realtime_secondary"));
const delayed = routeProviders([{id:"web",upstream_id:"web",authorization_status:"unknown",quote_class:"delayed",health_status:"healthy",priority:1,snapshot:{...baseSnapshot,source:"web",license_status:"unknown"}}],{now});
assert.equal(delayed.classification,"delayed");
assert.equal(delayed.canClaimRealtime,false);
export const passed = true;
