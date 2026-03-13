# Launch Notes

These are the items you still need to fill in before a real public launch.

## Required manual fill-ins

- Replace `PROXY_BASE` in `assets/js/config.js` with your deployed Cloudflare Worker or Pages domain if needed.
- Replace `YOUR_FORM_ID` in `contact.html` or swap the form to your own backend.
- Review the placeholder site contact and business identity language across the legal pages.
- Confirm whether you want analytics, then add the script and update `privacy.html`.

## AdSense follow-up

- Add your AdSense publisher script in the document head template inside `assets/js/layout.js` if you want script injection handled globally.
- Fill in `publisherId`, `slotIds.mid`, and `slotIds.lower` in `assets/js/config.js`.
- Flip `enabled` to `true` in the ad config when you are ready to show placements.
- Decide whether some legal or utility pages should keep ads disabled even after sitewide activation.

## Brand and asset follow-up

- Replace the generated icon set in `assets/icons/` with your own final artwork if desired.
- Add a real `favicon.ico` if you want broad legacy browser coverage.
- Review all copy for your preferred voice and legal wording before launch.

## Data follow-up

- Expand the station dataset with the full network you want to support.
- Decide whether to add dedicated station detail pages in the next phase.
- Add Envirofacts-backed research pages later rather than changing the live homepage path.
