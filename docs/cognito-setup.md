# Cognito Setup

Project Summit requires Amazon Cognito. Firebase is not part of the required candidate stack.

1. Create a Cognito User Pool in your own AWS account.
2. Create groups named `Customer`, `Supplier`, and `DataSteward`.
3. Create a public app client with OAuth 2.0 enabled and allow the `openid`, `profile`, and `email` scopes.
4. Configure a Cognito domain.
5. Add these callback URLs to the app client: `http://localhost:3000/frontend/login/login.html`, `http://localhost:3000/frontend/signup/signup.html`, `http://127.0.0.1:3000/frontend/login/login.html`, and `http://127.0.0.1:3000/frontend/signup/signup.html`. Add both `http://localhost:3000/` and `http://127.0.0.1:3000/` to the logout URLs. Add your deployed URLs before deployment.
6. Put the Cognito domain and client ID in `frontend/site/js/auth-config.js`.
7. Copy `bff/.env.example` to a local `.env` file and set `COGNITO_USER_POOL_ID` and `COGNITO_CLIENT_ID`. Do not commit the `.env` file.
8. Add Google as a federation provider in Cognito only if Google account selection is required. Configure the Google client credentials in Cognito, not in the browser.

## Provision the local role test accounts

The local stack is configured for user pool `eu-north-1_dHRX3BGdc` in `eu-north-1`. Authenticate the AWS CLI to the AWS account that owns this pool, then run the following commands. Replace the email placeholders with three addresses you control. Do not put passwords, access keys, or access tokens in this repository.

```powershell
$pool = 'eu-north-1_dHRX3BGdc'
$region = 'eu-north-1'

'Customer', 'Supplier', 'DataSteward' | ForEach-Object {
	aws cognito-idp create-group --user-pool-id $pool --group-name $_ --region $region
}

aws cognito-idp admin-create-user --user-pool-id $pool --username customer@example.com --user-attributes Name=email,Value=customer@example.com Name=email_verified,Value=true --desired-delivery-mediums EMAIL --region $region
aws cognito-idp admin-create-user --user-pool-id $pool --username supplier@example.com --user-attributes Name=email,Value=supplier@example.com Name=email_verified,Value=true --desired-delivery-mediums EMAIL --region $region
aws cognito-idp admin-create-user --user-pool-id $pool --username steward@example.com --user-attributes Name=email,Value=steward@example.com Name=email_verified,Value=true --desired-delivery-mediums EMAIL --region $region

aws cognito-idp admin-add-user-to-group --user-pool-id $pool --username customer@example.com --group-name Customer --region $region
aws cognito-idp admin-add-user-to-group --user-pool-id $pool --username supplier@example.com --group-name Supplier --region $region
aws cognito-idp admin-add-user-to-group --user-pool-id $pool --username steward@example.com --group-name DataSteward --region $region
```

If a group or user already exists, the corresponding create command can be skipped. Confirm assignments without displaying credentials:

```powershell
aws cognito-idp list-groups --user-pool-id $pool --region $region --query 'Groups[].GroupName' --output table
aws cognito-idp admin-list-groups-for-user --user-pool-id $pool --username customer@example.com --region $region --query 'Groups[].GroupName' --output table
aws cognito-idp admin-list-groups-for-user --user-pool-id $pool --username supplier@example.com --region $region --query 'Groups[].GroupName' --output table
aws cognito-idp admin-list-groups-for-user --user-pool-id $pool --username steward@example.com --region $region --query 'Groups[].GroupName' --output table
```

## End-to-end role checks

1. Start the Compose stack and visit `http://localhost:3000/`. Use the sign-in page and complete the Cognito Hosted UI flow with the Customer account. The BFF session cookie must be created by `/api/v1/auth/exchange`; customer can add, update, and remove cart items while `/supplier` and `/datasteward` operations return `403`.
2. Sign out, sign in as Supplier, and visit `/supplier`. Submit a product, edit/resubmit it, and deactivate it. Customer cart calls must return `403`.
3. Sign out, sign in as Data Steward, and visit `/datasteward`. Load the pending queue, reject a product with a reason or approve it, then confirm the decision appears in review history. Supplier product mutation and customer cart calls must return `403`.
4. Capture the HTTP status and browser result for each allowed operation and each cross-role `403`. This is the test evidence that the `cognito:groups` access-token claim is propagated by the BFF and enforced by FastAPI.

The BFF validates Cognito access-token signature, issuer, client ID, expiry, and `cognito:groups` claims during the code exchange and at `GET /api/v1/auth/me`. The React single-spa shell uses that safe cookie-backed session response for navigation and route protection without exposing the token to browser JavaScript.

The local marketplace implementation, automated checks, diagrams, and 4IR MVP are in the repository. AWS account actions, live Cognito evidence, and recording remain owner-performed tasks; use [submission-evidence.md](submission-evidence.md) to track them.