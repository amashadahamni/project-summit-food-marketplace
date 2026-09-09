const cognito = window.AUTH_CONFIG?.cognito;
const bffOrigin = `${location.protocol}//${location.hostname}:8080`;
const isConfigured = cognito &&
  cognito.domain !== "YOUR_DOMAIN.auth.YOUR_REGION.amazoncognito.com" &&
  cognito.clientId !== "YOUR_APP_CLIENT_ID";
const authUi = window.summitAuthUI;

function roleLandingPage(roles) {
  if (roles.includes("Supplier")) return "/supplier";
  if (roles.includes("DataSteward")) return "/datasteward";
  return "/customer";
}

function permittedReturnPage(returnTo, roles) {
  if (returnTo === "/supplier" && roles.includes("Supplier")) return returnTo;
  if (returnTo === "/datasteward" && roles.includes("DataSteward")) return returnTo;
  if (returnTo === "/customer" && roles.includes("Customer")) return returnTo;
  return null;
}

function useCallbackOrigin() {
  if (!isConfigured) return true;

  const isSignup = document.body.dataset.authMode === "signup";
  const callback = new URL(isSignup ? cognito.signupRedirectUri : cognito.loginRedirectUri);
  if (location.origin === callback.origin) return true;

  location.replace(`${callback.origin}${location.pathname}${location.search}${location.hash}`);
  return false;
}

function createCodeVerifier() {
  const values = new Uint8Array(32);
  crypto.getRandomValues(values);
  return Array.from(values, value => value.toString(16).padStart(2, "0")).join("");
}

async function createCodeChallenge(codeVerifier) {
  const encoded = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function redirectToCognito() {
  if (!isConfigured) {
    authUi?.showStatus("Configure your Cognito domain and app client in js/auth-config.js first.", true);
    return;
  }

  const isSignup = document.body.dataset.authMode === "signup";
  const redirectUri = isSignup ? cognito.signupRedirectUri : cognito.loginRedirectUri;
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  if (returnTo) sessionStorage.setItem("summit.cognito.returnTo", returnTo);
  const codeVerifier = createCodeVerifier();
  sessionStorage.setItem("summit.cognito.codeVerifier", codeVerifier);
  const parameters = new URLSearchParams({
    client_id: cognito.clientId,
    response_type: "code",
    scope: cognito.scope,
    redirect_uri: redirectUri,
    code_challenge: await createCodeChallenge(codeVerifier),
    code_challenge_method: "S256"
  });
  const route = isSignup ? "signup" : "login";
  location.assign(`https://${cognito.domain}/${route}?${parameters}`);
}

function signOut() {
  fetch(`${bffOrigin}/api/v1/auth/logout`, { method: "POST", credentials: "include" }).finally(() => {
  const parameters = new URLSearchParams({
    client_id: cognito.clientId,
    logout_uri: cognito.logoutUri
  });
  location.assign(`https://${cognito.domain}/logout?${parameters}`);
  });
}

function readAuthorizationCode() {
  return new URLSearchParams(location.search).get("code");
}

async function exchangeCodeWithBff(code, codeVerifier) {
  const response = await fetch(`${bffOrigin}/api/v1/auth/exchange`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      codeVerifier,
      redirectUri: document.body.dataset.authMode === "signup" ? cognito.signupRedirectUri : cognito.loginRedirectUri
    })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "The session could not be validated.");
  return payload;
}

if (useCallbackOrigin()) {
  const cognitoButton = document.getElementById("cognitoBtn");
  cognitoButton?.addEventListener("click", redirectToCognito);

  const signOutButton = document.getElementById("signOutBtn");
  signOutButton?.addEventListener("click", signOut);

  const authorizationCode = readAuthorizationCode();
  if (authorizationCode) {
    const codeVerifier = sessionStorage.getItem("summit.cognito.codeVerifier");
    exchangeCodeWithBff(authorizationCode, codeVerifier)
      .then((session) => {
        sessionStorage.removeItem("summit.cognito.codeVerifier");
        history.replaceState({}, document.title, location.pathname);
        const returnTo = sessionStorage.getItem("summit.cognito.returnTo");
        sessionStorage.removeItem("summit.cognito.returnTo");
        const roles = session.roles || [];
        document.body.dataset.homeUrl = permittedReturnPage(returnTo, roles) || roleLandingPage(roles);
        authUi?.showSuccess(session.username || "there", "", "", document.body.dataset.authMode === "signup");
      })
      .catch(error => authUi?.showStatus(error.message, true));
  }
}

window.summitCognitoSignOut = signOut;