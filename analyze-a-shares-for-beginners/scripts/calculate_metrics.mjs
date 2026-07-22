import { pathToFileURL } from "node:url";

function finite(value) { return typeof value === "number" && Number.isFinite(value); }
function result(value, status = "ok", reason = null) { return { value, status, reason }; }
function unavailable(reason) { return result(null, "unavailable", reason); }
function notMeaningful(reason) { return result(null, "not_meaningful", reason); }

export function safeDivide(numerator, denominator, options = {}) {
  if (!finite(numerator) || !finite(denominator)) return unavailable("missing_or_non_finite_input");
  if (denominator === 0) return notMeaningful("zero_denominator");
  if (options.requirePositiveDenominator && denominator < 0) return notMeaningful("negative_denominator");
  return result(numerator / denominator);
}

export function sma(values, period) {
  if (!Array.isArray(values) || !Number.isInteger(period) || period <= 0 || values.length < period) return null;
  const sample = values.slice(-period);
  if (!sample.every(finite)) return null;
  return sample.reduce((sum, value) => sum + value, 0) / period;
}

export function rsi(closes, period = 14) {
  if (!Array.isArray(closes) || !Number.isInteger(period) || period <= 0 || closes.length < period + 1) return null;
  const sample = closes.slice(-(period + 1));
  if (!sample.every(finite)) return null;
  let gains = 0;
  let losses = 0;
  for (let index = 1; index < sample.length; index += 1) {
    const change = sample[index] - sample[index - 1];
    if (change > 0) gains += change;
    if (change < 0) losses += -change;
  }
  const averageGain = gains / period;
  const averageLoss = losses / period;
  if (averageGain === 0 && averageLoss === 0) return 50;
  if (averageLoss === 0) return 100;
  const relativeStrength = averageGain / averageLoss;
  return 100 - 100 / (1 + relativeStrength);
}

export function weightedSentiment(posts) {
  if (!Array.isArray(posts) || posts.length === 0) return { value: null, status: "unavailable", sampleSize: 0, totalWeight: 0 };
  let numerator = 0;
  let totalWeight = 0;
  let positiveWeight = 0;
  let negativeWeight = 0;
  for (const post of posts) {
    if (![-1, 0, 1].includes(post.sentiment)) continue;
    const views = finite(post.views) && post.views >= 0 ? post.views : 0;
    const likes = finite(post.likes) && post.likes >= 0 ? post.likes : 0;
    const comments = finite(post.comments) && post.comments >= 0 ? post.comments : 0;
    const weight = Math.log1p(views) + 0.5 * Math.log1p(likes) + 0.8 * Math.log1p(comments);
    numerator += weight * post.sentiment;
    totalWeight += weight;
    if (post.sentiment > 0) positiveWeight += weight;
    if (post.sentiment < 0) negativeWeight += weight;
  }
  if (totalWeight === 0) return { value: null, status: "not_meaningful", sampleSize: posts.length, totalWeight: 0 };
  return { value: numerator / totalWeight, status: "ok", sampleSize: posts.length, totalWeight, positiveWeight, negativeWeight };
}

export function weightedAverageCostOfCapital({ equityValue, debtValue, costOfEquity, preTaxCostOfDebt, taxRate }) {
  if (![equityValue, debtValue, costOfEquity, preTaxCostOfDebt, taxRate].every(finite)) return unavailable("missing_wacc_input");
  if (equityValue < 0 || debtValue < 0 || equityValue + debtValue <= 0) return notMeaningful("invalid_capital_weights");
  if (taxRate < 0 || taxRate > 1) return notMeaningful("tax_rate_out_of_range");
  const totalCapital = equityValue + debtValue;
  return result((equityValue / totalCapital) * costOfEquity + (debtValue / totalCapital) * preTaxCostOfDebt * (1 - taxRate));
}

