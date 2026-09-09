# Final Demonstration Deck

## Slide 1: Business Problem

Summit Food Marketplace connects customers, suppliers, and Data Stewards while enforcing product visibility, supplier ownership, a single active cart, inventory checks, and approval auditability.

## Slide 2: Solution

The solution uses React/Redux micro frontends composed by single-spa, a Node.js BFF, FastAPI domain services, PostgreSQL, and Cognito-ready role-based authorization.

## Slide 3: Marketplace Live Journey

1. Supplier signs in and submits a product.
2. Data Steward approves it; the approval history is visible.
3. Customer searches, views the approved product, then adds, updates, and removes it from the active cart.
4. Show a protected action without an authorized role being rejected safely.

## Slide 4: Architecture

Use the exported [use case](../architecture/assets/use-case.svg), [logical](../architecture/assets/logical.svg), and [local deployment](../architecture/assets/deployment-local.svg) diagrams. The Product Service owns approval lifecycle and audit records; the BFF validates and forwards identity context.

## Slide 5: Quality Evidence

- Six Cypress marketplace journeys pass in the repeatable local environment.
- Python tests, ESLint, Ruff, frontend build, and Docker Compose configuration pass locally.
- The 4IR MVP tests pass and its evaluator returns $3/3 = 100\%$ on the synthetic scenario set.

## Slide 6: 4IR MVP

Show `POST /demand-risk` in the FastAPI Swagger UI with the Strawberry scenario. The API returns high risk, demand forecast, stock cover, reorder recommendation, and calculation explanation. Then submit negative sales to show validation failure.

## Slide 7: Responsible Use and Limitations

The 4IR tool uses aggregate data only and never creates purchase orders. It is transparent decision support, not a production model. Real supplier data, seasonal signals, and pilot evaluation are required before operational use.

## Slide 8: Deployment Status and Next Steps

The Dockerized local system and diagrams are complete. AWS deployment, real Cognito role testing, SonarQube server scan, HTTPS evidence, CloudWatch, budget, and recorded user demonstration remain evidence-gathering tasks that require the candidate AWS account and a recording.