import { pathToFileURL } from "node:url";

function finite(value) { return typeof value === "number" && Number.isFinite(value); }
function ok(value) { return { status: "ok", value }; }
function unavailable(reason) { return { status: "unavailable", reason, value: null }; }

function percentile(sorted, probability) {
  if (!sorted.length) return null;
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}


export function historicalValuationPosition(current, history, options = {}) {
  const minimumObservations = options.minimumObservations ?? 24;
  const comparable = options.comparability?.passed === true;
  if (!comparable) return unavailable("historical_multiple_definitions_not_confirmed_comparable");
  const values = Array.isArray(history) ? history.filter(value => finite(value) && value > 0).sort((a, b) => a - b) : [];
  if (!finite(current) || current <= 0) return unavailable("current_multiple_must_be_positive");
  if (values.length < minimumObservations) return unavailable("insufficient_valid_history");
  const percentileRank = values.filter(value => value <= current).length / values.length;
  const lowThreshold = options.lowThreshold ?? 0.2;
  const highThreshold = options.highThreshold ?? 0.8;
  const band = percentileRank <= lowThreshold ? "historical_low" : percentileRank >= highThreshold ? "historical_high" : "historical_middle";
  return ok({ current, observations: values.length, percentileRank, band, comparability: options.comparability, distribution: {
    p10: percentile(values, 0.1), p25: percentile(values, 0.25), median: percentile(values, 0.5), p75: percentile(values, 0.75), p90: percentile(values, 0.9)
  }});
}


export function turnoverRate({ volumeShares, denominatorShares, denominatorClass, freeFloatShares } = {}) {
  const denominator = finite(denominatorShares) ? denominatorShares : freeFloatShares;
  const denominatorType = denominatorClass ?? (finite(freeFloatShares) ? "free_float" : null);
  const allowed = new Set(["free_float", "tradable", "total"]);
  if (![volumeShares, denominator].every(finite) || volumeShares < 0 || denominator <= 0 || !allowed.has(denominatorType)) return unavailable("invalid_turnover_inputs_or_denominator_class");
  return ok({ rate: volumeShares / denominator, denominatorShares: denominator, denominatorClass: denominatorType });
}


export function volumeRatio({ currentVolume, elapsedTradingMinutes, sameClockPreviousVolumes, previousDailyVolumes, fullDayMinutes = 240 } = {}) {
  if (!finite(currentVolume) || currentVolume < 0 || !finite(elapsedTradingMinutes) || elapsedTradingMinutes <= 0 || elapsedTradingMinutes > fullDayMinutes) return unavailable("invalid_current_volume_inputs");
  if (Array.isArray(sameClockPreviousVolumes) && sameClockPreviousVolumes.length >= 5) {
    const previous = sameClockPreviousVolumes.slice(-5);
    if (!previous.every(value => finite(value) && value > 0)) return unavailable("invalid_same_clock_volume_inputs");
    const benchmark = previous.reduce((sum, value) => sum + value, 0) / previous.length;
    return ok({ ratio: currentVolume / benchmark, benchmarkVolume: benchmark, elapsedTradingMinutes, previousDays: 5, mode: "same_clock_5d", confidence: "high" });
  }
  if (!Array.isArray(previousDailyVolumes) || previousDailyVolumes.length < 5) return unavailable("require_five_same_clock_or_complete_previous_days");
  const previous = previousDailyVolumes.slice(-5);
  if (!previous.every(value => finite(value) && value > 0) || !finite(fullDayMinutes) || fullDayMinutes <= 0) return unavailable("invalid_previous_volume_inputs");
  const previousAverageDaily = previous.reduce((sum, value) => sum + value, 0) / previous.length;
  const linearBenchmark = previousAverageDaily * elapsedTradingMinutes / fullDayMinutes;
  return ok({ ratio: currentVolume / linearBenchmark, benchmarkVolume: linearBenchmark, elapsedTradingMinutes, previousDays: 5, mode: "linear_clock_proxy", confidence: "low", warning: "a_share_intraday_volume_is_not_linear" });
}

export function shareholderCountChange({ currentCount, previousCount, currentDate = null, previousDate = null } = {}) {
  if (![currentCount, previousCount].every(finite) || currentCount <= 0 || previousCount <= 0) return unavailable("invalid_shareholder_counts");
  const changeRate = currentCount / previousCount - 1;
  const direction = changeRate < 0 ? "concentration_rising_proxy" : changeRate > 0 ? "dispersion_rising_proxy" : "stable_proxy";
  return ok({ changeRate, direction, currentCount, previousCount, currentDate, previousDate, proxyOnly: true, actualRetailHoldingKnown: false });
}

