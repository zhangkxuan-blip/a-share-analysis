import { pathToFileURL } from "node:url";

function finite(value) { return typeof value === "number" && Number.isFinite(value); }
function number(value) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; }

export function normalizePublicSymbol(input) {
  const code = String(input ?? "").toUpperCase().replace(/^(SH|SZ|BJ)/, "").replace(/\.(SH|SZ|BJ)$/, "");
  if (!/^\d{6}$/.test(code)) throw new Error("symbol_must_be_six_digits");
  const prefix = code.startsWith("6") ? "sh" : code.startsWith("0") || code.startsWith("3") ? "sz" : code.startsWith("4") || code.startsWith("8") || code.startsWith("92") ? "bj" : null;
  if (!prefix) throw new Error("unsupported_a_share_symbol");
  return { code, providerSymbol: prefix + code, exchange: prefix === "sh" ? "SSE" : prefix === "sz" ? "SZSE" : "BSE" };
}

function phaseFromChinaTime(time) {
  const hhmm = time.slice(0, 5);
  if (hhmm >= "09:15" && hhmm < "09:30") return "call_auction";
  if ((hhmm >= "09:30" && hhmm <= "11:30") || (hhmm >= "13:00" && hhmm <= "15:00")) return "continuous_auction";
  if (hhmm > "11:30" && hhmm < "13:00") return "midday_break";
  if (hhmm > "15:00") return "closed";
  return "pre_open";
}

function chinaTimestamp(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}:\d{2}$/.test(time)) return null;
  return `${date}T${time}+08:00`;
}

function compactChinaTimestamp(value) {
  if (!/^\d{14}$/.test(value)) return null;
  return `${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}T${value.slice(8,10)}:${value.slice(10,12)}:${value.slice(12,14)}+08:00`;
}

export function parseSinaQuote(text, fetchedAt = new Date().toISOString()) {
  const match = String(text).match(/var\s+hq_str_([a-z]{2}\d{6})="([^"]*)"/i);
  if (!match) return { status: "unavailable", reason: "sina_response_not_recognized" };
  const symbol = normalizePublicSymbol(match[1]);
  const fields = match[2].split(",");
  if (fields.length < 32) return { status: "unavailable", reason: "sina_field_count" };
  const price = number(fields[3]);
  const sourceTimestamp = chinaTimestamp(fields[30], fields[31]);
  if (!finite(price) || price <= 0) return { status: "unavailable", reason: "sina_invalid_price" };
  return { status: "ok", quote: {
    symbol: symbol.code, exchange: symbol.exchange, name: fields[0], source: "sina-public",
    license_status: "public_unverified", source_timestamp: sourceTimestamp, fetched_at: fetchedAt,
    market_phase: sourceTimestamp ? phaseFromChinaTime(fields[31]) : "unknown", price,
    previous_close: number(fields[2]), currency: "CNY", adjustment: "unadjusted",
    open: number(fields[1]), high: number(fields[4]), low: number(fields[5]),
    volume: number(fields[8]), volume_unit: "share", amount: number(fields[9]), amount_unit: "CNY"
  }};
}

export function parseTencentQuote(text, fetchedAt = new Date().toISOString()) {
  const match = String(text).match(/v_([a-z]{2}\d{6})="([^"]*)"/i) || String(text).match(/_([a-z]{2}\d{6})="([^"]*)"/i);
  if (!match) return { status: "unavailable", reason: "tencent_response_not_recognized" };
  const symbol = normalizePublicSymbol(match[1]);
  const fields = match[2].split("~");
  if (fields.length < 35) return { status: "unavailable", reason: "tencent_field_count" };
  const price = number(fields[3]);
  const sourceTimestamp = compactChinaTimestamp(fields[30]);
  if (!finite(price) || price <= 0) return { status: "unavailable", reason: "tencent_invalid_price" };
  const time = sourceTimestamp ? sourceTimestamp.slice(11,19) : "";
  return { status: "ok", quote: {
    symbol: symbol.code, exchange: symbol.exchange, name: fields[1], source: "tencent-public",
    license_status: "public_unverified", source_timestamp: sourceTimestamp, fetched_at: fetchedAt,
    market_phase: sourceTimestamp ? phaseFromChinaTime(time) : "unknown", price,
    previous_close: number(fields[4]), currency: "CNY", adjustment: "unadjusted",
    open: number(fields[5]), high: number(fields[33]), low: number(fields[34]),
    volume: finite(number(fields[6])) ? number(fields[6]) * 100 : null, volume_unit: "share"
  }};
}

