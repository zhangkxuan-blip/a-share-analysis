# 持仓、资金流与市场板块

## Observability Comes First

Use the following hierarchy and preserve every as-of date:

| Question | Directly observable public evidence | Limitation |
| --- | --- | --- |
| named major holders | latest filed top ten shareholders and top ten tradable shareholders | periodic and lagged |
| public-fund ownership | fund quarterly, interim, and annual portfolio disclosures | periodic, aggregation can double count fund-of-funds |
| all institutional share | cannot be known exactly from one public table | holder types and nominee accounts may overlap |
| stock-level retail share | not directly observable at daily, weekly, or monthly frequency | shareholder count is only a proxy |
| institution versus retail intraday flow | not identifiable from public Level-1 trades | trade size is not investor identity |
| market-wide investor counts | ChinaClear statistics | not stock-level holdings |

Never relabel large orders as institutions or small orders as retail investors. Use trade-size proxy in the heading and set identity claim allowed to false.

## Named Institutional Holdings

Use the latest comparable disclosure cutoff. List institution name, type, shares, percentage of total or free float, change versus the previous comparable report, source, and cutoff date.

Classify holders conservatively: public fund, social-security fund, insurance, QFII or foreign institution, securities firm, asset manager, state-owned investment platform, employee plan, controlling shareholder, nominee or clearing account, or unknown. Do not treat every legal-person holder as a professional asset manager.

Report:

- whether institution-versus-retail dominance is directly determinable; when the register is incomplete, report not directly determinable;
- professional-investment-institution disclosed lower bound, excluding controllers, strategic corporations, and nominee accounts;
- disclosed institutional holding ratio;
- top ten concentration and change;
- stable, new, increased, reduced, or exited named holders;
- concentration risk and free-float denominator;
- reporting lag.

## Weekly And Monthly Retail Proxy

Use shareholder-count change only when two comparable disclosed endpoints exist. Calculate current count / previous count - 1.

- count falling: ownership concentration rising proxy;
- count rising: ownership dispersion or possible retail participation rising proxy;
- unchanged: stable proxy.

Do not equate the proxy with exact retail shares. For a requested 7-day or 30-day window, require endpoint dates close enough to that window and disclose the actual elapsed days. If no comparable endpoint exists, output unavailable. Investor-platform answers may supplement filings only when dated and attributable to the company.

## Stock Money-Flow Windows

For the latest 5 and 20 trading days show:

- return and excess return versus benchmark;
- cumulative amount, average daily amount, and turnover;
- up-day versus down-day volume;
- price-volume divergence;
- large-, medium-, and small-trade net amounts when a provider supplies a documented rule;
- margin balance change, block trades, and ETF or fund evidence when relevant.

Always state whether a flow measure is transaction-sign inference, trade-size classification, financing data, ETF creation/redemption, disclosed holding change, or actual account-category data. Only the last category can support an institution-versus-retail identity claim.

## Turnover And Volume Ratio

Turnover rate equals traded shares divided by free-float shares for the same period. State whether the denominator is free float, tradable shares, or total shares.

Volume ratio equals current average volume per elapsed continuous-auction minute divided by the average per-minute volume over the previous five complete trading days. Use 240 minutes for a normal full A-share trading day and adjust for suspension or shortened sessions.

Interpret jointly with price, historical percentile, liquidity, limit status, and event news. High turnover can mean disagreement, rotation, distribution, or new participation; volume ratio alone does not identify direction.

## Bottom Reference Zone

Use at least two independent anchor types:

1. normalized fundamental valuation floor, such as normalized EPS times a low historical or peer multiple;
2. bear-case scenario value;
3. multi-timeframe technical support or volume-profile zone;
4. book value, replacement value, net cash, regulated asset base, or another sector-appropriate asset anchor.

Report the overlapping range, anchor values, dispersion, ATR or volatility buffer, confidence, and invalidation condition. If anchors do not overlap or depend on the same assumption, report low confidence or unavailable. Never call it an absolute bottom.

## Market Sector Flows And Leaders

Evaluate the latest 5 and 20 trading days separately. Rank sectors with a small evidence panel rather than one opaque score:

- sector index return and excess return;
- advancing-stock breadth and new-high breadth;
- turnover share and its change;
- ETF units, net creation/redemption, or fund-flow evidence where verifiable;
- margin financing change;
- policy and earnings catalyst breadth;
- valuation percentile and crowding risk.

Do not call the largest vendor-reported net inflow the market's actual institutional destination unless the provider documents account identity.

## One-Week And One-Month Forward Scenarios

Build two to four scenarios for the next 5 and 20 trading days. Probabilities should sum to about 100%. Each scenario must state catalyst, beneficiary sectors, confirming indicators, invalidation conditions, and crowding or valuation risk.

Calibrate sector-rotation rules on historical point-in-time data. Prevent look-ahead and survivorship bias, include fees and slippage for any tradable strategy, test across market regimes, and prefer stable parameter plateaus. If no calibrated history exists, label probabilities judgmental and low confidence.

## Primary Sources

- CNInfo company filings and holder panels: https://www.cninfo.com.cn/
- SSE disclosures: https://www.sse.com.cn/
- SZSE disclosures: https://www.szse.cn/
- BSE disclosures: https://www.bse.cn/
- CSRC fund disclosures: https://www.csrc.gov.cn/
- ChinaClear investor statistics: https://www.chinaclear.cn/

Use reputable vendors only for documented market-derived proxies and cite their methodology.

## Flow Naming Firewall

Public Level-1 order-size buckets describe transaction size, not investor identity. Use `trade-size proxy`. Up-day/down-day volume, signed volume, accumulation/distribution, or price-volume divergence describe `price-volume pressure`; they are not money flow and must not be written as capital inflow/outflow. Only provider-defined net-buy/net-sell data may be called a flow measure, and its provider methodology must be shown.

## Turnover And Volume-Ratio Modes

Turnover must name the denominator class: `free_float`, `tradable`, or `total`, plus its date. Do not call a tradable- or total-share denominator free float.

For intraday volume ratio, prefer the mean cumulative volume at the same trading minute over the previous five complete trading days (`same_clock_5d`). If only previous full-day volume exists, a linear clock adjustment is allowed solely as `linear_clock_proxy` with low or medium confidence because A-share intraday volume is normally U-shaped.

## Sector Comparability Gate

A 5-day or 20-day sector leader table requires one sector taxonomy, identical start/end sessions, survivorship-aware constituents where practical, comparable return, breadth, turnover-share change, and a separately identified ETF/financing measure. Media roundups from different dates may be catalysts but cannot be stitched into a quantitative rotation ranking. If the minimum comparable window is absent, mark the ranking unavailable and reduce market-score coverage.
