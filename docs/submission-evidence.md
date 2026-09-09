# Submission Evidence and Operations Runbook

## Current local evidence

- Docker Compose starts PostgreSQL, the BFF, the three marketplace services, the Vite site, and the separate demand-risk MVP.
- The marketplace uses React, Redux, and single-spa. Browser API traffic uses the BFF at `/api/v1`.
- Cypress contains six marketplace journeys. Python and Node checks are documented in `quality-and-delivery.md`.
- Architecture SVG exports, presentation decks, and the demonstration script are under `docs/architecture`, `docs/4ir`, and `docs/presentation`.

## Required owner-performed evidence

Do not mark an item complete until the real account or recording result exists.

| Evidence | Capture | Status |
| --- | --- | --- |
| AWS identity and region | `aws sts get-caller-identity`; `eu-north-1` shown | Pending |
| HTTPS deployment | public domain, certificate, and browser screenshot | Pending |
| Cognito | User Pool, app client callbacks, three groups, and three test users | Pending |
| Role enforcement | Customer, Supplier, and Data Steward allowed paths plus cross-role `403` results | Pending |
| Monitoring and cost controls | CloudWatch logs/alarm, AWS Budget alert, project/owner/environment/expiry tags | Pending |
| SonarQube | project dashboard and passing Quality Gate screenshot/link | Pending |
| CI | successful GitHub Actions lint, tests, build, and Cypress run | Pending |
| Recording | final marketplace and 4IR recordings following `presentation/recording-runbook.md` | Pending |

## AWS deployment sequence

1. Install the AWS CLI, authenticate in the project owner's account locally, then verify identity with `aws sts get-caller-identity`. Never share credentials or tokens in chat or commit them.
2. Choose the owned domain and create an ACM certificate in the region required by the chosen edge/DNS architecture. Validate DNS ownership before routing traffic.
3. Deploy PostgreSQL to a private RDS instance and deploy the BFF plus FastAPI containers to ECS Fargate or App Runner. Keep only the site and BFF publicly routable; services and database remain private.
4. Put an HTTPS load balancer or managed proxy in front of the site and BFF. Route `/api/v1/*` to the BFF on the same public origin so production cookies remain secure and no `:8080` browser endpoint is needed.
5. Set runtime configuration through a secret manager or deployment environment: database URL, `COGNITO_REGION`, pool ID, client ID, public frontend origin, and production Cognito domain. Do not use the local Compose passwords in AWS.
6. Add the exact HTTPS login and logout URLs to the Cognito app client, update the public Cognito configuration file, and complete each role journey.
7. Add health checks, CloudWatch log retention, an error alarm, a small AWS Budget alert, and mandatory tags. Capture screenshots before cleanup.
8. Update `docs/architecture/deployment.md` and its SVG only after the deployed architecture is factual. Delete assessment resources after marking, including database snapshots if they are no longer required.

## Operational checks and rollback

Run local checks before a demo: `docker compose ps`, `docker compose logs bff`, `Invoke-WebRequest http://localhost:8080/health`, and `Invoke-WebRequest http://localhost:8004/health`.

- Login failure: confirm the callback and logout URLs, client ID, Cognito domain, browser origin, and `GET /api/v1/auth/me` response.
- Marketplace failure: inspect BFF logs first, then the owning FastAPI service and PostgreSQL health. The public catalogue is served through Product Service; carts also require Product Service availability.
- Deployment rollback: retain the previous container image revision, shift traffic back through the platform deployment controls, then verify health checks and the public catalogue before investigating forward.
- Local reset: use `docker compose down`; use `docker compose down -v` only when intentionally deleting local PostgreSQL data.