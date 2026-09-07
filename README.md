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
- `bff` — Backend-for-Frontend Node.js app
- `services/user-service` — FastAPI user profile microservice; Cognito remains the source of identity and roles
- `services/product-service` — FastAPI product microservice
- `services/cart-service` — FastAPI cart microservice

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

- `GET /api/products?search=&category=`: public approved, active catalog
- `POST /api/products`, `PATCH /api/products/:productId`, `GET /api/products/mine`: Supplier actions
- `GET /api/products/review/pending`, `PUT /api/products/:productId/approve`, `PUT /api/products/:productId/reject`: Data Steward actions
- `GET|PATCH /api/users/me`: authenticated profile
- `GET /api/cart`, `PUT /api/cart/items`, `DELETE /api/cart/items/:productId`: Customer cart

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

The marketplace is available at `http://localhost:3000`, the BFF at `http://localhost:8080`, and the service health endpoints at ports `8000` through `8002`. Stop and remove containers with `docker compose down`; add `-v` only when you deliberately want to remove local database data.

Install and run each service in a separate terminal:

```powershell
Set-Location services/user-service; py -m pip install -r requirements.txt; py -m uvicorn app.main:app --port 8000
Set-Location services/product-service; py -m pip install -r requirements.txt; py -m uvicorn app.main:app --port 8001
Set-Location services/cart-service; py -m pip install -r requirements.txt; py -m uvicorn app.main:app --port 8002
Set-Location bff; npm install; npm start
```

Each service provides `/health` and `/ready`. PostgreSQL is configured through `DATABASE_URL`; Docker Compose uses the shared local database container when Docker Desktop is installed.

## Next steps

1. Install backend dependencies:
   - `cd services/product-service && pip install -r requirements.txt`
   - Repeat for `user-service` and `cart-service`
2. Install BFF dependencies:
   - `cd bff && npm install`
3. Install frontend dependencies:
   - `cd frontend/customer-app && npm install`
   - `cd frontend/supplier-app && npm install`
   - `cd frontend/datasteward-app && npm install`
   - `cd frontend/root-config && npm install`
4. Start services and frontend apps in development.

## Current scope

The backend, BFF routing, database models, Cognito token validation, and core PDF business rules are now structured around the required services. The React single-spa microfrontends still need to replace their placeholder screens with role-aware pages and call the BFF routes above; their work should be kept separate by Customer catalog/cart, Supplier product management, and Data Steward review screens.
