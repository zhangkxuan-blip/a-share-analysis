import assert from "node:assert/strict";
import { applyEvidence, validateResearchState } from "../scripts/research_state.mjs";

const state = {
  symbol:"600000",asOf:"2026-07-20T10:00:00+08:00",
  thesis:{statement:"盈利改善需要净息差企稳",status:"active",history:[]},
  catalysts:[{id:"report",kind:"scheduled",expectedAt:"2026-08-20T18:00:00+08:00",primarySourceUrl:"https://www.cninfo.com.cn/"}]
};
assert.equal(validateResearchState(state).ok,true);
const invalidated = applyEvidence(state,{effect:"invalidate",observedAt:"2026-08-20T20:00:00+08:00",sourceUrl:"https://www.cninfo.com.cn/",note:"净息差继续恶化"});
assert.equal(invalidated.status,"ok");
assert.equal(invalidated.state.thesis.status,"invalidated");
const cannotRestore = applyEvidence(invalidated.state,{effect:"confirm",observedAt:"2026-08-21T10:00:00+08:00",sourceUrl:"https://www.cninfo.com.cn/",note:"无关正面信息"});
assert.equal(cannotRestore.state.thesis.status,"invalidated");
const rumor = validateResearchState({...state,catalysts:[{id:"r",kind:"rumor",expectedAt:"2026-08-01T00:00:00+08:00"}]});
assert.ok(rumor.warnings.some(w=>w.code==="rumor_must_not_be_presented_as_scheduled"));
export const passed = true;
