import assert from "node:assert/strict";
import {
  bottomReferenceZone,
  disclosedOwnershipSummary,
  historicalValuationPosition,
  moneyFlowProxy,
  priceVolumePressureProxy,
  shareholderCountChange,
  summarizeScenarioValues,
  turnoverRate,
  volumeRatio
} from "../scripts/decision_metrics.mjs";

const comparable = { passed: true, earningsPeriod: "ttm", shareBasis: "diluted", adjustment: "same" };
const valuation = historicalValuationPosition(20, Array.from({ length: 100 }, (_, index) => index + 1), { comparability: comparable });
assert.equal(valuation.status, "ok");
assert.equal(valuation.value.percentileRank, 0.2);
assert.equal(valuation.value.band, "historical_low");
assert.equal(historicalValuationPosition(20, Array.from({ length: 100 }, (_, index) => index + 1)).status, "unavailable");
assert.equal(historicalValuationPosition(10, [8, 9, 10], { comparability: comparable }).status, "unavailable");

const turnover = turnoverRate({ volumeShares: 1_000_000, denominatorShares: 100_000_000, denominatorClass: "tradable" });
assert.equal(turnover.value.rate, 0.01);
assert.equal(turnover.value.denominatorClass, "tradable");
assert.equal(turnoverRate({ volumeShares: 1_000_000, denominatorShares: 100_000_000 }).status, "unavailable");

const sameClock = volumeRatio({
  currentVolume: 120_000_000,
  elapsedTradingMinutes: 120,
  sameClockPreviousVolumes: [60_000_000, 60_000_000, 60_000_000, 60_000_000, 60_000_000]
});
assert.equal(sameClock.status, "ok");
assert.equal(sameClock.value.ratio, 2);
assert.equal(sameClock.value.mode, "same_clock_5d");
assert.equal(sameClock.value.confidence, "high");

const linear = volumeRatio({
  currentVolume: 120_000_000,
  elapsedTradingMinutes: 120,
  previousDailyVolumes: [120_000_000, 120_000_000, 120_000_000, 120_000_000, 120_000_000]
});
assert.equal(linear.value.ratio, 2);
assert.equal(linear.value.mode, "linear_clock_proxy");
assert.equal(linear.value.confidence, "low");

const holders = shareholderCountChange({ currentCount: 90_000, previousCount: 100_000, currentDate: "2026-07-20", previousDate: "2026-06-20" });
assert.equal(holders.value.direction, "concentration_rising_proxy");
assert.equal(holders.value.actualRetailHoldingKnown, false);

const ownership = disclosedOwnershipSummary({ denominatorShares: 1_000, holdings: [
  { type: "public_fund", shares: 100 },
  { type: "controller", shares: 300 },
  { type: "clearing_account", shares: 50 }
] });
assert.equal(ownership.status, "ok");
assert.equal(ownership.value.professionalInstitutionLowerBound, 0.1);
assert.equal(ownership.value.dominanceKnown, false);
assert.equal(ownership.value.dominance, "not_directly_determinable");

const flow = moneyFlowProxy({ largeOrderNet: 10, mediumOrderNet: -2, smallOrderNet: -8, totalAmount: 100 });
assert.equal(flow.value.classification, "trade_size_proxy");
assert.equal(flow.value.identityClaimAllowed, false);
assert.equal(flow.value.capitalFlowClaimAllowed, false);

const pressure = priceVolumePressureProxy({ signedVolume: 10, totalVolume: 100, priceReturn: -0.02 });
assert.equal(pressure.value.classification, "price_volume_pressure");
assert.equal(pressure.value.capitalFlowClaimAllowed, false);

const scenarioInput = {
  currentPrice: 20,
  scenarios: [
    { name: "bear", value: 15, probability: 0.2, provenance: "filed_history" },
    { name: "base", value: 24, probability: 0.5, provenance: "order_conversion" },
    { name: "bull", value: 32, probability: 0.3, provenance: "industry_scenario" }
  ]
};
const uncalibrated = summarizeScenarioValues(scenarioInput);
assert.equal(uncalibrated.status, "ok");
assert.equal(uncalibrated.value.scenarios.bear.versusCurrent, -0.25);
assert.equal(uncalibrated.value.probabilityWeightedValue, null);
assert.equal(uncalibrated.value.warning, "probability_weighting_omitted_without_calibration");

const calibrated = summarizeScenarioValues({ ...scenarioInput, probabilitiesCalibrated: true, calibrationNote: "historical base-rate calibration" });
assert.equal(calibrated.value.probabilityWeightedValue, 24.6);

const zone = bottomReferenceZone({ anchors: [
  { type: "normalized_pe", family: "earnings_cashflow", value: 16 },
  { type: "historical_pb_floor", family: "asset_value", value: 17 },
  { type: "technical_support", family: "technical", value: 16.5 }
], atr: 1 });
assert.equal(zone.status, "ok");
assert.equal(zone.value.guaranteedBottom, false);
assert.equal(zone.value.confidence, "high");

assert.equal(bottomReferenceZone({ anchors: [
  { type: "normalized_pe", value: 16 },
  { type: "bear_case", value: 17 }
] }).status, "unavailable");
assert.equal(bottomReferenceZone({ anchors: [
  { type: "normalized_pe", family: "earnings_cashflow", value: 10 },
  { type: "technical_support", family: "technical", value: 20 }
] }).status, "unavailable");

export const passed = true;
