export const SITE_CONFIG = {
  name: "Signal & Shelter",
  tagline: "Live RadNet tracking with source-aware public context.",
  description:
    "A public-facing radiation monitoring site built around EPA RadNet live data, station clarity, and launch-ready educational pages.",
  workerBaseUrl: "",
  themeColor: "#102133",
  staleAfterHours: 6,
  serviceWorkerPath: "/sw.js",
};

export const RADNET_CONFIG = {
  CDX_BASE: "https://radnet.epa.gov/cdx-radnet-rest/api/rest/csv",
  PROXY_BASE: SITE_CONFIG.workerBaseUrl,
  USE_PROXY: true,
  TIMEOUT_MS: 10000,
  BATCH_SIZE: 4,
};

export const AD_CONFIG = {
  enabled: false,
  showPlaceholdersWhenDisabled: false,
  autoAds: false,
  publisherId: "ca-pub-REPLACE_ME",
  slotIds: {
    mid: "REPLACE_MID_SLOT",
    lower: "REPLACE_LOWER_SLOT",
  },
};

export const NAV_ITEMS = [
  ["home", "Home", "index.html"],
  ["map", "Map", "pages/map.html"],
  ["stations", "Stations", "stations.html"],
  ["methodology", "Methodology", "methodology.html"],
  ["data", "Data", "data.html"],
  ["resources", "Resources", "resources.html"],
  ["faq", "FAQ", "faq.html"],
  ["contact", "Contact", "contact.html"],
];
