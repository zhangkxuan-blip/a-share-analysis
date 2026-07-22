import { pathToFileURL } from "node:url";
import { validateQuotePair } from "./validate_quotes.mjs";

const AUTHORIZED = new Set(["authorized", "licensed", "broker_authenticated"]);
const REALTIME_CLASSES = new Set(["real_time", "level_1", "level_2"]);

function providerCard(provider = {}) {
  const reasons = [];
  if (!provider.id) reasons.push("missing_provider_id");
  if (!provider.upstream_id) reasons.push("missing_upstream_id");
  if (!AUTHORIZED.has(provider.authorization_status)) reasons.push("unauthorized_provider");
  if (!REALTIME_CLASSES.has(provider.quote_class)) reasons.push("not_realtime_class");
  if (provider.health_status !== "healthy") reasons.push("provider_not_healthy");
  if (!provider.snapshot) reasons.push("missing_snapshot");
  return {
    id: provider.id ?? null,
    upstream_id: provider.upstream_id ?? null,
    authorization_status: provider.authorization_status ?? "unknown",
    quote_class: provider.quote_class ?? "unknown",
    health_status: provider.health_status ?? "unknown",
    priority: Number.isFinite(provider.priority) ? provider.priority : Number.MAX_SAFE_INTEGER,
    expected_latency_ms: Number.isFinite(provider.expected_latency_ms) ? provider.expected_latency_ms : null,
    last_success_at: provider.last_success_at ?? null,
    current_error: provider.current_error ?? null,
    realtime_eligible: reasons.length === 0,
    reasons
  };
}

function fallbackClass(provider) {
  if (!provider || !provider.snapshot) return "unavailable";
  if (provider.quote_class === "official_close" || provider.snapshot.market_phase === "closed") return "official_close";
  if (provider.quote_class === "delayed") return "delayed";
  if (provider.quote_class === "near_real_time") return "near_real_time";
  return "not_real_time";
}

export function routeProviders(providers, options = {}) {
  if (!Array.isArray(providers) || providers.length === 0) {
    return { ok: false, canClaimRealtime: false, classification: "unavailable", errors: [{ code: "no_providers" }], cards: [] };
  }
  const ranked = providers.map((provider, index) => ({ provider, index, card: providerCard(provider) }))
    .sort((a, b) => a.card.priority - b.card.priority || a.index - b.index);
  const eligible = ranked.filter(item => item.card.realtime_eligible);
  const errors = [];
  let primaryItem = eligible[0] ?? null;
  let secondaryItem = null;
  if (primaryItem) secondaryItem = eligible.find(item => item.card.upstream_id !== primaryItem.card.upstream_id) ?? null;
  if (!primaryItem) errors.push({ code: "no_authorized_realtime_primary" });
  if (primaryItem && !secondaryItem) errors.push({ code: "no_independent_realtime_secondary" });
  if (primaryItem && secondaryItem) {
    const providerMaxAge = Number.isFinite(primaryItem.provider.max_age_seconds) ? primaryItem.provider.max_age_seconds : null;
    const maxAgeSeconds = Math.min(options.maxAgeSeconds ?? 5, providerMaxAge ?? Number.POSITIVE_INFINITY);
    const validation = validateQuotePair(primaryItem.provider.snapshot, secondaryItem.provider.snapshot, { ...options, maxAgeSeconds });
    if (validation.ok && validation.canClaimRealtime) {
      return {
        ok: true,
        canClaimRealtime: true,
        classification: "real_time",
        primary: primaryItem.provider.snapshot,
        secondary: secondaryItem.provider.snapshot,
        selectedProviders: [primaryItem.card.id, secondaryItem.card.id],
        validation,
        errors: [],
        cards: ranked.map(item => item.card)
      };
    }
    errors.push(...validation.errors);
  }
  const fallback = ranked.find(item => item.provider.snapshot && item.card.health_status === "healthy") ?? ranked.find(item => item.provider.snapshot) ?? null;
  return {
    ok: false,
    canClaimRealtime: false,
    classification: fallbackClass(fallback?.provider),
    primary: fallback?.provider.snapshot ?? null,
    secondary: null,
    selectedProviders: fallback ? [fallback.card.id] : [],
    validation: null,
    errors,
    cards: ranked.map(item => item.card)
  };
}

const argv = globalThis.process && Array.isArray(globalThis.process.argv) ? globalThis.process.argv : null;
if (argv && argv[1] && import.meta.url === pathToFileURL(argv[1]).href) {
  try {
    const input = JSON.parse(argv[2] || "{}");
    globalThis.process.stdout.write(JSON.stringify(routeProviders(input.providers, input.options || {}), null, 2) + "\n");
  } catch (error) {
    globalThis.process.stderr.write(String(error.message || error) + "\n");
    globalThis.process.exitCode = 1;
  }
}
