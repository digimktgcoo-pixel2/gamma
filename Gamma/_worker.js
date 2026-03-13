/**
 * Cloudflare Worker proxy for EPA RadNet CDX CSV
 * Route format:
 *   /radnet/{year}/{state}/{city}
 */

function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extra,
  };
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const match = url.pathname.match(/^\/radnet\/(\d{4})\/([A-Z]{2})\/(.+)$/i);

    if (!match) {
      return new Response("Not found", {
        status: 404,
        headers: corsHeaders({ "Content-Type": "text/plain; charset=utf-8" }),
      });
    }

    const [, year, state, rawCity] = match;
    const city = decodeURIComponent(rawCity).trim().toUpperCase();

    const epaUrl = `https://radnet.epa.gov/cdx-radnet-rest/api/rest/csv/${year}/fixed/${state.toUpperCase()}/${encodeURIComponent(city)}`;

    try {
      const res = await fetch(epaUrl, {
        method: "GET",
        cf: {
          cacheTtl: 3600,
          cacheEverything: true,
        },
      });

      const body = await res.text();

      return new Response(body, {
        status: res.status,
        headers: corsHeaders({
          "Content-Type": "text/csv; charset=utf-8",
          "Cache-Control": "public, max-age=900",
        }),
      });
    } catch (err) {
      return new Response(`Worker error: ${err.message}`, {
        status: 502,
        headers: corsHeaders({ "Content-Type": "text/plain; charset=utf-8" }),
      });
    }
  },
};