export function discountedCashFlow(input = {}) {
  const forecasts = input.fcffForecasts;
  if (!Array.isArray(forecasts) || forecasts.length === 0 || !forecasts.every(finite)) return unavailable("missing_fcff_forecasts");
  if (!finite(input.wacc) || !finite(input.terminalGrowth)) return unavailable("missing_wacc_or_terminal_growth");
  if (input.wacc <= input.terminalGrowth) return notMeaningful("wacc_must_exceed_terminal_growth");
  if (input.wacc <= -1) return notMeaningful("wacc_out_of_range");
  const terminalFcff = forecasts.at(-1);
  if (terminalFcff <= 0) return notMeaningful("terminal_fcff_must_be_positive");
  const presentValueForecasts = forecasts.reduce((sum, cashFlow, index) => sum + cashFlow / Math.pow(1 + input.wacc, index + 1), 0);
  const terminalValue = terminalFcff * (1 + input.terminalGrowth) / (input.wacc - input.terminalGrowth);
  const presentValueTerminal = terminalValue / Math.pow(1 + input.wacc, forecasts.length);
  const enterpriseValue = presentValueForecasts + presentValueTerminal;
  const deductions = [input.netDebt ?? 0, input.minorityInterests ?? 0, input.preferredEquity ?? 0];
  if (!deductions.every(finite)) return unavailable("invalid_equity_bridge_input");
  const equityValue = enterpriseValue - deductions.reduce((sum, value) => sum + value, 0);
  const perShare = finite(input.dilutedShares) && input.dilutedShares > 0 ? equityValue / input.dilutedShares : null;
  return result({ presentValueForecasts, terminalValue, presentValueTerminal, enterpriseValue, equityValue, perShare });
}

export function calculateMetrics(input = {}) {
  const output = {};
  output.pe = finite(input.eps) && input.eps <= 0 ? notMeaningful("non_positive_eps") : safeDivide(input.price, input.eps);
  output.pb = finite(input.bookValuePerShare) && input.bookValuePerShare <= 0 ? notMeaningful("non_positive_book_value") : safeDivide(input.price, input.bookValuePerShare);
  output.roe = safeDivide(input.attributableProfit, input.averageEquity, { requirePositiveDenominator: true });
  output.grossMargin = finite(input.revenue) && finite(input.cost) ? safeDivide(input.revenue - input.cost, input.revenue, { requirePositiveDenominator: true }) : unavailable("missing_revenue_or_cost");
  output.simpleFcf = finite(input.operatingCashFlow) && finite(input.capex) ? result(input.operatingCashFlow - input.capex) : unavailable("missing_cash_flow_or_capex");
  output.cashProfitRatio = safeDivide(input.operatingCashFlow, input.attributableProfit);
  if ([input.ebit, input.taxRate, input.capex, input.depreciation, input.changeNonCashWorkingCapital].every(finite)) {
    output.fcff = result(input.ebit * (1 - input.taxRate) - (input.capex - input.depreciation) - input.changeNonCashWorkingCapital);
  } else output.fcff = unavailable("missing_fcff_input");
  if ([input.cagrBeginning, input.cagrEnding, input.cagrYears].every(finite) && input.cagrBeginning > 0 && input.cagrEnding > 0 && input.cagrYears > 0) {
    output.cagr = result(Math.pow(input.cagrEnding / input.cagrBeginning, 1 / input.cagrYears) - 1);
  } else output.cagr = notMeaningful("cagr_requires_positive_comparable_endpoints_and_years");
  output.wacc = weightedAverageCostOfCapital(input);
  output.dcf = discountedCashFlow(input);
  return output;
}

const argv = globalThis.process && Array.isArray(globalThis.process.argv) ? globalThis.process.argv : null;
if (argv && argv[1] && import.meta.url === pathToFileURL(argv[1]).href) {
  try {
    const input = JSON.parse(argv[2] || "{}");
    globalThis.process.stdout.write(JSON.stringify(calculateMetrics(input), null, 2) + "\n");
  } catch (error) {
    globalThis.process.stderr.write(String(error.message || error) + "\n");
    globalThis.process.exitCode = 1;
  }
}
