import { SITE_CONFIG } from "./config.js";
import { initHomePage, initStationsPage } from "./pages.js";

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(SITE_CONFIG.serviceWorkerPath).catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}

function initPage() {
  registerServiceWorker();

  const page = document.body.dataset.page;
  if (page === "home") {
    initHomePage();
  }
  if (page === "stations") {
    initStationsPage();
  }
}

initPage();
