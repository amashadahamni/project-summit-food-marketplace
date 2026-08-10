// AWS Cognito configuration — fill in your real values from the AWS Console
window.AUTH_CONFIG = {
  // e.g. "us-east-1"
  region: "us-east-1",

  // Your Cognito Hosted UI domain (no https://)
  // e.g. "summit-marketplace.auth.us-east-1.amazoncognito.com"
  userPoolDomain: "YOUR_COGNITO_DOMAIN",

  // App client ID (from Cognito > App clients)
  clientId: "YOUR_CLIENT_ID",

  // Where Cognito sends the user back after login
  // For local dev keep this; set to your deployed URL in production
  redirectUri: "http://localhost:3000/",

  // OAuth scopes
  scope: "openid profile email"
};