export function disclosedOwnershipSummary({ holdings, denominatorShares, completeRegister = false } = {}) {
  if (!Array.isArray(holdings) || !finite(denominatorShares) || denominatorShares <= 0) return unavailable("invalid_ownership_inputs");
  const professionalTypes = new Set(["public_fund", "social_security", "insurance", "qfii", "foreign_institution", "securities_firm", "asset_manager"]);
  const totals = { professionalInstitution: 0, strategicCorporate: 0, controller: 0, nominee: 0, naturalPerson: 0, unknown: 0 };
  for (const holding of holdings) {
    if (!holding || !finite(holding.shares) || holding.shares < 0) continue;
    if (professionalTypes.has(holding.type)) totals.professionalInstitution += holding.shares;
    else if (holding.type === "strategic_corporate" || holding.type === "state_investment_platform") totals.strategicCorporate += holding.shares;
    else if (holding.type === "controller") totals.controller += holding.shares;
    else if (holding.type === "nominee" || holding.type === "clearing_account") totals.nominee += holding.shares;
    else if (holding.type === "natural_person") totals.naturalPerson += holding.shares;
    else totals.unknown += holding.shares;
  }
  const ratios = Object.fromEntries(Object.entries(totals).map(([key, shares]) => [key, shares / denominatorShares]));
  const classifiedShares = Object.values(totals).reduce((sum, shares) => sum + shares, 0);
  const dominanceKnown = completeRegister && totals.unknown === 0 && totals.nominee === 0 && Math.abs(classifiedShares - denominatorShares) / denominatorShares <= 0.001;
  const institutionLike = totals.professionalInstitution + totals.strategicCorporate + totals.controller;
  const dominance = dominanceKnown ? (institutionLike > totals.naturalPerson ? "institution_like_majority" : institutionLike < totals.naturalPerson ? "natural_person_majority" : "balanced") : "not_directly_determinable";
  return ok({ totals, ratios, professionalInstitutionLowerBound: ratios.professionalInstitution, disclosedCoverage: classifiedShares / denominatorShares, dominanceKnown, dominance });
}

export function moneyFlowProxy({ largeOrderNet, mediumOrderNet = 0, smallOrderNet, totalAmount } = {}) {
  if (![largeOrderNet, mediumOrderNet, smallOrderNet, totalAmount].every(finite) || totalAmount <= 0) return unavailable("invalid_flow_proxy_inputs");
  return ok({ largeOrderNet, mediumOrderNet, smallOrderNet, largeOrderNetRatio: largeOrderNet / totalAmount, smallOrderNetRatio: smallOrderNet / totalAmount, classification: "trade_size_proxy", identityClaimAllowed: false, capitalFlowClaimAllowed: false });
}

export function priceVolumePressureProxy({ signedVolume, totalVolume, priceReturn } = {}) {
  if (![signedVolume, totalVolume, priceReturn].every(finite) || totalVolume <= 0) return unavailable("invalid_price_volume_pressure_inputs");
  return ok({ signedVolumeRatio: signedVolume / totalVolume, priceReturn, classification: "price_volume_pressure", capitalFlowClaimAllowed: false, identityClaimAllowed: false });
}

function scenarioKey(name) {
  const normalized = String(name ?? "").toLowerCase();
  if (["bear", "conservative", "保守"].includes(normalized)) return "bear";
  if (["base", "neutral", "中性"].includes(normalized)) return "base";
  if (["bull", "optimistic", "乐观"].includes(normalized)) return "bull";
  return null;
}


export function summarizeScenarioValues({ currentPrice, scenarios, probabilitiesCalibrated = false, calibrationNote = null } = {}) {
  if (!finite(currentPrice) || currentPrice <= 0 || !Array.isArray(scenarios)) return unavailable("invalid_scenario_summary_inputs");
  const mapped = {};
  for (const scenario of scenarios) {
    const key = scenarioKey(scenario.name);
    if (key && finite(scenario.value) && scenario.value > 0) mapped[key] = { value: scenario.value, probability: scenario.probability ?? null, assumptions: scenario.assumptions ?? null, provenance: scenario.provenance ?? null };
  }
  if (!mapped.bear || !mapped.base || !mapped.bull) return unavailable("require_bear_base_bull_values");
  for (const value of Object.values(mapped)) value.versusCurrent = value.value / currentPrice - 1;
  const probabilities = Object.values(mapped).map(value => value.probability);
  const validProbabilities = probabilities.every(value => finite(value) && value >= 0);
  const probabilitySum = validProbabilities ? probabilities.reduce((sum, value) => sum + value, 0) : null;
  const mayWeight = probabilitiesCalibrated === true && validProbabilities && Math.abs(probabilitySum - 1) <= 1e-6;
  const probabilityWeightedValue = mayWeight ? Object.values(mapped).reduce((sum, value) => sum + value.value * value.probability, 0) : null;
  return ok({
    currentPrice,
    scenarios: mapped,
    probabilitiesCalibrated,
    calibrationNote,
    probabilityWeightedValue,
    probabilityWeightedVersusCurrent: probabilityWeightedValue === null ? null : probabilityWeightedValue / currentPrice - 1,
    probabilitySum,
    warning: mayWeight ? null : "probability_weighting_omitted_without_calibration"
  });
}


