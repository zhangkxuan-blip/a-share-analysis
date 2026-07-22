import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skill = await readFile(path.join(root, "SKILL.md"), "utf8");
const dashboard = await readFile(path.join(root, "references", "result-dashboard.md"), "utf8");

assert.equal((skill.match(/snapshot ID/g) ?? []).length >= 2, true);
assert.ok(skill.includes("Price-volume pressure is not capital inflow or outflow"));
assert.ok(skill.includes("Do not add order backlog"));
assert.ok(skill.includes("coverage reaches 70%"));
assert.ok(dashboard.includes("默认不再把这 18 项按六个模块逐段复述"));
assert.ok(dashboard.includes("公告总额"));
assert.ok(dashboard.includes("已知净新增"));
assert.ok(dashboard.includes("供应商国别"));
assert.ok(dashboard.includes("不能叫资金流入流出"));

export const passed = true;