function timestamp(value) { const parsed = typeof value === "string" ? Date.parse(value) : NaN; return Number.isFinite(parsed) ? parsed : null; }

export function parseSinaMinuteBars(text) {
  const match = String(text).match(/=\s*\((\[[\s\S]*\])\)\s*;?/) || String(text).match(/(\[[\s\S]*\])/);
  if (!match) return { status: "unavailable", reason: "sina_minute_response_not_recognized" };
  try {
    const items = JSON.parse(match[1]);
    const bars = items.map(item => ({
      time: item.day,
      open: number(item.open),
      high: number(item.high),
      low: number(item.low),
      close: number(item.close),
      volume: number(item.volume),
      volume_unit: "share",
      amount: number(item.amount),
      amount_unit: "CNY"
    })).filter(item => item.time && finite(item.close) && item.close > 0 && finite(item.volume));
    return bars.length ? { status: "ok", classification: "public_intraday_bars", bars } : { status: "unavailable", reason: "no_valid_minute_bars" };
  } catch {
    return { status: "unavailable", reason: "sina_minute_json_error" };
  }
}


export function validatePublicQuotePair(primary, secondary, options = {}) {
  const errors = [];
  const warnings = [{ code: "public_sources_are_not_licensed_realtime", detail: "Use only as cross-checked near-real-time data." }];
  const nowMs = timestamp(options.now ?? new Date().toISOString());
  const maxAgeSeconds = options.maxAgeSeconds ?? 15;
  const alignmentSeconds = options.alignmentSeconds ?? 15;
  const minimumTick = options.minimumTick ?? 0.01;
  const relativeTolerance = options.relativeTolerance ?? 0.001;
  for (const [label, quote] of [["primary", primary], ["secondary", secondary]]) {
    if (!quote) { errors.push({ code: "missing_" + label }); continue; }
    if (!quote.source_timestamp || timestamp(quote.source_timestamp) === null) errors.push({ code: "invalid_timestamp", detail: label });
    if (!finite(quote.price) || quote.price <= 0) errors.push({ code: "invalid_price", detail: label });
    const sourceMs = timestamp(quote.source_timestamp);
    if (sourceMs !== null && nowMs !== null && quote.market_phase === "continuous_auction" && nowMs - sourceMs > maxAgeSeconds * 1000) errors.push({ code: "stale_" + label });
  }
  if (primary && secondary) {
    for (const field of ["symbol", "exchange", "name", "currency", "adjustment", "market_phase"]) if (primary[field] !== secondary[field]) errors.push({ code: "snapshot_mismatch", detail: field });
    if (primary.source === secondary.source) errors.push({ code: "same_public_source" });
    const firstMs = timestamp(primary.source_timestamp);
    const secondMs = timestamp(secondary.source_timestamp);
    const bothContinuous = primary.market_phase === "continuous_auction" && secondary.market_phase === "continuous_auction";
    if (bothContinuous && firstMs !== null && secondMs !== null && Math.abs(firstMs - secondMs) > alignmentSeconds * 1000) errors.push({ code: "timestamp_misalignment" });
    if (!bothContinuous && primary.source_timestamp?.slice(0, 10) !== secondary.source_timestamp?.slice(0, 10)) errors.push({ code: "trade_date_mismatch" });
    if (finite(primary.price) && finite(secondary.price)) {
      const tolerance = Math.max(minimumTick, Math.abs(primary.price) * relativeTolerance);
      if (Math.abs(primary.price - secondary.price) > tolerance) errors.push({ code: "price_conflict", detail: tolerance });
    }
    for (const field of ["previous_close", "open", "high", "low"]) {
      if (!finite(primary[field]) || !finite(secondary[field])) continue;
      const tolerance = Math.max(minimumTick, Math.abs(primary[field]) * relativeTolerance);
      if (Math.abs(primary[field] - secondary[field]) > tolerance) errors.push({ code: "ohlc_conflict", detail: field, tolerance });
    }
  }
  const ok = errors.length === 0;
  const continuous = primary?.market_phase === "continuous_auction" && secondary?.market_phase === "continuous_auction";
  const closed = primary?.market_phase === "closed" && secondary?.market_phase === "closed";
  return {
    ok, canClaimRealtime: false,
    canUseAsNearRealtime: ok && continuous,
    classification: ok && continuous ? "public_cross_checked_near_real_time" : ok && closed ? "public_cross_checked_close_snapshot" : ok ? "public_snapshot" : "unavailable",
    errors, warnings, policy: { maxAgeSeconds, alignmentSeconds, minimumTick, relativeTolerance }
  };
}

