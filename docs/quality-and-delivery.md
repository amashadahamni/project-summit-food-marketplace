# Quality and Delivery

## Local verification

Run the project checks before a demo or submission:

```powershell
Set-Location backend/product-service; py -m pytest tests -q
Set-Location ../../cart-service; py -m pytest tests -q
Set-Location ../user-service; py -m pytest tests -q
Set-Location ../..; py -m pip install ruff; ruff check backend
Set-Location bff; npm ci; npm run lint
Set-Location ../frontend; npm ci; npm run lint; npm run build; npm run cy:run
Set-Location ..; docker compose config -q
```

GitHub Actions runs these checks on each push and pull request through `.github/workflows/ci.yml`.

## SonarQube

Create a project in SonarQube or SonarCloud, set `SONAR_TOKEN` as a repository secret, then run:

```powershell
sonar-scanner -Dsonar.token=$env:SONAR_TOKEN
```

The checked-in `sonar-project.properties` defines sources, tests, exclusions, and Python version. The `sonar` GitHub Actions job runs only after `SONAR_TOKEN` and `SONAR_HOST_URL` repository secrets are set. Capture the Quality Gate result from the configured project as submission evidence; it cannot be truthfully generated without access to your SonarQube account.

## AWS deployment evidence

Deploy the site over HTTPS, use Amazon Cognito for identity, run the BFF and FastAPI containers on ECS or App Runner, store PostgreSQL in RDS, and route container logs to CloudWatch. Capture screenshots of the deployed URL, Cognito groups, service health, CloudWatch logs, budget alert, and resource tags. Delete the stack after assessment to avoid charges.