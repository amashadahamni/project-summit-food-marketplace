(function () {
  var cfg = window.AUTH_CONFIG || {};
  var statusEl = document.getElementById("status");

  function showStatus(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.display = "block";
  }

  function isConfigured() {
    return (
      cfg.userPoolDomain && cfg.userPoolDomain !== "YOUR_COGNITO_DOMAIN" &&
      cfg.clientId && cfg.clientId !== "YOUR_CLIENT_ID" &&
      cfg.redirectUri
    );
  }

  function buildAuthUrl(identityProvider) {
    var p = new URLSearchParams({
      redirect_uri: cfg.redirectUri,
      response_type: "code",
      client_id: cfg.clientId,
      scope: cfg.scope || "openid profile email",
    });
    if (identityProvider) p.set("identity_provider", identityProvider);
    return "https://" + cfg.userPoolDomain + "/oauth2/authorize?" + p.toString();
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Surface auth code returned by Cognito after redirect
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("code")) {
      showStatus(
        "Auth code received. Exchange this code for tokens in your BFF (bff/index.js) " +
        "using the /oauth2/token endpoint."
      );
    }

    var googleBtn = document.getElementById("googleBtn");
    var signinBtn = document.getElementById("signinBtn");

    if (googleBtn) {
      googleBtn.addEventListener("click", function () {
        if (!isConfigured()) {
          showStatus("Configure js/auth-config.js with your Cognito domain and client ID first.");
          return;
        }
        window.location.href = buildAuthUrl("Google");
      });
    }

    if (signinBtn) {
      signinBtn.addEventListener("click", function () {
        var email = (document.getElementById("emailInput") || {}).value || "";
        var password = (document.getElementById("passwordInput") || {}).value || "";
        if (!email || !password) {
          showStatus("Please enter your email and password.");
          return;
        }
        if (!isConfigured()) {
          // Fall back to Cognito Hosted UI login page
          showStatus("Configure js/auth-config.js to enable sign-in.");
          return;
        }
        // Redirect to Cognito Hosted UI; it handles email/password internally
        window.location.href = buildAuthUrl();
      });
    }
  });
})();
