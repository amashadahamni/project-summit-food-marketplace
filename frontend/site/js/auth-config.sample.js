// Copy this file to auth-config.js and fill values before using the Hosted UI.
window.AUTH_CONFIG = {
  // Example region: 'us-east-1'
  region: '',
  // Your Cognito domain, e.g. 'my-app-domain.auth.us-east-1.amazoncognito.com'
  userPoolDomain: '',
  // App client id (no secret for public clients)
  clientId: '',
  // Redirect URI after sign-in. For local dev: http://localhost:3000/
  redirectUri: window.location.origin + '/',
  // Scopes requested
  scope: 'openid profile email'
};
