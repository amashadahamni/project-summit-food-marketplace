# Cognito Setup

Project Summit requires Amazon Cognito. Firebase is not part of the required candidate stack.

1. Create a Cognito User Pool in your own AWS account.
2. Create groups named `Customer`, `Supplier`, and `DataSteward`.
3. Create a public app client with OAuth 2.0 enabled and allow the `openid`, `profile`, and `email` scopes.
4. Configure a Cognito domain.
5. Add `http://localhost:3000/frontend/login/login.html` and `http://localhost:3000/frontend/signup/signup.html` to the app client's callback URLs. Add `http://localhost:3000/` to the logout URLs. Add your deployed URLs before deployment.
6. Put the Cognito domain and client ID in `frontend/site/js/auth-config.js`.
7. Copy `bff/.env.example` to a local `.env` file and set `COGNITO_USER_POOL_ID` and `COGNITO_CLIENT_ID`. Do not commit the `.env` file.
8. Add Google as a federation provider in Cognito only if Google account selection is required. Configure the Google client credentials in Cognito, not in the browser.

The BFF validates Cognito access-token signature, issuer, client ID, expiry, and `cognito:groups` claims at `POST /api/auth/session`.

# Guide Compliance Status

Implemented or started:

- Node.js BFF with product, cart, approval, and Cognito session routes.
- Cognito login and sign-up page redirects, with no browser token persistence.
- Cognito JWT validation in the BFF.
- Local CORS policy and BFF health endpoint.
- Initial single-spa root config and three React microfrontend packages.

Still required before submission:

- Compose the login and sign-up experience inside the single-spa React shell; the current preview pages remain static prototypes.
- Implement real React and Redux customer, supplier, and data steward journeys through the BFF.
- Add FastAPI router, service, repository, schema, model, security, and exception layers with PostgreSQL, SQLAlchemy, and Alembic migrations.
- Enforce Cognito roles and product/cart business rules in every service.
- Add use-case, logical, and deployment diagrams that match the final implementation.
- Add unit, integration, and at least five Cypress end-to-end tests; run linting and SonarQube.
- Dockerize every component, deploy to AWS, add structured logging, readiness checks, monitoring, CI/CD, and cleanup instructions.
- Complete the separate mandatory 4IR proposal, functional MVP, evaluation evidence, and demo materials.