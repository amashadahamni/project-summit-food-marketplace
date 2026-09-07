import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const config = window.AUTH_CONFIG?.firebaseConfig;
const hasFirebaseConfig = config && config.apiKey && config.apiKey !== "YOUR_FIREBASE_API_KEY";
const authUi = window.summitAuthUI;

function errorMessage(error) {
  if (error.code === "auth/popup-closed-by-user") return "Sign-in was cancelled.";
  if (error.code === "auth/popup-blocked") return "Your browser blocked the sign-in popup. Allow popups and try again.";
  if (error.code === "auth/operation-not-allowed") return "Google sign-in is not enabled in Firebase Authentication.";
  if (error.code === "auth/unauthorized-domain") return "This address must be added to Firebase Authentication's authorised domains.";
  return `Google sign-in could not be completed (${error.code || "unknown error"}).`;
}

async function notifyBff(user) {
  const idToken = await user.getIdToken();
  await fetch("http://localhost:8080/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });
}

if (!hasFirebaseConfig) {
  authUi?.showStatus("Add your Firebase web app configuration in js/auth-config.js to enable Google sign-in.");
} else {
  const auth = getAuth(initializeApp(config));
  const provider = new GoogleAuthProvider();
  const googleButton = document.getElementById("googleBtn");

  googleButton?.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      notifyBff(user).catch(() => {});
      authUi?.showSuccess(
        user.displayName || "there",
        user.email || "",
        user.photoURL || "",
        result._tokenResponse?.isNewUser === true
      );
      document.getElementById("signOutBtn")?.addEventListener("click", async () => {
        await signOut(auth);
        location.reload();
      });
    } catch (error) {
      authUi?.showStatus(errorMessage(error), true);
    }
  });
}