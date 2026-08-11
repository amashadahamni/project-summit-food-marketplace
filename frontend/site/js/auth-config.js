// Fill in your values then hard-refresh the browser
window.AUTH_CONFIG = {
  // ─── Google OAuth ────────────────────────────────────────────────────────
  // 1. Go to https://console.cloud.google.com/apis/credentials
  // 2. Create OAuth 2.0 Client ID (type: Web application)
  // 3. Add  http://localhost:3000  to "Authorised JavaScript origins"
  // 4. Paste the Client ID below
  googleClientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",

  // ─── AWS Cognito (optional – only needed when deploying to production) ───
  userPoolDomain: "YOUR_COGNITO_DOMAIN",
  clientId:       "YOUR_COGNITO_CLIENT_ID",
  redirectUri:    "http://localhost:3000/",
  scope:          "openid profile email"
};
