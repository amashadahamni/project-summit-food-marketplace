# Local Deployment Architecture

Export: [deployment-local.svg](assets/deployment-local.svg)

```mermaid
flowchart TB
  User[Browser at localhost:3000]
  Cognito[Amazon Cognito Hosted UI]

  subgraph Docker Desktop
    Site[site container :3000]
    BFF[bff container :8080]
    Product[product-service :8001]
    UserService[user-service :8000]
    Cart[cart-service :8002]
    DemandRisk[demand-risk-service :8004]
    Postgres[(postgres :5432)]
  end

  User --> Site
  User --> Cognito
  Site --> BFF
  BFF --> Product
  BFF --> UserService
  BFF --> Cart
  Product --> Postgres
  UserService --> Postgres
  Cart --> Postgres
```

The demand-risk service is a separate, locally reproducible 4IR MVP and is not called by the marketplace frontend. AWS production deployment remains an outstanding requirement. The target is static site hosting with HTTPS, Cognito, containerized BFF and FastAPI services, managed PostgreSQL, CloudWatch logs, budget alerts, and cleanup tags.