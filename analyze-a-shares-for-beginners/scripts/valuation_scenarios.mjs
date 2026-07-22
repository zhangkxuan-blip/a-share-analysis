import { pathToFileURL } from "node:url";
import { discountedCashFlow } from "./calculate_metrics.mjs";

function finite(value) { return typeof value === "number" && Number.isFinite(value); }
function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

export function runScenarioValuation(input = {}) {
  if (!Array.isArray(input.scenarios) || input.scenarios.length < 3) return { status: "unavailable", reason: "require_bear_base_bull_scenarios" };
  const probabilitySum = input.scenarios.reduce((sum, scenario) => sum + (finite(scenario.probability) ? scenario.probability : 0), 0);
  if (Math.abs(probabilitySum - 1) > 1e-6) return { status: "not_meaningful", reason: "scenario_probabilities_must_sum_to_one", probabilitySum };
  const scenarios = input.scenarios.map(scenario => {
    const dcf = discountedCashFlow(scenario);
    const terminalShare = dcf.status === "ok" && dcf.value.enterpriseValue !== 0 ? dcf.value.presentValueTerminal / dcf.value.enterpriseValue : null;
    return { name: scenario.name, probability: scenario.probability, assumptions: scenario.assumptions ?? null, dcf, terminalValueShare: terminalShare };
  });
  const failed = scenarios.filter(scenario => scenario.dcf.status !== "ok" || !finite(scenario.dcf.value.perShare));
  if (failed.length) return { status: "unavailable", reason: "scenario_dcf_failed", scenarios };
  const probabilityWeightedPerShare = scenarios.reduce((sum, scenario) => sum + scenario.probability * scenario.dcf.value.perShare, 0);
  const warnings = [];
  for (const scenario of scenarios) if (scenario.terminalValueShare > 0.85) warnings.push({ code: "terminal_value_concentration", scenario: scenario.name, value: scenario.terminalValueShare });
  return { status: "ok", probabilityWeightedPerShare, scenarios, warnings };
}

export function dcfSensitivity(base, waccValues, terminalGrowthValues) {
  if (!Array.isArray(waccValues) || !Array.isArray(terminalGrowthValues)) return { status: "unavailable", reason: "missing_sensitivity_grid" };
  const rows = terminalGrowthValues.map(terminalGrowth => ({
    terminalGrowth,
    values: waccValues.map(wacc => {
      const dcf = discountedCashFlow({ ...base, wacc, terminalGrowth });
      return { wacc, perShare: dcf.status === "ok" ? dcf.value.perShare : null, status: dcf.status, reason: dcf.reason };
    })
  }));
  return { status: "ok", rows };
}

export function comparableValuation(input = {}) {
  if (!Array.isArray(input.peers) || !finite(input.targetMetric) || input.targetMetric <= 0) return { status: "unavailable", reason: "missing_peers_or_target_metric" };
  const included = [];
  const excluded = [];
  for (const peer of input.peers) {
    if (peer.include === false || !finite(peer.multiple) || peer.multiple <= 0) excluded.push({ name: peer.name ?? null, reason: peer.reason ?? "invalid_or_excluded_multiple" });
    else included.push({ name: peer.name ?? null, multiple: peer.multiple });
  }
  if (included.length < 3) return { status: "unavailable", reason: "require_at_least_three_valid_peers", included, excluded };
  const values = included.map(peer => peer.multiple).sort((a, b) => a - b);
  const stats = { min: values[0], p25: percentile(values, 0.25), median: percentile(values, 0.5), p75: percentile(values, 0.75), max: values.at(-1) };
  const selectedMultiple = finite(input.selectedMultiple) ? input.selectedMultiple : stats.median;
  if (selectedMultiple <= 0) return { status: "not_meaningful", reason: "invalid_selected_multiple" };
  const enterpriseValue = selectedMultiple * input.targetMetric;
  const bridge = [input.netDebt ?? 0, input.minorityInterests ?? 0, input.preferredEquity ?? 0];
  if (!bridge.every(finite)) return { status: "unavailable", reason: "invalid_equity_bridge" };
  const equityValue = enterpriseValue - bridge.reduce((sum, value) => sum + value, 0);
  const perShare = finite(input.dilutedShares) && input.dilutedShares > 0 ? equityValue / input.dilutedShares : null;
  return { status: "ok", selectedMultiple, stats, enterpriseValue, equityValue, perShare, included, excluded };
}

const argv = globalThis.process && Array.isArray(globalThis.process.argv) ? globalThis.process.argv : null;
if (argv && argv[1] && import.meta.url === pathToFileURL(argv[1]).href) {
  try {
    const input = JSON.parse(argv[2] || "{}");
    globalThis.process.stdout.write(JSON.stringify({ scenarios: runScenarioValuation(input), sensitivity: dcfSensitivity(input.base || {}, input.waccValues || [], input.terminalGrowthValues || []) }, null, 2) + "\n");
  } catch (error) {
    globalThis.process.stderr.write(String(error.message || error) + "\n");
    globalThis.process.exitCode = 1;
  }
}