async function decode(response, encoding) {
  if (!response.ok) throw new Error("http_" + response.status);
  const bytes = await response.arrayBuffer();
  return new TextDecoder(encoding).decode(bytes);
}

export async function fetchPublicMinuteBars(input, options = {}) {
  const symbol = normalizePublicSymbol(input);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") return { status: "unavailable", reason: "fetch_not_available" };
  const count = Number.isInteger(options.count) && options.count > 0 ? Math.min(options.count, 250) : 250;
  const url = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_${symbol.providerSymbol}=/CN_MarketDataService.getKLineData?symbol=${symbol.providerSymbol}&scale=1&ma=no&datalen=${count}`;
  try {
    const response = await fetchImpl(url, { headers: { Referer: "https://finance.sina.com.cn", "User-Agent": "Mozilla/5.0" } });
    const parsed = parseSinaMinuteBars(await decode(response, "utf-8"));
    return { ...parsed, symbol };
  } catch (error) {
    return { status: "unavailable", reason: String(error.message || error), symbol };
  }
}

export async function fetchPublicQuotePair(input, options = {}) {
  const symbol = normalizePublicSymbol(input);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") return { status: "unavailable", reason: "fetch_not_available" };
  const fetchedAt = options.fetchedAt ?? new Date().toISOString();
  const sinaUrl = `https://hq.sinajs.cn/list=${symbol.providerSymbol}`;
  const tencentUrl = `https://web.sqt.gtimg.cn/q=${symbol.providerSymbol}`;
  const [sinaResult, tencentResult] = await Promise.allSettled([
    fetchImpl(sinaUrl, { headers: { Referer: "https://finance.sina.com.cn", "User-Agent": "Mozilla/5.0" } }).then(response => decode(response, "gbk")),
    fetchImpl(tencentUrl, { headers: { Referer: "https://gu.qq.com", "User-Agent": "Mozilla/5.0" } }).then(response => decode(response, "gbk"))
  ]);
  const parsedSina = sinaResult.status === "fulfilled" ? parseSinaQuote(sinaResult.value, fetchedAt) : { status: "unavailable", reason: String(sinaResult.reason) };
  const parsedTencent = tencentResult.status === "fulfilled" ? parseTencentQuote(tencentResult.value, fetchedAt) : { status: "unavailable", reason: String(tencentResult.reason) };
  const primary = parsedSina.quote ?? null;
  const secondary = parsedTencent.quote ?? null;
  return { status: primary && secondary ? "ok" : "degraded", symbol, sources: { sina: parsedSina, tencent: parsedTencent }, validation: validatePublicQuotePair(primary, secondary, { ...options, now: options.now ?? fetchedAt }) };
}

const argv = globalThis.process && Array.isArray(globalThis.process.argv) ? globalThis.process.argv : null;
if (argv && argv[1] && import.meta.url === pathToFileURL(argv[1]).href) {
  fetchPublicQuotePair(argv[2]).then(output => globalThis.process.stdout.write(JSON.stringify(output, null, 2) + "\n")).catch(error => { globalThis.process.stderr.write(String(error.message || error) + "\n"); globalThis.process.exitCode = 1; });
}
