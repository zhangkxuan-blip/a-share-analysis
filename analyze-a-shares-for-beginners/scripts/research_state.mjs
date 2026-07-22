import { pathToFileURL } from "node:url";

const KINDS = new Set(["scheduled", "conditional", "rumor"]);
const EFFECTS = new Set(["confirm", "weaken", "invalidate"]);

function parseTime(value) { const parsed = typeof value === "string" ? Date.parse(value) : NaN; return Number.isFinite(parsed) ? parsed : null; }

export function validateResearchState(state = {}) {
  const errors = [];
  const warnings = [];
  if (!state.symbol) errors.push({ code: "missing_symbol" });
  if (!state.asOf || parseTime(state.asOf) === null) errors.push({ code: "invalid_as_of" });
  if (!state.thesis || typeof state.thesis.statement !== "string" || !state.thesis.statement.trim()) errors.push({ code: "missing_thesis_statement" });
  const catalysts = Array.isArray(state.catalysts) ? state.catalysts : [];
  const seen = new Set();
  for (const catalyst of catalysts) {
    if (!catalyst.id || seen.has(catalyst.id)) errors.push({ code: "duplicate_or_missing_catalyst_id", id: catalyst.id ?? null });
    seen.add(catalyst.id);
    if (!KINDS.has(catalyst.kind)) errors.push({ code: "invalid_catalyst_kind", id: catalyst.id ?? null });
    if (catalyst.kind === "scheduled" && parseTime(catalyst.expectedAt) === null) errors.push({ code: "scheduled_catalyst_requires_date", id: catalyst.id ?? null });
    if (catalyst.kind === "rumor" && catalyst.expectedAt) warnings.push({ code: "rumor_must_not_be_presented_as_scheduled", id: catalyst.id ?? null });
    if (!catalyst.primarySourceUrl && catalyst.kind !== "rumor") errors.push({ code: "verified_catalyst_requires_primary_source", id: catalyst.id ?? null });
  }
  return { ok: errors.length === 0, errors, warnings };
}

export function applyEvidence(state, evidence) {
  const validation = validateResearchState(state);
  if (!validation.ok) return { status: "unavailable", reason: "invalid_state", validation };
  if (!evidence || !EFFECTS.has(evidence.effect) || parseTime(evidence.observedAt) === null || !evidence.sourceUrl) {
    return { status: "unavailable", reason: "invalid_evidence" };
  }
  const previousStatus = state.thesis.status ?? "active";
  let status = previousStatus;
  if (previousStatus !== "invalidated") {
    if (evidence.effect === "invalidate") status = "invalidated";
    else if (evidence.effect === "weaken") status = "weakened";
    else if (evidence.effect === "confirm" && previousStatus !== "weakened") status = "active";
  }
  const history = [...(Array.isArray(state.thesis.history) ? state.thesis.history : []), evidence];
  return { status: "ok", state: { ...state, asOf: evidence.observedAt, thesis: { ...state.thesis, status, history } } };
}

const argv = globalThis.process && Array.isArray(globalThis.process.argv) ? globalThis.process.argv : null;
if (argv && argv[1] && import.meta.url === pathToFileURL(argv[1]).href) {
  try {
    const input = JSON.parse(argv[2] || "{}");
    globalThis.process.stdout.write(JSON.stringify(input.evidence ? applyEvidence(input.state, input.evidence) : validateResearchState(input.state), null, 2) + "\n");
  } catch (error) {
    globalThis.process.stderr.write(String(error.message || error) + "\n");
    globalThis.process.exitCode = 1;
  }
}
