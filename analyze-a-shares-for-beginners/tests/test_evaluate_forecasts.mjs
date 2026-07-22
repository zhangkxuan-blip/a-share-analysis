import assert from "node:assert/strict";
import { evaluateForecasts } from "../scripts/evaluate_forecasts.mjs";

const result = evaluateForecasts([
  {probability:0.8,outcome:1,predictedDirection:1,actualReturn:0.05},
  {probability:0.7,outcome:0,predictedDirection:-1,actualReturn:-0.03},
  {probability:0.2,outcome:0,predictedDirection:1,actualReturn:-0.01},
  {probability:0.6}
]);
assert.equal(result.status,"ok");
assert.equal(result.resolvedProbabilityCount,3);
assert.ok(result.brierScore>=0&&result.brierScore<=1);
assert.equal(result.resolvedDirectionalCount,3);
assert.equal(result.directionalAccuracy,2/3);
assert.ok(result.warnings.some(w=>w.code==="small_sample"));
export const passed = true;
