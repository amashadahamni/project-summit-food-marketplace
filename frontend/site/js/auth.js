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

  function showSuccess(name, email, picture, isNewUser) {
    var right = document.querySelector(".right");
    if (!right) return;
    right.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;padding:40px 24px;text-align:center">' +
      (picture ? '<img src="' + picture + '" style="width:72px;height:72px;border-radius:50%;border:3px solid #e2e8f0"/>' : '') +
      '<h2 style="margin:0;font-size:1.5rem;font-weight:800">Welcome, ' + name + '!</h2>' +
      '<p style="margin:0;color:#475569">' + email + '</p>' +
      '<p style="margin:0;color:#64748b;font-size:.85rem">' + (isNewUser ? 'Your Cognito account has been created.' : 'You are logged in with Cognito.') + '</p>' +
      '<a href="' + (document.body.dataset.homeUrl || 'index.html') + '" style="margin-top:8px;padding:13px 28px;background:#2563eb;color:#fff;border-radius:10px;font-weight:700;text-decoration:none">Go to Marketplace</a>' +
      '<button id="signOutBtn" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:.82rem">Sign out</button>' +
      '</div>';
    document.getElementById("signOutBtn").addEventListener("click", function () {
      if (window.summitCognitoSignOut) window.summitCognitoSignOut();
    });
  }

  window.summitAuthUI = { showStatus: showStatus, showSuccess: showSuccess };

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
        showStatus("Email/password login is not enabled. Continue with Google to sign in securely.");
      });
    }
  });
})();
