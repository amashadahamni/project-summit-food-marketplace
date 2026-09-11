# 4IR Proposal: Demand Risk Decision Support MVP

Architecture and data-flow export: [demand-risk-data-flow.svg](assets/demand-risk-data-flow.svg)

## Problem and stakeholder

Small food suppliers make reorder decisions from informal stock checks. Perishable products can sell out before the next delivery or be over-ordered and wasted. The primary user is a supplier inventory coordinator; the business owner is a small food-marketplace supplier.

## Evidence and impact hypothesis

The marketplace already stores product stock and supports supplier inventory workflows. This MVP uses realistic synthetic daily unit-sales scenarios because no supplier-owned historic sales data has been supplied. The hypothesis is that a transparent risk alert makes low-stock decisions faster and more consistent without automating procurement.

## Proposed 4IR solution and scope

The separate `4ir-mvp/demand-risk-service` is an AI/ML-style decision-support MVP. It forecasts near-term daily demand from weighted recent sales history, calculates lead-time demand and safety stock, then returns a low, medium, high, or no-recent-demand risk recommendation.

Included: a FastAPI API, explainable calculation, validation controls, Docker image, three repeatable scenarios, and automated tests. Excluded: automatic purchase orders, customer profiling, external model APIs, promotion/weather features, and production claims based on synthetic data.

## Data, privacy, risks, and responsible use

Inputs are aggregate daily unit counts, current stock, and lead time. No personal data is used. Outputs are recommendations, not automatic actions. Forecasts can be wrong when demand changes unexpectedly; suppliers must review the explanation and retain final control. Before a pilot, validate against consented supplier history and compare forecast error by product category.

## Evaluation plan and success criteria

Run the three labeled scenarios in `sample-data/evaluation-cases.json`. Success criteria are: every expected risk class is returned, invalid negative sales are rejected, and the API returns a result for a valid request. The results must be recorded from the automated run; synthetic results demonstrate software correctness only, not commercial forecasting accuracy.