function inferAnchorFamily(anchor) {
  if (typeof anchor.family === "string") return anchor.family;
  const type = String(anchor.type ?? "").toLowerCase();
  if (/technical|support|moving_average|trend/.test(type)) return "technical";
  if (/pb|book|asset|replacement/.test(type)) return "asset_value";
  if (/volume|flow|turnover|transaction/.test(type)) return "trading_volume";
  if (/pe|earn|cashflow|dcf|valuation|bear|normalized/.test(type)) return "earnings_cashflow";
  return null;
}

export function bottomReferenceZone({ anchors, atr = 0, maximumDispersion = 0.25 } = {}) {
  const allowedFamilies = new Set(["technical", "earnings_cashflow", "asset_value", "trading_volume"]);
  const valid = Array.isArray(anchors) ? anchors
    .filter(anchor => anchor && typeof anchor.type === "string" && finite(anchor.value) && anchor.value > 0)
    .map(anchor => ({ ...anchor, family: inferAnchorFamily(anchor) }))
    .filter(anchor => allowedFamilies.has(anchor.family)) : [];
  const byFamily = new Map();
  for (const anchor of valid) {
    if (!byFamily.has(anchor.family)) byFamily.set(anchor.family, []);
    byFamily.get(anchor.family).push(anchor);
  }
  if (byFamily.size < 2) return unavailable("require_two_independent_anchor_families");
  const familyAnchors = [...byFamily.entries()].map(([family, members]) => ({
    family,
    value: percentile(members.map(member => member.value).sort((a, b) => a - b), 0.5),
    members
  }));
  const values = familyAnchors.map(anchor => anchor.value).sort((a, b) => a - b);
  const center = percentile(values, 0.5);
  const dispersion = (values.at(-1) - values[0]) / center;
  if (!finite(maximumDispersion) || maximumDispersion <= 0 || dispersion > maximumDispersion) return unavailable("anchor_families_do_not_overlap");
  const buffer = finite(atr) && atr > 0 ? atr * 0.5 : 0;
  const lower = Math.max(0, values[0] - buffer);
  const upper = values.at(-1) + buffer;
  const confidence = familyAnchors.length >= 3 && dispersion <= 0.15 ? "high" : dispersion <= 0.15 ? "medium" : "low";
  return ok({ label: "bottom_reference_zone", lower, upper, center, anchorFamilies: familyAnchors, dispersion, confidence, guaranteedBottom: false });
}

export function decisionMetrics(input = {}) {
  return {
    historicalValuation: historicalValuationPosition(input.currentMultiple, input.multipleHistory, input.valuationOptions),
    turnover: turnoverRate(input.turnover),
    volumeRatio: volumeRatio(input.volumeRatio),
    shareholderTrend: shareholderCountChange(input.shareholderCounts),
    ownership: disclosedOwnershipSummary(input.ownership),
    moneyFlow: moneyFlowProxy(input.moneyFlow),
    priceVolumePressure: priceVolumePressureProxy(input.priceVolumePressure),
    scenarioValues: summarizeScenarioValues(input.scenarioValues),
    bottomZone: bottomReferenceZone(input.bottomZone)
  };
}

const argv = globalThis.process && Array.isArray(globalThis.process.argv) ? globalThis.process.argv : null;
if (argv && argv[1] && import.meta.url === pathToFileURL(argv[1]).href) {
  try {
    const input = JSON.parse(argv[2] || "{}");
    globalThis.process.stdout.write(JSON.stringify(decisionMetrics(input), null, 2) + "\n");
  } catch (error) {
    globalThis.process.stderr.write(String(error.message || error) + "\n");
    globalThis.process.exitCode = 1;
  }
}
