# Logical Architecture

Export: [logical.svg](assets/logical.svg)

```mermaid
flowchart LR
  Browser[Browser]
  Cognito[Amazon Cognito]
  Shell[single-spa root config]
  Customer[Customer React microfrontend]
  Supplier[Supplier React microfrontend]
  Steward[Data Steward React microfrontend]
  Preview[Docker static preview site]
  BFF[Node.js BFF]
  User[FastAPI User Service]
  Product[FastAPI Product and Approval Service]
  Cart[FastAPI Cart Service]
  Database[(PostgreSQL)]

  Browser --> Cognito
  Browser --> Shell
  Shell --> Customer
  Shell --> Supplier
  Shell --> Steward
  Browser --> Preview
  Customer --> BFF
  Supplier --> BFF
  Steward --> BFF
  Preview --> BFF
  BFF --> User
  BFF --> Product
  BFF --> Cart
  User --> Database
  Product --> Database
  Cart --> Database
```

The Product Service owns the submission lifecycle, approval decision, rejection reason, and audit records. This is the implemented approval boundary; no separate Approval Service is deployed.