# 4IR Proposal Pitch Deck

## Slide 1: Problem

**Demand Risk Decision Support for Small Food Suppliers**

Inventory coordinators make reorder decisions from informal stock checks. Perishable items can stock out before replenishment or be over-ordered and wasted.

## Slide 2: Evidence and Impact

- The marketplace captures stock but has no demand-risk decision support.
- Three realistic synthetic scenarios demonstrate high demand/low stock, stable demand/adequate stock, and no recent demand.
- Hypothesis: an explainable alert improves consistency and decision speed. This hypothesis has not yet been externally validated.

## Slide 3: Proposed Solution

- A separate FastAPI decision-support MVP forecasts demand from aggregate daily sales.
- It calculates lead-time demand, safety stock, stock cover, and a risk classification.
- The supplier receives an explanation and remains the final decision maker.

## Slide 4: Two-Week MVP Scope

Included: validated API, deterministic forecast, Docker image, evaluation data, automated tests, and reproducible demo.

Excluded: automatic purchase orders, customer data, third-party AI APIs, promotion/weather signals, and production forecasting claims.

## Slide 5: Architecture and Data

Use the [4IR data-flow export](../4ir/assets/demand-risk-data-flow.svg).

Input: current stock, lead time, and aggregate daily units sold. Output: risk level, stock cover, reorder units, and explanation. Validation rejects unsafe data before calculation.

## Slide 6: Success Measures

- Valid request returns a meaningful decision output.
- Invalid negative sales returns HTTP 422 without implementation details.
- All three synthetic labeled scenarios classify as expected.
- Verified result: $3/3 = 100\%$ agreement on the constructed synthetic cases. This is not real-world forecasting accuracy.

## Slide 7: Plan, Risks, and Pilot

- Validate with a supplier using consented historical aggregate sales.
- Compare against a time-based holdout using MAE, stockout recall, false-alert rate, and decision time.
- Risks: seasonal shifts, promotions, data quality, and over-reliance on recommendations.
- Mitigations: human approval, transparent formula, input validation, and no automated procurement.