import { pathToFileURL } from "node:url";

const AUTHORIZED = new Set(["authorized", "licensed", "broker_authenticated"]);
const CORE_FIELDS = ["symbol", "exchange", "name", "source", "license_status", "source_timestamp", "fetched_at", "market_phase", "price", "previous_close", "currency", "adjustment"];

function hasTimezone(value) { return typeof value === "string" && /(?:Z|[+-]\d{2}:\d{2})$/i.test(value); }
function timestamp(value) {
  if (!hasTimezone(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function addError(errors, code, detail) { errors.push({ code, detail }); }

export function validateQuotePair(primary, secondary, options = {}) {
  const errors = [];
  const warnings = [];
  const nowMs = timestamp(options.now || new Date().toISOString());
  const maxAgeSeconds = options.maxAgeSeconds ?? 5;
  const futureToleranceSeconds = options.futureToleranceSeconds ?? 2;
  const alignmentSeconds = options.alignmentSeconds ?? 5;
  const minimumTick = options.minimumTick ?? 0.01;
  const relativeTolerance = options.relativeTolerance ?? 0.001;
  if (nowMs === null) addError(errors, "invalid_now", "now must include an explicit timezone");
  for (const [label, quote] of [["primary", primary], ["secondary", secondary]]) {
    if (!quote || typeof quote !== "object") { addError(errors, "missing_" + label, label + " quote is required"); continue; }
    for (const field of CORE_FIELDS) if (quote[field] === undefined || quote[field] === null || quote[field] === "") addError(errors, "missing_field", label + "." + field);
    if (!AUTHORIZED.has(quote.license_status)) addError(errors, "unauthorized_source", label + "." + quote.source);
    if (!(typeof quote.price === "number" && Number.isFinite(quote.price) && quote.price > 0)) addError(errors, "invalid_price", label + ".price");
    const sourceMs = timestamp(quote.source_timestamp);
    if (sourceMs === null) addError(errors, "invalid_timestamp", label + ".source_timestamp must include timezone");
    else if (nowMs !== null && sourceMs - nowMs > futureToleranceSeconds * 1000) addError(errors, "future_timestamp", label + ".source_timestamp");
    if (sourceMs !== null && nowMs !== null && quote.market_phase === "continuous_auction" && nowMs - sourceMs > maxAgeSeconds * 1000) addError(errors, "stale_" + label, "age exceeds " + maxAgeSeconds + " seconds");
    if (quote.volume !== undefined && !quote.volume_unit) warnings.push({ code: "missing_volume_unit", detail: label });
    if (quote.amount !== undefined && !quote.amount_unit) warnings.push({ code: "missing_amount_unit", detail: label });
  }
  if (primary && secondary) {
    for (const field of ["symbol", "exchange", "name", "currency", "adjustment", "market_phase"]) {
      if (primary[field] !== secondary[field]) addError(errors, "snapshot_mismatch", field);
    }
    if (primary.source === secondary.source) addError(errors, "non_independent_sources", primary.source);
    const firstMs = timestamp(primary.source_timestamp);
    const secondMs = timestamp(secondary.source_timestamp);
    if (firstMs !== null && secondMs !== null && Math.abs(firstMs - secondMs) > alignmentSeconds * 1000) addError(errors, "timestamp_misalignment", "snapshots exceed alignment window");
    if (typeof primary.price === "number" && typeof secondary.price === "number") {
      const tolerance = Math.max(minimumTick, Math.abs(primary.price) * relativeTolerance);
      if (Math.abs(primary.price - secondary.price) > tolerance) addError(errors, "price_conflict", "difference exceeds " + tolerance);
    }
  }
  const ok = errors.length === 0;
  const canClaimRealtime = ok && primary && primary.market_phase === "continuous_auction";
  const validAs = canClaimRealtime ? "real_time" : (ok && primary && primary.market_phase === "closed" ? "official_close" : "not_real_time");
  return { ok, canClaimRealtime, validAs, errors, warnings, policy: { maxAgeSeconds, futureToleranceSeconds, alignmentSeconds, minimumTick, relativeTolerance } };
}

const argv = globalThis.process && Array.isArray(globalThis.process.argv) ? globalThis.process.argv : null;
if (argv && argv[1] && import.meta.url === pathToFileURL(argv[1]).href) {
  try {
    const input = JSON.parse(argv[2] || "{}");
    const output = validateQuotePair(input.primary, input.secondary, input.options || {});
    globalThis.process.stdout.write(JSON.stringify(output, null, 2) + "\n");
  } catch (error) {
    globalThis.process.stderr.write(String(error.message || error) + "\n");
    globalThis.process.exitCode = 1;
  }
}
