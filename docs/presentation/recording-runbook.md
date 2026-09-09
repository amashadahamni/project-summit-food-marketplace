# Final Recording Runbook

This script supports the required five-minute full-stack demonstration and the 4IR recorded demonstration. Record against the real local or deployed environment and retain the raw video and screenshots in `docs/screenshots/`. Do not claim a step succeeded unless it is visible in the recording.

## Before Recording

1. Run `docker compose up --build` and wait for health checks.
2. Run the quality commands documented in [quality-and-delivery.md](../quality-and-delivery.md).
3. Open the local site at `http://localhost:3000/customer` and the 4IR API documentation at `http://localhost:8004/docs`.
4. Prepare three actual Cognito group test users only after Cognito is configured. Do not show passwords, tokens, AWS keys, or personal data.

## Full-Stack Sequence: About Five Minutes

| Time | Screen and narration |
| --- | --- |
| 0:00-0:30 | Show the logical and local deployment SVG exports. State the single-spa, BFF, FastAPI, PostgreSQL, Cognito, and product approval boundaries. |
| 0:30-1:30 | Sign in as Supplier. Create a product with real screen input and show it is pending. |
| 1:30-2:15 | Sign in as Data Steward. Approve the pending product and show approval history. Optionally reject a second product and show its reason. |
| 2:15-3:15 | Sign in as Customer. Search for the approved product, inspect details, add it to the active cart, update quantity, then remove it. |
| 3:15-3:35 | Attempt a role-protected endpoint or screen using an unauthorized session and show the safe denial. |
| 3:35-4:05 | Show Cypress, pytest, Ruff, ESLint, and CI evidence. |
| 4:05-4:50 | Open the demand-risk API docs. Submit the Strawberry scenario, explain the returned decision, then submit negative sales to show the safe HTTP 422 error. |
| 4:50-5:00 | State the limitations and only the evidence actually available: AWS/HTTPS/Cognito live evidence is pending until configured and captured. |

## Evidence Checklist

- Capture one screenshot per actor journey and one of the 4IR API result.
- Capture Cypress and evaluator terminal output.
- After AWS deployment, additionally capture the HTTPS URL, Cognito group assignment, CloudWatch logs/alarms, budget, tags, and health endpoint response.
- Name files with date and purpose, for example `2026-09-09-customer-cart.png`.