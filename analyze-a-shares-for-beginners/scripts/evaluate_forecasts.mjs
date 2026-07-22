import { pathToFileURL } from "node:url";

function finite(value) { return typeof value === "number" && Number.isFinite(value); }
function realizedDirection(value, neutralBand) { return value > neutralBand ? 1 : value < -neutralBand ? -1 : 0; }

export function evaluateForecasts(forecasts, options = {}) {
  if (!Array.isArray(forecasts) || forecasts.length === 0) return { status: "unavailable", reason: "no_forecasts" };
  const probabilityResolved = forecasts.filter(item => finite(item.probability) && item.probability >= 0 && item.probability <= 1 && [0, 1].includes(item.outcome));
  const brierScore = probabilityResolved.length ? probabilityResolved.reduce((sum, item) => sum + Math.pow(item.probability - item.outcome, 2), 0) / probabilityResolved.length : null;
  const buckets = [[0,0.2],[0.2,0.4],[0.4,0.6],[0.6,0.8],[0.8,1.0000001]].map(([low, high]) => {
    const sample = probabilityResolved.filter(item => item.probability >= low && item.probability < high);
    return {
      range: [low, Math.min(high, 1)],
      count: sample.length,
      averageForecast: sample.length ? sample.reduce((sum, item) => sum + item.probability, 0) / sample.length : null,
      observedRate: sample.length ? sample.reduce((sum, item) => sum + item.outcome, 0) / sample.length : null
    };
  });
  const neutralBand = finite(options.neutralBand) && options.neutralBand >= 0 ? options.neutralBand : 0;
  const directionalResolved = forecasts.filter(item => [-1, 0, 1].includes(item.predictedDirection) && finite(item.actualReturn));
  const directionalCorrect = directionalResolved.filter(item => item.predictedDirection === realizedDirection(item.actualReturn, neutralBand)).length;
  return {
    status: "ok",
    sampleSize: forecasts.length,
    resolvedProbabilityCount: probabilityResolved.length,
    brierScore,
    calibrationBuckets: buckets,
    resolvedDirectionalCount: directionalResolved.length,
    directionalAccuracy: directionalResolved.length ? directionalCorrect / directionalResolved.length : null,
    unresolvedCount: forecasts.length - new Set([...probabilityResolved, ...directionalResolved]).size,
    warnings: forecasts.length < 30 ? [{ code: "small_sample", sampleSize: forecasts.length }] : []
  };
}

const argv = globalThis.process && Array.isArray(globalThis.process.argv) ? globalThis.process.argv : null;
if (argv && argv[1] && import.meta.url === pathToFileURL(argv[1]).href) {
  try {
    const input = JSON.parse(argv[2] || "{}");
    globalThis.process.stdout.write(JSON.stringify(evaluateForecasts(input.forecasts, input.options || {}), null, 2) + "\n");
  } catch (error) {
    globalThis.process.stderr.write(String(error.message || error) + "\n");
    globalThis.process.exitCode = 1;
  }
}
