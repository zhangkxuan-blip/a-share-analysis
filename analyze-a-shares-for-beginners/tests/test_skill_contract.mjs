import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skill = await readFile(path.join(root, "SKILL.md"), "utf8");
const dashboard = await readFile(path.join(root, "references", "result-dashboard.md"), "utf8");
const quality = await readFile(path.join(root, "references", "data-quality.md"), "utf8");
const valuation = await readFile(path.join(root, "references", "valuation-modeling.md"), "utf8");
const ownership = await readFile(path.join(root, "references", "ownership-flows-market.md"), "utf8");
const strategic = await readFile(path.join(root, "references", "strategic-moat-cycle.md"), "utf8");
const sentiment = await readFile(path.join(root, "references", "industry-policy-sentiment.md"), "utf8");
const batch = await readFile(path.join(root, "references", "batch-comparison-output.md"), "utf8");
const openaiYaml = await readFile(path.join(root, "agents", "openai.yaml"), "utf8");

const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
assert.ok(frontmatter);
const keys = frontmatter[1].split(/\r?\n/).filter(line => /^[A-Za-z0-9_-]+\s*:/.test(line)).map(line => line.split(":")[0]);
assert.deepEqual(keys, ["name", "description"]);

const coverageSection = dashboard.split("## 第二层：18 项紧凑决策表")[1].split("## 第三层：证据与缺口台账")[0];
const topicNumbers = [...coverageSection.matchAll(/^(\d+)\. /gm)].map(match => Number(match[1]));
assert.deepEqual(topicNumbers, Array.from({ length: 18 }, (_, index) => index + 1));

for (const reference of ["strategic-moat-cycle.md", "ownership-flows-market.md", "result-dashboard.md"]) assert.ok(skill.includes(reference));
assert.ok(skill.includes("batch-comparison-output.md"));
for (const required of [
  "show formula substitutions only when the user requests detailed mode",
  "snapshot ID",
  "trade-size proxies",
  "anchor families",
  "probabilitiesCalibrated",
  "earned points",
  "Do not repeat the 18 topics"
]) assert.ok(skill.includes(required), required);

assert.ok(skill.includes("output-regression-lessons.md"));
assert.ok(dashboard.includes("第一层：一屏决策简报"));
assert.ok(dashboard.includes("第三层：证据与缺口台账"));
assert.ok(dashboard.includes("linear_clock_proxy"));
assert.ok(dashboard.includes("少于 10 条唯一样本"));
assert.ok(quality.includes("Frozen Snapshot And Module Cutoffs"));
assert.ok(valuation.includes("Same-Definition Historical Valuation Gate"));
assert.ok(ownership.includes("Flow Naming Firewall"));
assert.ok(strategic.includes("Order Overlap And Product Commercialization"));
assert.ok(sentiment.includes("Sentiment Sample Card And Minimum Gate"));
assert.ok(batch.includes("A. 估值与决策表"));
assert.ok(batch.includes("B. 公司质量与产业表"));
assert.ok(batch.includes("C. 所有权、交易代理与市场表"));

const shortDescription = openaiYaml.match(/short_description:\s*"([^"]+)"/)?.[1] ?? "";
assert.ok([...shortDescription].length >= 25 && [...shortDescription].length <= 64);
assert.ok(openaiYaml.includes("$analyze-a-shares-for-beginners"));

export const passed = true;
