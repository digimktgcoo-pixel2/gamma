import { STATIONS } from "./stations.js";
import { formatTimestamp, loadAllStations, getEpaCity } from "./radnet.js";

function projectPoint(lat, lng) {
  const minLng = -125;
  const maxLng = -66;
  const minLat = 24;
  const maxLat = 50;
  const x = 140 + ((lng - minLng) / (maxLng - minLng)) * 700;
  const y = 500 - ((lat - minLat) / (maxLat - minLat)) * 320;
  return { x, y };
}

function statusPill(status, isFallback = false) {
  const labelMap = {
    normal: "Normal band",
    elevated: "Elevated",
    watch: "Watch",
    stale: "Stale",
    fallback: "Estimated",
  };

  const key = isFallback ? "fallback" : status;
  return `<span class="status-pill ${key}">${labelMap[key] || "Normal band"}</span>`;
}

function stationCardMarkup(station) {
  const timestamp = formatTimestamp(station.timestamp);
  return `
    <article class="panel station-card" data-station-card data-station-id="${station.id}">
      <p class="eyebrow">${station.state}</p>
      <h3>${station.city}</h3>
      <p>${station.epaCity ? `EPA live path: ${station.epaCity}.` : "EPA live path matches display city."}</p>
      <p class="station-reading">${station.dose_nsvh ?? "--"} nSv/h</p>
      ${statusPill(station.status, station.isFallback)}
      <p class="note-line">Updated: ${timestamp}</p>
    </article>
  `;
}

function focusMarkup(station) {
  return `
    <p class="eyebrow">Selected station</p>
    <h3>${station.city}, ${station.state}</h3>
    <p>${station.sourceLabel}. Timestamp shown in your local time from EPA UTC output.</p>
    <p class="station-reading">${station.dose_nsvh ?? "--"} nSv/h</p>
    ${statusPill(station.status, station.isFallback)}
    <div class="station-meta">
      <span><strong>EPA city:</strong> ${station.epaCity || station.city}</span>
      <span><strong>CPM:</strong> ${station.cpm ?? "N/A"}</span>
      <span><strong>Updated:</strong> ${formatTimestamp(station.timestamp)}</span>
    </div>
  `;
}

function renderMapPoints(stations) {
  const target = document.querySelector("[data-map-points]");
  if (!target) return;
  target.innerHTML = stations
    .map((station) => {
      const { x, y } = projectPoint(station.lat, station.lng);
      return `
        <g class="map-point" data-map-point data-station-id="${station.id}" transform="translate(${x}, ${y})">
          <circle r="9"></circle>
          <text y="-18" text-anchor="middle" fill="#dcedf7" font-size="12">${station.state}</text>
        </g>
      `;
    })
    .join("");
}

function wireStationSelection(stations) {
  const focus = document.querySelector("[data-station-focus]");
  if (!focus) return;

  const select = (id) => {
    const station = stations.find((item) => item.id === id);
    if (!station) return;
    focus.innerHTML = focusMarkup(station);

    document.querySelectorAll("[data-map-point]").forEach((node) => {
      node.classList.toggle("is-active", node.getAttribute("data-station-id") === id);
    });
  };

  document.querySelectorAll("[data-station-card]").forEach((node) => {
    node.addEventListener("click", () => select(node.getAttribute("data-station-id")));
  });
  document.querySelectorAll("[data-map-point]").forEach((node) => {
    node.addEventListener("click", () => select(node.getAttribute("data-station-id")));
  });

  if (stations[0]) {
    select(stations[0].id);
  }
}

function wireHomeFilters(stations) {
  const search = document.querySelector("[data-station-search]");
  const filter = document.querySelector("[data-status-filter]");
  const cards = [...document.querySelectorAll("[data-station-card]")];
  const points = [...document.querySelectorAll("[data-map-point]")];
  if (!search || !filter) return;

  const apply = () => {
    const query = search.value.trim().toLowerCase();
    const statusValue = filter.value;

    stations.forEach((station) => {
      const matchQuery =
        !query ||
        `${station.city} ${station.state} ${station.epaCity || ""}`.toLowerCase().includes(query);
      const matchStatus =
        statusValue === "all" ||
        (statusValue === "fallback" ? station.isFallback : station.status === statusValue || station.readingStatus === statusValue);
      const visible = matchQuery && matchStatus;

      cards
        .filter((node) => node.getAttribute("data-station-id") === station.id)
        .forEach((node) => node.classList.toggle("is-hidden", !visible));
      points
        .filter((node) => node.getAttribute("data-station-id") === station.id)
        .forEach((node) => (node.style.display = visible ? "" : "none"));
    });
  };

  search.addEventListener("input", apply);
  filter.addEventListener("change", apply);
}

export async function initHomePage() {
  const countTarget = document.querySelector("[data-station-count]");
  if (countTarget) {
    countTarget.textContent = `${STATIONS.length} stations`;
  }

  renderMapPoints(STATIONS);
  const grid = document.querySelector("[data-station-grid]");
  if (!grid) return;

  const results = [];
  await loadAllStations(
    STATIONS,
    (station) => {
      results.push(station);
      grid.innerHTML = results.map((item) => stationCardMarkup(item)).join("");
      wireStationSelection(results);
      wireHomeFilters(results);
    },
    () => wireStationSelection(results)
  );
}

export function initStationsPage() {
  const grid = document.querySelector("[data-directory-grid]");
  if (!grid) return;

  const render = (stations) => {
    grid.innerHTML = stations
      .map(
        (station) => `
          <article class="panel directory-card" data-directory-card data-search="${station.city} ${station.state} ${station.epaCity || station.city}">
            <p class="eyebrow">${station.state}</p>
            <h3>${station.city}</h3>
            <p>Launch baseline: ${station.baseline} nSv/h.</p>
            <p>${station.epaCity ? `EPA live city override: ${station.epaCity}.` : "EPA live city matches the display label."}</p>
            <a class="text-link" href="index.html#live-map">View on the live map</a>
          </article>
        `
      )
      .join("");
  };

  render(STATIONS.map((station) => ({ ...station, epaCity: getEpaCity(station) })));

  const search = document.querySelector("[data-directory-search]");
  if (!search) return;

  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    document.querySelectorAll("[data-directory-card]").forEach((node) => {
      const haystack = node.getAttribute("data-search").toLowerCase();
      node.classList.toggle("is-hidden", query && !haystack.includes(query));
    });
  });
}
