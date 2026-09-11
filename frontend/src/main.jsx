import { registerApplication, start } from "single-spa";
import "./shell.css";

const authApi = `${window.location.protocol}//${window.location.hostname}:8080/api/v1/auth`;
const protectedRoutes = { "/supplier": "Supplier", "/datasteward": "DataSteward" };

const apps = [
  ["@summit/customer-app", () => import("../customer-app/src/index.jsx"), (location) => location.pathname.startsWith("/customer") || location.pathname === "/"],
  ["@summit/supplier-app", () => import("../supplier-app/src/index.jsx"), (location) => location.pathname.startsWith("/supplier")],
  ["@summit/datasteward-app", () => import("../datasteward-app/src/index.jsx"), (location) => location.pathname.startsWith("/datasteward")]
];

async function loadSession() {
  try {
    const response = await fetch(`${authApi}/me`, { credentials: "include" });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

function redirectToSignIn() {
  const returnTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
  window.location.replace(`/frontend/login/login.html?returnTo=${returnTo}`);
}

async function initialise() {
  const session = await loadSession();
  window.summitSession = session;
  const requiredRole = protectedRoutes[window.location.pathname];
  if (requiredRole && !session?.roles?.includes(requiredRole)) {
    redirectToSignIn();
    return;
  }
  apps.forEach(([name, app, activeWhen]) => registerApplication({ name, app, activeWhen }));
  start();
}

initialise();