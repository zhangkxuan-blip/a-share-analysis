# A股分析公式

Use consistent periods and units. Prefer trailing-twelve-month profit for current valuation, average beginning and end balance-sheet values for return ratios, and forward estimates only when source and forecast period are explicit.

## Price, Return, And Risk

- Holding return: (end_price - start_price + dividend) / start_price.
- Log return: ln(end_price / start_price); require positive prices.
- Annualized return: (end_value / start_value)^(252 / trading_days) - 1.
- Annualized volatility: stdev(daily_returns) * sqrt(252).
- Maximum drawdown: min(value_t / running_peak_t - 1).
- Beta: cov(stock_return, market_return) / var(market_return); state benchmark and lookback.
- Sharpe ratio: (annual_return - risk_free_rate) / annual_volatility.

## Valuation

- EPS: attributable common profit / weighted-average shares.
- PE: price / EPS, or market cap / attributable profit. Negative or near-zero EPS makes PE not meaningful.
- PB: price / book value per share. Negative equity makes PB not meaningful.
- PS: market cap / revenue; compare only similar business models and margins.
- Dividend yield: annual cash dividend per share / current price.
- Enterprise value: market cap + interest-bearing debt - cash.
- EV/EBITDA: enterprise value / EBITDA; avoid for banks and insurers.
- PEG: PE / expected growth percentage. PE 20 and growth 20% gives PEG 1.

## Profitability, Growth, And Cash

- Gross margin: (revenue - cost) / revenue.
- Net margin: attributable profit / revenue; separate recurring and one-off profit.
- ROE: attributable profit / average attributable equity.
- ROA: net profit / average assets.
- ROIC: EBIT * (1-tax_rate) / average invested capital.
- DuPont ROE: net margin × asset turnover × equity multiplier.
- YoY growth: current / prior-year-same-period - 1.
- CAGR: (ending / beginning)^(1/years) - 1; require positive comparable endpoints.
- Cash profit ratio: operating cash flow / net profit.
- Simple free cash flow: operating cash flow - capital expenditure.
- FCFF: EBIT*(1-tax) - (capex-depreciation) - change_non_cash_working_capital.
- Sustainable growth: retention ratio × ROE.

## Solvency And Efficiency

- Debt-to-assets: total liabilities / total assets.
- Current ratio: current assets / current liabilities.
- Quick ratio: (current assets - inventory) / current liabilities.
- Interest coverage: EBIT / interest expense.
- Net debt ratio: (interest-bearing debt - cash) / equity.
- Inventory days: average inventory / cost of sales × period days.
- Receivable days: average receivables / revenue × period days.

## Technical And Volume Indicators

- SMA_N = sum(last N closes) / N.
- EMA_today = alpha*close_today + (1-alpha)*EMA_previous, alpha = 2/(N+1).
- DIF = EMA_12 - EMA_26; DEA = EMA_9(DIF); mainland software commonly shows MACD = 2*(DIF-DEA).
- RSI = 100 - 100/(1 + average_gain/average_loss); state smoothing rule.
- Bollinger bands: SMA_N ± k*stdev_N.
- True range: max(high-low, abs(high-prev_close), abs(low-prev_close)); ATR is its smoothed average.
- VWAP = sum(price*volume)/sum(volume); state price convention.
- Turnover: traded shares / free-float shares.
- OBV: previous OBV plus signed volume based on close direction.

Treat signals as descriptions, not causal proof. Use adjusted prices after corporate actions.

## Worked Example

Given price 20 yuan, TTM EPS 2 yuan, book value per share 8 yuan, attributable profit 1 billion yuan, average equity 5 billion yuan, operating cash flow 1.2 billion yuan, and capex 0.4 billion yuan:

- PE = 20 / 2 = 10x.
- PB = 20 / 8 = 2.5x.
- ROE = 1 / 5 = 20%.
- Simple FCF = 1.2 - 0.4 = 0.8 billion yuan.
- Cash profit ratio = 1.2 / 1 = 1.2x.

Do not call 10x PE cheap until growth, cash quality, leverage, cyclicality, peers, and one-off profit are checked.
