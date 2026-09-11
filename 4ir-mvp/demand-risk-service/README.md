# Demand Risk Decision Support MVP

This separate 4IR MVP gives a food supplier an explainable stock-risk recommendation from daily sales history, current stock, and supplier lead time. It is decision support only: a supplier retains control over any reorder.

## Run locally

```powershell
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --port 8004
```

Open `http://localhost:8004/docs` and submit a `POST /demand-risk` request. Run `py -m pytest tests -q` for the repeatable MVP test set, then `py evaluate.py` to calculate the synthetic scenario result.

## Controls and limitations

- The API accepts only non-negative sales, bounded history, stock, and lead-time values.
- It returns a safe validation error instead of an internal exception for invalid input.
- The model uses supplied aggregate daily units only; it does not process customer personal data.
- The weighted recent-history forecast is intentionally transparent. It is not suitable for automated procurement, promotions, weather shifts, or seasonal demand until evaluated on supplier-owned historical data.