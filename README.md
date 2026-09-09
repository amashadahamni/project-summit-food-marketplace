# Project Summit Food Marketplace

A full-stack microservices food shopping marketplace with 3 user roles:
- Customer: browse approved products, search, view details, and manage a single active cart.
- Supplier: submit new products, update own listings, deactivate products, and track approval status.
- Data Steward: review supplier submissions and approve or reject with a reason.

Architecture:
- Frontend: React + Redux mini-apps for Customer, Supplier, and Data Steward, stitched using single-spa.
- BFF: Node.js backend-for-frontend layer to aggregate and forward frontend requests.
- Services: Python FastAPI microservices for User, Product, and Cart logic.
- Database: PostgreSQL.
- Auth: Amazon Cognito for login and role-based access.
- Containerization: Docker + Docker Compose.

## Repository layout

- `frontend/root-config` — single-spa root config
- `frontend/customer-app` — customer-facing microfrontend
- `frontend/supplier-app` — supplier microfrontend
- `frontend/datasteward-app` — data steward microfrontend
- `frontend/src/main.jsx` — Vite single-spa shell and role-aware route guard
- `bff` — Backend-for-Frontend Node.js app
- `backend/user-service` — FastAPI user profile microservice; Cognito remains the source of identity and roles
- `backend/product-service` — FastAPI product microservice, including the approval module
- `backend/cart-service` — FastAPI cart microservice

## Backend services

The backend has exactly three Python FastAPI services:

| Service | Owns | Rules enforced |
| --- | --- | --- |
| User Service (`8000`) | Application profile linked to Cognito subject | Cognito is the source of identity and group roles. Users can read and edit only their own profile. |
| Product Service (`8001`) | Products, supplier submissions, approvals, rejection history and audit events | Only approved active products are customer-visible. Suppliers edit only their own products. Data Stewards approve or reject, and rejection requires a reason. |
| Cart Service (`8002`) | A customer's active cart and its items | One active cart per customer. Quantities must be positive and cannot exceed approved product stock. |

Product approval belongs in Product Service because it changes the product lifecycle. This preserves the requested three-service architecture without losing the PDF's approval rule.

## BFF API

The browser calls the Node.js BFF at `http://localhost:8080`; it validates the Cognito access token and forwards it to the Python service for independent authorization.

- `GET /api/v1/products?search=&category=`: public approved, active catalog
- `POST /api/v1/products`, `PATCH /api/v1/products/:productId`, `GET /api/v1/products/mine`: Supplier actions
- `GET /api/v1/products/review/pending`, `GET /api/v1/products/review/history`, `PATCH /api/v1/products/:productId/approve`, `PATCH /api/v1/products/:productId/reject`: Data Steward actions
- `GET|PATCH /api/v1/users/me`: authenticated profile
- `GET /api/v1/cart`, `PUT /api/v1/cart/items`, `DELETE /api/v1/cart/items/:productId`: Customer cart
- `GET /api/v1/auth/me`: safe cookie-backed session identity and Cognito group roles for the SPA shell

## Configuration and local run

Set these non-secret values in your local environment or root `.env` before starting protected APIs:

```text
COGNITO_REGION=eu-north-1
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_app_client_id
```

Do not commit a Cognito client secret, Google secret, tokens, or AWS credentials. Create Cognito groups named `Customer`, `Supplier`, and `DataSteward`, then assign test users to the appropriate group.

For the complete Docker stack, copy `.env.example` to `.env`, replace the Cognito placeholders, then run:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

The marketplace is available at `http://localhost:3000`, the BFF at `http://localhost:8080`, marketplace service health endpoints at ports `8000` through `8002`, and the separate 4IR demand-risk API at `http://localhost:8004`. Stop and remove containers with `docker compose down`; add `-v` only when you deliberately want to remove local database data.

Install and run each service in a separate terminal:

```powershell
Set-Location backend/user-service; py -m pip install -r requirements.txt; py -m uvicorn app.main:app --port 8000
Set-Location backend/product-service; py -m pip install -r requirements.txt; py -m uvicorn app.main:app --port 8001
Set-Location backend/cart-service; py -m pip install -r requirements.txt; py -m uvicorn app.main:app --port 8002
Set-Location bff; npm install; npm start
```

Each service provides `/health` and `/ready`. PostgreSQL is configured through `DATABASE_URL`; Docker Compose uses the shared local database container when Docker Desktop is installed.

## Delivery status

The Dockerized React/Redux/single-spa marketplace, BFF, three required FastAPI services, automated checks, and separate 4IR demand-risk MVP are implemented locally. The React shell reads only the BFF's HTTP-only-cookie session endpoint and restricts Supplier and Data Steward routes by Cognito group; service-side authorization remains authoritative.

Account-bound work cannot be claimed complete until it is performed in the project owner's AWS and SonarQube accounts: deployed HTTPS endpoint, Cognito users/groups and live role tests, CloudWatch/Budget/tag evidence, Sonar Quality Gate, and the recorded demonstrations. Follow [docs/submission-evidence.md](docs/submission-evidence.md) to complete and capture that evidence.
