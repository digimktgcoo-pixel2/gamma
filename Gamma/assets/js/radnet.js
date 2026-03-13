import { RADNET_CONFIG, SITE_CONFIG } from "./config.js";

function getCandidateYears() {
  const y = new Date().getFullYear();
  return [y, y - 1];
}

const EPA_CITY_OVERRIDES = {
  DE_WILMINGTON: "DOVER",
  MN_MINNEAPOLIS: "ST. PAUL",
  NJ_TRENTON: "EDISON",
  NY_NEW_YORK: "NEW YORK CITY",
  NY_BUFFALO: "LOCKPORT",
  SD_SIOUX_FALLS: "PIERRE",
  WY_CHEYENNE: "CASPER",
  LA_NEW_ORLEANS: "BATON ROUGE",
  MT_HELENA: "BILLINGS",
};

export function getEpaCity(station) {
  return station.epaCity || EPA_CITY_OVERRIDES[station.id] || station.city;
}

export function getStatus(dose) {
  if (dose >= 120) return "watch";
  if (dose >= 95) return "elevated";
  return "normal";
}

export function isStale(isoTimestamp) {
  if (!isoTimestamp) return true;
  const then = new Date(isoTimestamp).getTime();
  const now = Date.now();
  return now - then > SITE_CONFIG.staleAfterHours * 60 * 60 * 1000;
}

export function formatTimestamp(iso) {
  if (!iso) return "Unknown";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return "Unknown";
  }
}

function parseTimestamp(raw) {
  if (!raw) return null;
  try {
    const [datePart, timePart] = raw.split(" ");
    const [month, day, year] = datePart.split("/");
    return new Date(`${year}-${month}-${day}T${timePart}Z`).toISOString();
  } catch {
    return null;
  }
}

function simulateFallback(station) {
  const base = station.baseline || 82;
  const variance = (Math.random() - 0.5) * 18;
  const dose = Math.round(Math.max(40, base + variance));
  const cpm = Math.round(dose * 31.5);

  return {
    ...station,
    epaCity: getEpaCity(station),
    dose_nsvh: dose,
    cpm,
    timestamp: new Date().toISOString(),
    rawTimestamp: null,
    epaStatus: "ESTIMATED",
    status: "fallback",
    isLive: false,
    isFallback: true,
    isStale: false,
    sourceLabel: "Estimated fallback",
  };
}

function normalizeCSV(csvText, station, epaCity, year) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("Insufficient CSV data");
  }

  let cols = null;
  for (let i = lines.length - 1; i >= 1; i -= 1) {
    const parts = lines[i].split(",");
    if (parts.length >= 4 && /\d{1,2}\/\d{1,2}\/\d{4}/.test(parts[1] || "")) {
      cols = parts;
      break;
    }
  }

  if (!cols) {
    throw new Error("No usable EPA row found");
  }

  const rawTimestamp = cols[1]?.trim() || null;
  const timestamp = parseTimestamp(rawTimestamp);
  const dose = parseFloat(cols[2]);
  const cpm = parseFloat(cols[3]);

  if (Number.isNaN(dose)) {
    throw new Error("Invalid dose value");
  }

  const stale = isStale(timestamp);
  const baseStatus = getStatus(dose);

  return {
    ...station,
    epaCity,
    epaYear: year,
    dose_nsvh: Math.round(dose),
    cpm: Number.isNaN(cpm) ? null : Math.round(cpm),
    timestamp,
    rawTimestamp,
    epaStatus: cols[cols.length - 1]?.trim() || "APPROVED",
    status: stale ? "stale" : baseStatus,
    readingStatus: baseStatus,
    isLive: true,
    isFallback: false,
    isStale: stale,
    sourceLabel: stale ? "Live, but stale" : "Live EPA read",
  };
}

export async function fetchStationData(station) {
  const epaCity = getEpaCity(station);
  let lastError = null;

  for (const year of getCandidateYears()) {
    const cityPath = encodeURIComponent(epaCity.toUpperCase());
    const proxyBase = RADNET_CONFIG.PROXY_BASE || "";
    const url = RADNET_CONFIG.USE_PROXY
      ? `${proxyBase}/radnet/${year}/${station.state}/${cityPath}`
      : `${RADNET_CONFIG.CDX_BASE}/${year}/fixed/${station.state}/${cityPath}`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), RADNET_CONFIG.TIMEOUT_MS);

      const res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const text = await res.text();
      return normalizeCSV(text, station, epaCity, year);
    } catch (error) {
      lastError = error;
    }
  }

  console.warn("EPA live fetch failed:", station.id, lastError);
  return simulateFallback(station);
}

export async function loadAllStations(stations, onStationLoaded, onComplete) {
  const { BATCH_SIZE } = RADNET_CONFIG;

  for (let i = 0; i < stations.length; i += BATCH_SIZE) {
    const batch = stations.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((station) => fetchStationData(station)));
    results.forEach((result) => onStationLoaded(result));
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  if (typeof onComplete === "function") {
    onComplete();
  }
}
