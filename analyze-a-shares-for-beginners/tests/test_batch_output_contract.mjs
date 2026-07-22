import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skill = await readFile(path.join(root, "SKILL.md"), "utf8");
const batch = await readFile(path.join(root, "references", "batch-comparison-output.md"), "utf8");
const lessons = await readFile(path.join(root, "references", "output-regression-lessons.md"), "utf8");

assert.ok(skill.includes("batch-comparison-output.md"));
assert.ok(skill.includes("Do not emit a precise linear ranking"));
assert.ok(batch.includes("双轴分层"));
assert.ok(batch.includes("不默认生成线性总排名"));
assert.ok(batch.includes("估值不可用"));
assert.ok(batch.includes("技术支撑观察区（低置信度）"));
assert.ok(batch.includes("实际间隔天数"));
assert.ok(batch.includes("not_reflected_in_snapshot_price"));
assert.ok(batch.includes("原始行情接口"));
assert.ok(batch.includes("1–18"));
assert.ok(lessons.includes("多股票报告直接给精确“优先研究顺序”"));
assert.ok(lessons.includes("三情景估值只列三个价格"));

export const passed = true;
