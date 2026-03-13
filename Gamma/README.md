# Signal & Shelter

Signal & Shelter is a static multi-page site for near-real-time EPA RadNet monitoring context, designed for deployment on Cloudflare Pages with a paired Cloudflare Worker proxy.

## What is included

- Live homepage station map fed through `_worker.js`
- Station directory and shared metadata model
- Editorial pages: about, methodology, data, resources, FAQ, contact, privacy, terms, disclaimer
- Hidden two-slot ad system on each major page
- Manifest and service worker for PWA support

## Deploying on Cloudflare

1. Deploy the repository to Cloudflare Pages.
2. Keep `_worker.js` at the project root so Cloudflare Pages can use it for the RadNet proxy route.
3. Replace the Worker base URL in `assets/js/config.js` if you deploy the worker separately.
4. Replace the placeholder contact form action and review `LAUNCH_NOTES.md` before public launch.

## Local preview

You can preview the static files with any simple local server. Because the live map expects the worker route, either serve through Cloudflare preview or temporarily point `PROXY_BASE` at your deployed worker URL.
