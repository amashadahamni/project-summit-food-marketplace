# Project Summit Food Marketplace

A full-stack microservices food shopping marketplace with 3 user roles:
- Customer: browse approved products, search, view details, and manage a single active cart.
- Supplier: submit new products, update own listings, deactivate products, and track approval status.
- Data Steward: review supplier submissions and approve or reject with a reason.

Architecture:
- Frontend: React + Redux mini-apps for Customer, Supplier, and Data Steward, stitched using single-spa.
- BFF: Node.js backend-for-frontend layer to aggregate and forward frontend requests.
- Services: Python FastAPI microservices for Product, Cart, and Approval logic.
- Database: PostgreSQL.
- Auth: Amazon Cognito for login and role-based access.
- Containerization: Docker + Docker Compose.

## Repository layout

- `frontend/root-config` — single-spa root config
- `frontend/customer-app` — customer-facing microfrontend
- `frontend/supplier-app` — supplier microfrontend
- `frontend/datasteward-app` — data steward microfrontend
- `bff` — Backend-for-Frontend Node.js app
- `services/product-service` — FastAPI product microservice
- `services/cart-service` — FastAPI cart microservice
- `services/approval-service` — FastAPI approval microservice

## Next steps

1. Install backend dependencies:
   - `cd services/product-service && pip install -r requirements.txt`
   - Repeat for `cart-service` and `approval-service`
2. Install BFF dependencies:
   - `cd bff && npm install`
3. Install frontend dependencies:
   - `cd frontend/customer-app && npm install`
   - `cd frontend/supplier-app && npm install`
   - `cd frontend/datasteward-app && npm install`
   - `cd frontend/root-config && npm install`
4. Start services and frontend apps in development.

## Notes

This repository was initialized as an empty GitHub repo and scaffolded with the requested architecture. The next phase is to implement the specific product approval workflows, Cognito auth integration, and AI-powered inventory prediction feature.
