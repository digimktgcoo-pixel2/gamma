export const STATIONS = [
  { id: "WA_SEATTLE", city: "Seattle", state: "WA", lat: 47.61, lng: -122.33, baseline: 73 },
  { id: "CA_SACRAMENTO", city: "Sacramento", state: "CA", lat: 38.58, lng: -121.49, baseline: 76 },
  { id: "NV_LAS_VEGAS", city: "Las Vegas", state: "NV", lat: 36.17, lng: -115.14, baseline: 84 },
  { id: "AZ_PHOENIX", city: "Phoenix", state: "AZ", lat: 33.45, lng: -112.07, baseline: 80 },
  { id: "MT_HELENA", city: "Helena", state: "MT", lat: 46.59, lng: -112.04, baseline: 78 },
  { id: "WY_CHEYENNE", city: "Cheyenne", state: "WY", lat: 41.14, lng: -104.82, baseline: 81 },
  { id: "CO_DENVER", city: "Denver", state: "CO", lat: 39.74, lng: -104.99, baseline: 88 },
  { id: "TX_DALLAS", city: "Dallas", state: "TX", lat: 32.78, lng: -96.8, baseline: 79 },
  { id: "MN_MINNEAPOLIS", city: "Minneapolis", state: "MN", lat: 44.98, lng: -93.27, baseline: 74 },
  { id: "SD_SIOUX_FALLS", city: "Sioux Falls", state: "SD", lat: 43.54, lng: -96.73, baseline: 77 },
  { id: "LA_NEW_ORLEANS", city: "New Orleans", state: "LA", lat: 29.95, lng: -90.07, baseline: 83 },
  { id: "IL_CHICAGO", city: "Chicago", state: "IL", lat: 41.88, lng: -87.63, baseline: 71 },
  { id: "MI_DETROIT", city: "Detroit", state: "MI", lat: 42.33, lng: -83.05, baseline: 73 },
  { id: "NY_BUFFALO", city: "Buffalo", state: "NY", lat: 42.89, lng: -78.87, baseline: 76 },
  { id: "NY_NEW_YORK", city: "New York", state: "NY", lat: 40.71, lng: -74.01, baseline: 68 },
  { id: "NJ_TRENTON", city: "Trenton", state: "NJ", lat: 40.22, lng: -74.76, baseline: 72 },
  { id: "DE_WILMINGTON", city: "Wilmington", state: "DE", lat: 39.74, lng: -75.55, baseline: 72 },
  { id: "GA_ATLANTA", city: "Atlanta", state: "GA", lat: 33.75, lng: -84.39, baseline: 79 },
  { id: "FL_MIAMI", city: "Miami", state: "FL", lat: 25.76, lng: -80.19, baseline: 77 },
  { id: "MA_BOSTON", city: "Boston", state: "MA", lat: 42.36, lng: -71.06, baseline: 69 },
];

export function getStationById(id) {
  return STATIONS.find((station) => station.id === id) || null;
}
