export const SITE_CONFIG = {
  name: "NuclearThreatWatch.org",
  tagline: "Live U.S. radiation monitoring powered by EPA RadNet.",
  description:
    "Free public radiation monitoring and nuclear preparedness resources powered by EPA RadNet live data. Track radiation levels, nuclear threats, and emergency preparedness information.",
  workerBaseUrl: "https://nuclearthreatwatch.org",
  themeColor: "#0a0e13",
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
