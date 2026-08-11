(function () {
  var cfg = window.AUTH_CONFIG || {};

  function statusEl() { return document.getElementById("status"); }

  function showStatus(msg, isError) {
    var el = statusEl();
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    el.style.background = isError ? "#fee2e2" : "#fef9c3";
    el.style.borderColor = isError ? "#fca5a5" : "#fde68a";
    el.style.color       = isError ? "#991b1b" : "#92400e";
  }

  function showSuccess(name, email, picture) {
    // Replace form with a logged-in welcome state
    var right = document.querySelector(".right");
    if (!right) return;
    right.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;padding:40px 24px;text-align:center">' +
      (picture ? '<img src="' + picture + '" style="width:72px;height:72px;border-radius:50%;border:3px solid #e2e8f0"/>' : '') +
      '<h2 style="margin:0;font-size:1.5rem;font-weight:800">Welcome, ' + name + '!</h2>' +
      '<p style="margin:0;color:#475569">' + email + '</p>' +
      '<p style="margin:0;color:#64748b;font-size:.85rem">You are logged in with Google.</p>' +
      '<a href="index.html" style="margin-top:8px;padding:13px 28px;background:#2563eb;color:#fff;border-radius:10px;font-weight:700;text-decoration:none">Go to Marketplace</a>' +
      '<button onclick="google&&google.accounts.id.disableAutoSelect();location.reload()" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:.82rem">Sign out</button>' +
      '</div>';
  }

  function googleClientIdReady() {
    return cfg.googleClientId && cfg.googleClientId !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
  }

  // Called by Google after the user picks an account (One Tap or popup)
  window.handleGoogleCredential = function (response) {
    try {
      // Decode the JWT payload — no signature verification needed on the client
      var parts = response.credential.split(".");
      var payload = JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")));
      showSuccess(payload.given_name || payload.name, payload.email, payload.picture);
    } catch (e) {
      showStatus("Google login succeeded but could not read profile.", true);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {

    // ── Toggle password visibility ─────────────────────────────────────────
    var toggleBtn = document.getElementById("togglePwd");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var inp = document.getElementById("passwordInput");
        inp.type = inp.type === "password" ? "text" : "password";
      });
    }

    // ── Login button (email / password) ───────────────────────────────────
    var loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
      loginBtn.addEventListener("click", function () {
        var email    = (document.getElementById("emailInput")    || {}).value || "";
        var password = (document.getElementById("passwordInput") || {}).value || "";
        if (!email || !password) { showStatus("Please enter your email and password."); return; }
        showStatus("Email/password login requires a backend. Use 'Continue with Google' or configure AWS Cognito.");
      });
    }

    // ── Google button ──────────────────────────────────────────────────────
    var googleBtn = document.getElementById("googleBtn");
    if (googleBtn) {
      googleBtn.addEventListener("click", function () {
        if (!googleClientIdReady()) {
          showStatus("Paste your Google Client ID into js/auth-config.js first.");
          return;
        }
        if (typeof google === "undefined") {
          showStatus("Google Identity script failed to load. Check your internet connection.", true);
          return;
        }
        // Trigger the Google One-Tap / popup flow
        google.accounts.id.initialize({
          client_id: cfg.googleClientId,
          callback:  window.handleGoogleCredential,
          ux_mode:   "popup"
        });
        google.accounts.id.prompt(function (notification) {
          if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
            // One-tap dismissed — fall back to the rendered button popup
            var fakeEl = document.createElement("div");
            fakeEl.style.display = "none";
            document.body.appendChild(fakeEl);
            google.accounts.id.renderButton(fakeEl, { theme: "outline", size: "large" });
            fakeEl.querySelector("div[role=button]").click();
          }
        });
      });
    }
  });

  // Initialise One Tap silently once the GSI script loads (auto-sign-in if
  // the user already granted access and has an active Google session)
  window.onGoogleLibraryLoad = function () {
    if (!googleClientIdReady()) return;
    google.accounts.id.initialize({
      client_id: cfg.googleClientId,
      callback:  window.handleGoogleCredential,
      auto_select: true
    });
    google.accounts.id.prompt();
  };
})();
