import assert from "node:assert/strict";
import { comparableValuation, dcfSensitivity, runScenarioValuation } from "../scripts/valuation_scenarios.mjs";

const common = {netDebt:2,minorityInterests:0.2,preferredEquity:0,dilutedShares:2};
const result = runScenarioValuation({scenarios:[
  {name:"bear",probability:0.2,fcffForecasts:[0.8,0.9,1],wacc:0.11,terminalGrowth:0.02,...common,assumptions:{growth:"low"}},
  {name:"base",probability:0.5,fcffForecasts:[1,1.1,1.2],wacc:0.10,terminalGrowth:0.03,...common,assumptions:{growth:"base"}},
  {name:"bull",probability:0.3,fcffForecasts:[1.2,1.4,1.6],wacc:0.09,terminalGrowth:0.035,...common,assumptions:{growth:"high"}}
]});
assert.equal(result.status,"ok");
assert.ok(result.probabilityWeightedPerShare>0);
const badProbability = runScenarioValuation({scenarios:[
  {probability:0.2},{probability:0.2},{probability:0.2}
]});
assert.equal(badProbability.status,"not_meaningful");
const sensitivity = dcfSensitivity({fcffForecasts:[1,1.1,1.2],netDebt:2,dilutedShares:2},[0.09,0.10],[0.02,0.03]);
assert.equal(sensitivity.rows.length,2);
assert.equal(sensitivity.rows[0].values.length,2);
const comps = comparableValuation({
  peers:[{name:"a",multiple:8},{name:"b",multiple:10},{name:"c",multiple:12},{name:"d",multiple:-1}],
  targetMetric:5,netDebt:5,dilutedShares:10
});
assert.equal(comps.status,"ok");
assert.equal(comps.stats.median,10);
assert.equal(comps.perShare,4.5);
assert.equal(comps.excluded.length,1);
export const passed = true;
