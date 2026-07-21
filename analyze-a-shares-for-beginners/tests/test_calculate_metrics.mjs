import assert from "node:assert/strict";
import { calculateMetrics, sma, rsi, weightedSentiment } from "../scripts/calculate_metrics.mjs";

const result = calculateMetrics({
  price: 20, eps: 2, bookValuePerShare: 8, attributableProfit: 1,
  averageEquity: 5, revenue: 10, cost: 6, operatingCashFlow: 1.2,
  capex: 0.4, ebit: 1.5, taxRate: 0.25, depreciation: 0.2,
  changeNonCashWorkingCapital: 0.1, cagrBeginning: 3, cagrEnding: 4.8, cagrYears: 5
});
assert.equal(result.pe.value, 10);
assert.equal(result.pb.value, 2.5);
assert.equal(result.roe.value, 0.2);
assert.equal(result.grossMargin.value, 0.4);
assert.ok(Math.abs(result.cagr.value - 0.0985605433) < 1e-9);
assert.ok(Math.abs(result.simpleFcf.value - 0.8) < 1e-12);
assert.ok(Math.abs(result.fcff.value - 0.825) < 1e-12);
assert.equal(calculateMetrics({price: 10, eps: -1}).pe.status, "not_meaningful");
assert.equal(sma([10, 10.2, 10.1, 10.4, 10.6], 5), 10.26);
assert.equal(rsi(Array.from({length: 16}, (_, i) => i + 1), 14), 100);
const sentiment = weightedSentiment([
  {sentiment: 1, views: 99, likes: 9, comments: 4},
  {sentiment: -1, views: 3, likes: 0, comments: 0}
]);
assert.ok(sentiment.value > 0);
assert.equal(sentiment.sampleSize, 2);
export const passed = true;
