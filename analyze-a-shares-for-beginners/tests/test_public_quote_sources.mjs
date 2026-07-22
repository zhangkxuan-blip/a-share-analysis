import assert from "node:assert/strict";
import { fetchPublicQuotePair, normalizePublicSymbol, parseSinaMinuteBars, parseSinaQuote, parseTencentQuote, validatePublicQuotePair } from "../scripts/public_quote_sources.mjs";

const fetchedAt = "2026-07-20T10:00:05+08:00";
const sinaText = 'var hq_str_sh600519="贵州茅台,1500.00,1490.00,1501.00,1510.00,1495.00,0,0,123456,185000000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2026-07-20,10:00:03,00";';
const tencentFields = Array(86).fill("");
tencentFields[0] = "1"; tencentFields[1] = "贵州茅台"; tencentFields[2] = "600519";
tencentFields[3] = "1501.01"; tencentFields[4] = "1490.00"; tencentFields[5] = "1500.00";
tencentFields[6] = "1234"; tencentFields[30] = "20260720100002"; tencentFields[33] = "1510.00"; tencentFields[34] = "1495.00";
const tencentText = `v_sh600519="${tencentFields.join("~")}";`;

assert.deepEqual(normalizePublicSymbol("600519"), {code:"600519",providerSymbol:"sh600519",exchange:"SSE"});
assert.throws(() => normalizePublicSymbol("900901"), /unsupported_a_share_symbol/);
const sina = parseSinaQuote(sinaText, fetchedAt);
const tencent = parseTencentQuote(tencentText, fetchedAt);
assert.equal(sina.status, "ok");
assert.equal(tencent.status, "ok");
assert.equal(sina.quote.source_timestamp, "2026-07-20T10:00:03+08:00");
assert.equal(tencent.quote.source_timestamp, "2026-07-20T10:00:02+08:00");
const mockFetch = async url => ({ ok: true, status: 200, arrayBuffer: async () => new TextEncoder().encode(url.includes("hq.sinajs") ? sinaText : tencentText).buffer });
const pair = await fetchPublicQuotePair("600519", { fetchImpl: mockFetch, fetchedAt, now: fetchedAt });
assert.equal(pair.status, "ok");
assert.equal(pair.sources.sina.quote.price, 1501);
assert.equal(pair.sources.tencent.quote.price, 1501.01);
assert.equal(pair.validation.classification, "public_cross_checked_near_real_time");
assert.equal("quotes" in pair, false);
const valid = validatePublicQuotePair(sina.quote, tencent.quote, {now:fetchedAt});
assert.equal(valid.ok, true);
assert.equal(valid.canClaimRealtime, false);
assert.equal(valid.canUseAsNearRealtime, true);
assert.equal(valid.classification, "public_cross_checked_near_real_time");
const conflict = validatePublicQuotePair(sina.quote, {...tencent.quote,price:1520}, {now:fetchedAt});
assert.ok(conflict.errors.some(error => error.code === "price_conflict"));
const ohlcConflict = validatePublicQuotePair(sina.quote, {...tencent.quote,high:1600}, {now:fetchedAt});
assert.ok(ohlcConflict.errors.some(error => error.code === "ohlc_conflict" && error.detail === "high"));
const stale = validatePublicQuotePair({...sina.quote,source_timestamp:"2026-07-20T09:59:00+08:00"},tencent.quote,{now:fetchedAt});
assert.ok(stale.errors.some(error => error.code === "stale_primary"));
const closed = validatePublicQuotePair(
  {...sina.quote,market_phase:"closed",source_timestamp:"2026-07-20T15:30:00+08:00"},
  {...tencent.quote,market_phase:"closed",source_timestamp:"2026-07-20T16:10:00+08:00"},
  {now:"2026-07-20T19:00:00+08:00"}
);
assert.equal(closed.ok,true);
assert.equal(closed.classification,"public_cross_checked_close_snapshot");
const minuteFixture = 'var _sh600519=([{"day":"2026-07-20 09:31:00","open":"1270","high":"1272","low":"1269","close":"1271","volume":"10000","amount":"12710000"}]);';
const minuteParsed = parseSinaMinuteBars(minuteFixture);
assert.equal(minuteParsed.status,"ok");
assert.equal(minuteParsed.bars[0].volume_unit,"share");
assert.equal(minuteParsed.bars[0].close,1271);
export const passed = true;
