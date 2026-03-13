import { RADNET_CONFIG, SITE_CONFIG } from "./config.js";
import { fetchStationData } from "./radnet.js";

const DIRECTORY_URL = "data/stations.json";
const US_CENTER = [39.8283, -98.5795];
const STATUS_META = {
  normal: { label: "Normal", rank: 0 },
  elevated: { label: "Elevated", rank: 1 },
  high: { label: "High", rank: 2 },
  fallback: { label: "Fallback", rank: 3 },
};

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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "Unavailable";
  }

  try {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return "Unavailable";
  }
}

function validateStationDirectory(stations) {
  if (!Array.isArray(stations)) {
    throw new Error("Station directory must be an array.");
  }

  const requiredKeys = ["id", "name", "state", "epaCity", "lat", "lng", "baseline"];
  stations.forEach((station, index) => {
    requiredKeys.forEach((key) => {
      if (!(key in station)) {
        throw new Error(`Station at index ${index} is missing \"${key}\".`);
      }
    });

    if (typeof station.lat !== "number" || typeof station.lng !== "number") {
      throw new Error(`Station ${station.id} has invalid coordinates.`);
    }
  });

  return stations;
}

async function fetchStationDirectory(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Directory request failed with HTTP ${response.status}.`);
  }

  const payload = await response.json();
  return validateStationDirectory(payload);
}

function normalizeStatus(stationData) {
  if (!stationData || stationData.isFallback || stationData.status === "fallback" || stationData.status === "stale") {
    return "fallback";
  }

  if (stationData.status === "watch") {
    return "high";
  }

  return STATUS_META[stationData.status] ? stationData.status : "normal";
}

function buildStationViewModel(station, stationData) {
  const status = normalizeStatus(stationData);
  const sourceLabel = stationData?.isFallback
    ? "Fallback"
    : stationData?.isStale
      ? "Live, stale"
      : "Live";

  return {
    ...station,
    currentReading: Math.round(stationData?.dose_nsvh ?? station.baseline ?? 79),
    timestamp: stationData?.timestamp || null,
    sourceLabel,
    status,
    statusLabel: STATUS_META[status].label,
  };
}

async function loadLiveReadings(stations) {
  const batches = [];
  for (let index = 0; index < stations.length; index += RADNET_CONFIG.BATCH_SIZE) {
    batches.push(stations.slice(index, index + RADNET_CONFIG.BATCH_SIZE));
  }

  const results = [];
  for (const batch of batches) {
    const resolved = await Promise.all(batch.map((station) => fetchStationData(station)));
    results.push(...resolved);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return results;
}

function mergeStationData(directory, liveRecords = []) {
  const readingById = new Map(liveRecords.map((reading) => [reading.id, reading]));

  return directory
    .map((station) => buildStationViewModel(station, readingById.get(station.id)))
    .sort((a, b) => {
      const bySeverity = STATUS_META[b.status].rank - STATUS_META[a.status].rank;
      if (bySeverity !== 0) {
        return bySeverity;
      }

      return a.name.localeCompare(b.name);
    });
}

async function loadStationDataset(directoryUrl) {
  const directory = await fetchStationDirectory(directoryUrl);
  const liveRecords = await loadLiveReadings(directory);
  const stations = mergeStationData(directory, liveRecords);
  const fallbackCount = liveRecords.filter((station) => station.isFallback || station.status === "stale").length;

  if (fallbackCount > 0) {
    return {
      stations,
      message: `${fallbackCount} stations are currently showing stale or fallback data.`,
      tone: fallbackCount === stations.length ? "error" : "fallback",
    };
  }

  return {
    stations,
    message: "Live EPA readings loaded successfully.",
    tone: "success",
  };
}

function markerHtml(station) {
  return `
    <span class="station-marker station-marker-${station.status}" aria-hidden="true"></span>
    <span class="sr-only">${escapeHtml(station.name)}</span>
  `;
}

function popupMarkup(station) {
  return `
    <div class="map-popup">
      <strong>${escapeHtml(station.name)}</strong>
      <span>${escapeHtml(station.state)}</span>
      <span>Current reading: ${escapeHtml(station.currentReading)} nSv/h</span>
      <span>Timestamp: ${escapeHtml(formatTimestamp(station.timestamp))}</span>
      <span>${escapeHtml(station.sourceLabel)}</span>
    </div>
  `;
}

function listItemMarkup(station) {
  return `
    <button class="station-list-item" type="button" data-station-id="${escapeHtml(station.id)}">
      <span class="station-list-top">
        <span>
          <strong>${escapeHtml(station.name)}</strong>
          <small>${escapeHtml(station.state)} · EPA ${escapeHtml(station.epaCity)}</small>
        </span>
        <span class="station-dot station-dot-${station.status}"></span>
      </span>
      <span class="station-list-meta">
        <span>${escapeHtml(station.currentReading)} nSv/h</span>
        <span>${escapeHtml(formatTimestamp(station.timestamp))}</span>
      </span>
      <span class="station-list-label">${escapeHtml(station.sourceLabel)} · ${escapeHtml(station.statusLabel)}</span>
    </button>
  `;
}

function setBanner(messageNode, message, tone = "fallback") {
  messageNode.textContent = message;
  messageNode.className = `map-status-banner tone-${tone}`;
}

function createLegend(map) {
  const legend = window.L.control({ position: "bottomright" });
  legend.onAdd = () => {
    const node = window.L.DomUtil.create("div", "map-legend");
    node.innerHTML = `
      <strong>Legend</strong>
      <span><i class="station-dot station-dot-normal"></i>Normal</span>
      <span><i class="station-dot station-dot-elevated"></i>Elevated</span>
      <span><i class="station-dot station-dot-high"></i>High</span>
      <span><i class="station-dot station-dot-fallback"></i>Fallback</span>
    `;
    return node;
  };

  legend.addTo(map);
}

function createMap(container) {
  const map = window.L.map(container, {
    zoomControl: true,
    minZoom: 2,
    maxZoom: 10,
    worldCopyJump: false,
  });

  window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  map.setView(US_CENTER, 4);
  createLegend(map);
  return map;
}

function renderStations(map, stations, listNode, countNode) {
  const records = new Map();
  listNode.innerHTML = stations.map((station) => listItemMarkup(station)).join("");
  countNode.textContent = `${stations.length} stations`;

  stations.forEach((station) => {
    const latLng = [station.lat, station.lng];
    const marker = window.L.marker(latLng, {
      icon: window.L.divIcon({
        className: "map-marker-shell",
        html: markerHtml(station),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -12],
      }),
      title: station.name,
    })
      .addTo(map)
      .bindPopup(popupMarkup(station));

    records.set(station.id, {
      station,
      marker,
      listNode: listNode.querySelector(`[data-station-id="${station.id}"]`),
    });
  });


  const selectStation = (stationId, openPopup = false) => {
    records.forEach(({ marker, listNode: item }, id) => {
      const selected = id === stationId;
      item?.classList.toggle("is-active", selected);
      marker.getElement()?.querySelector(".station-marker")?.classList.toggle("is-active", selected);
      if (!selected && marker.isPopupOpen()) {
        marker.closePopup();
      }
    });

    const record = records.get(stationId);
    if (!record) {
      return;
    }

    if (openPopup) {
      record.marker.openPopup();
      map.panTo(record.marker.getLatLng(), { animate: true, duration: 0.4 });
    }
  };

  records.forEach(({ marker, listNode: item, station }) => {
    item?.addEventListener("click", () => selectStation(station.id, true));
    marker.on("click", () => selectStation(station.id, false));
    marker.on("popupopen", () => selectStation(station.id, false));
  });

  if (stations[0]) {
    selectStation(stations[0].id, false);
  }
}

function initMapPage() {
  registerServiceWorker();

  const mapNode = document.getElementById("station-map");
  const loadingNode = document.querySelector("[data-map-loading]");
  const messageNode = document.querySelector("[data-map-message]");
  const listNode = document.querySelector("[data-station-list]");
  const countNode = document.querySelector("[data-station-count]");

  if (!mapNode || !loadingNode || !messageNode || !listNode || !countNode) {
    return;
  }

  if (!window.L) {
    setBanner(messageNode, "Leaflet failed to load, so the map could not be initialized.", "error");
    loadingNode.classList.add("is-hidden");
    listNode.innerHTML = '<p class="map-empty">Map library unavailable.</p>';
    return;
  }

  const map = createMap(mapNode);
  loadStationDataset(DIRECTORY_URL)
    .then(({ stations, message, tone }) => {
      renderStations(map, stations, listNode, countNode);
      setBanner(messageNode, message, tone);
    })
    .catch((error) => {
      console.error("Map page initialization failed:", error);
      setBanner(messageNode, "The map could not finish loading. Please try again.", "error");
      listNode.innerHTML = '<p class="map-empty">No stations available.</p>';
    })
    .finally(() => {
      loadingNode.classList.add("is-hidden");
      setTimeout(() => map.invalidateSize(), 0);
    });
}

initMapPage();

