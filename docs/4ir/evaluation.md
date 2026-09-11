# 4IR MVP Evaluation Evidence

## Method

The evaluation dataset is [evaluation-cases.json](../../4ir-mvp/demand-risk-service/sample-data/evaluation-cases.json). It contains three synthetic, labeled supplier stock scenarios. The test suite checks the high-risk and no-demand boundary behavior; the scenario labels make the demonstration repeatable.

## Measured result

Run from `4ir-mvp/demand-risk-service`:

```powershell
py -m pytest tests -q
py evaluate.py
```

The executable evaluation returns $3/3 = 100\%$ on the initial synthetic scenario set. This measures agreement with deliberately constructed labels, not real-world forecast accuracy.

## Demonstration scenario

Submit the Strawberry request from the evaluation data to `POST /demand-risk`. The API returns high risk, lead-time forecast, stock cover, reorder units, and the calculation explanation. Then submit negative sales to show safe validation failure.

## Next evaluation

Before production use, evaluate on supplier-consented historical data using a time-based holdout. Report mean absolute error, stockout recall, false-alert rate, and supplier decision time against a manual baseline. Do not claim those metrics until they have been measured.