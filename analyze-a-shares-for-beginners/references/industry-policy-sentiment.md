# 行业、政策、热点新闻与舆情

## Industry Cycle Chain

Trace macro climate -> industry supply and demand -> product price -> inventory -> industry profit -> company exposure -> priced-in evidence.

Use PMI sub-indices, PPI output versus input prices, output, sales, utilization, inventory, profit, receivable days, inventory days, industry relative strength, breadth, turnover share, and valuation percentile.

Do not treat PMI above 50 alone as bullish. Distinguish expansion acceleration, expansion slowdown, contraction acceleration, and contraction slowdown.

| Sector | Cycle indicators |
| --- | --- |
| Semiconductors | utilization, inventory days, capex, prices, downstream shipments |
| Chemicals and metals | product price, feedstock cost, spread, inventory, capacity |
| Hog breeding | hog price, breeding sow inventory, feed cost, cash cost, slaughter volume |
| Banks | net interest margin, non-performing loans, provision coverage, credit demand |
| Consumer | retail sales, same-store growth, average ticket, channel inventory |
| New energy | installations, tenders, production schedule, price, utilization, exports |
| Real estate chain | sales, starts, completions, land, inventory, funding |

## Policy Evidence Grades

- S: enacted law or regulation, State Council, or formal competent-department document.
- A: official implementation rule, press conference, or documented authority meeting.
- B: authoritative media report without the formal instrument.
- C: broker interpretation, self-media, Xueqiu post, or rumor.

Only S and A can add to policy score. Use B as verification lead and C as sentiment only. Record publication and effective dates, mechanism, budget or quota, beneficiaries, exclusions, expiry, and reversal risk.

Map instrument -> revenue, cost, financing, or supply mechanism -> company exposure -> estimated magnitude -> implementation lag -> priced-in evidence.

## News Catalyst Test

For every event explain verification, novelty, materiality, company exposure, duration, and price absorption. Do not double count one event across policy, news, and sentiment.

## Sentiment Metrics

Classify each cleaned post as s_i in {-1, 0, 1}. Define auditable weight:

w_i = log(1+views) + 0.5*log(1+likes) + 0.8*log(1+comments)

- Weighted sentiment: sum(w_i*s_i) / sum(w_i).
- Positive or negative ratio: positive_weight / max(negative_weight, epsilon).
- Heat z-score: (current_mentions - rolling_mean) / rolling_std.
- Disagreement: 1 - abs(positive_weight-negative_weight)/(positive_weight+negative_weight).
- Sentiment-price divergence: compare sentiment change with return and turnover change.

State platform, collection window, sample size, de-duplication, spam filtering, and missing engagement fields. Down-weight duplicated text, new accounts, coordinated bursts, and posts after cutoff.

## Market-Environment Score

- Industry cycle: 25.
- Official policy: 20.
- Verified news catalysts: 20.
- Price-volume and technical state: 20.
- Investor sentiment: 15.

Show evidence coverage as available points divided by 100. Below 70%, do not emit a composite score. Never transfer these points into fundamental value.

## Primary Sources

- State Council policy database: https://sousuo.www.gov.cn/zcwjk/
- NDRC: https://www.ndrc.gov.cn/
- MIIT: https://www.miit.gov.cn/
- PBOC: https://www.pbc.gov.cn/
- CSRC: https://www.csrc.gov.cn/
- NBS: https://www.stats.gov.cn/
- PMI: https://www.stats.gov.cn/zs/tjws/tjzb/202301/t20230101_1903972.html
- PPI: https://www.stats.gov.cn/zs/tjws/tjzb/202301/t20230101_1903637.html
