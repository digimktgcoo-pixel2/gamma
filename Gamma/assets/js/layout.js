/**
 * NuclearThreatWatch.org — layout.js
 * Injects global site header and footer into every page.
 * Update nav links, footer content, or Associates disclosure here only —
 * changes apply to every page automatically.
 *
 * Compatible with: root pages, resources/ subfolder, pages/ subfolder.
 * Add new pages using the standard template and this file does the rest.
 */

(function () {
  'use strict';

  /* ============================================================
     PATH DETECTION
     Figures out how deep the current page is so relative links
     work correctly at every folder level.
  ============================================================ */
  function getBasePath() {
    const path = window.location.pathname;
    // pages inside resources/ or pages/ subdirectory
    if (path.includes('/resources/') || path.includes('/pages/')) {
      return '../';
    }
    // root level pages
    return '';
  }

  const base = getBasePath();

  /* ============================================================
     NAV ITEMS
     Add, remove, or rename links here — updates every page.
     { label, href } — href is relative to site root (no leading slash needed)
  ============================================================ */
  const NAV_ITEMS = [
    { label: 'Home',               href: 'index.html' },
    { label: 'Live Map',           href: 'pages/map.html' },
    { label: 'Stations',           href: 'stations.html' },
    { label: 'Resources',          href: 'resources.html' },
    { label: 'About',              href: 'about.html' },
    { label: 'FAQ',                href: 'faq.html' },
    { label: 'Contact',            href: 'contact.html' },
  ];

  /* ============================================================
     ACTIVE LINK DETECTION
     Highlights the current page in the nav automatically.
  ============================================================ */
  function isActive(href) {
    const current = window.location.pathname;
    const filename = href.split('/').pop();
    // handle index / root
    if (href === 'index.html' && (current === '/' || current.endsWith('/index.html') || current.endsWith('/'))) {
      return true;
    }
    return current.endsWith(filename);
  }

  /* ============================================================
     HEADER HTML
  ============================================================ */
  function buildHeader() {
    const navLinks = NAV_ITEMS.map(item => {
      const active = isActive(item.href) ? ' ntw-nav-link--active' : '';
      return `<a href="${base}${item.href}" class="ntw-nav-link${active}">${item.label}</a>`;
    }).join('');

    return `
<header class="ntw-header" role="banner">
  <div class="ntw-header-inner container">

    <!-- Logo / Brand -->
    <a href="${base}index.html" class="ntw-logo" aria-label="NuclearThreatWatch.org — Home">
      <span class="ntw-logo-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Radiation trefoil symbol -->
          <circle cx="14" cy="14" r="3.2" fill="#c0392b"/>
          <!-- Blade 1 — top -->
          <path d="M14 10.8 C14 10.8 10.5 4.5 14 2 C17.5 4.5 14 10.8 14 10.8Z" fill="#c0392b" opacity="0.85"/>
          <!-- Blade 2 — bottom left -->
          <path d="M14 10.8 C14 10.8 7.2 13.8 5.2 10.8 C5.2 7.2 11.5 7.8 14 10.8Z" fill="#c0392b" opacity="0.85" transform="rotate(120 14 14)"/>
          <!-- Blade 3 — bottom right -->
          <path d="M14 10.8 C14 10.8 7.2 13.8 5.2 10.8 C5.2 7.2 11.5 7.8 14 10.8Z" fill="#c0392b" opacity="0.85" transform="rotate(240 14 14)"/>
          <circle cx="14" cy="14" r="13" stroke="#1c2e3e" stroke-width="1.5" fill="none"/>
        </svg>
      </span>
      <span class="ntw-logo-text">
        <span class="ntw-logo-primary">NuclearThreat</span><span class="ntw-logo-accent">Watch</span><span class="ntw-logo-tld">.org</span>
      </span>
    </a>

    <!-- Desktop Nav -->
    <nav class="ntw-nav" aria-label="Main navigation">
      ${navLinks}
    </nav>

    <!-- Mobile hamburger button -->
    <button class="ntw-hamburger" aria-label="Open navigation menu" aria-expanded="false" aria-controls="ntw-mobile-menu" type="button">
      <span class="ntw-hamburger-bar"></span>
      <span class="ntw-hamburger-bar"></span>
      <span class="ntw-hamburger-bar"></span>
    </button>

  </div>

  <!-- Mobile menu drawer -->
  <div class="ntw-mobile-menu" id="ntw-mobile-menu" aria-hidden="true">
    <nav class="ntw-mobile-nav" aria-label="Mobile navigation">
      ${NAV_ITEMS.map(item => {
        const active = isActive(item.href) ? ' ntw-nav-link--active' : '';
        return `<a href="${base}${item.href}" class="ntw-mobile-link${active}">${item.label}</a>`;
      }).join('')}
    </nav>
  </div>
</header>

<style>
  /* ── Header shell ── */
  .ntw-header {
    background: #080c10;
    border-bottom: 2px solid #1c2e3e;
    position: sticky;
    top: 0;
    z-index: 900;
    box-shadow: 0 2px 24px rgba(0,0,0,.55);
  }
  .ntw-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 62px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  /* ── Logo ── */
  .ntw-logo {
    display: flex;
    align-items: center;
    gap: .65rem;
    text-decoration: none;
    flex-shrink: 0;
  }
  .ntw-logo-icon { display: flex; align-items: center; }
  .ntw-logo-text {
    font-family: 'Oswald', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    line-height: 1;
  }
  .ntw-logo-primary { color: #fff; }
  .ntw-logo-accent  { color: #c0392b; }
  .ntw-logo-tld     { color: #6a8a9e; font-weight: 400; font-size: .85em; }

  /* ── Desktop nav ── */
  .ntw-nav {
    display: none;
    align-items: center;
    gap: .15rem;
  }
  @media (min-width: 860px) {
    .ntw-nav { display: flex; }
  }
  .ntw-nav-link {
    font-family: 'IBM Plex Mono', monospace;
    font-size: .68rem;
    font-weight: 500;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #6a8a9e;
    text-decoration: none;
    padding: .45rem .75rem;
    border-radius: 2px;
    transition: color .15s, background .15s;
    white-space: nowrap;
  }
  .ntw-nav-link:hover {
    color: #e8c84a;
    background: rgba(232,200,74,.06);
  }
  .ntw-nav-link--active {
    color: #e8c84a;
  }

  /* ── Hamburger ── */
  .ntw-hamburger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: .5rem;
    margin-right: -.5rem;
  }
  @media (min-width: 860px) {
    .ntw-hamburger { display: none; }
  }
  .ntw-hamburger-bar {
    display: block;
    width: 22px;
    height: 2px;
    background: #6a8a9e;
    border-radius: 2px;
    transition: background .15s, transform .2s, opacity .2s;
  }
  .ntw-hamburger[aria-expanded="true"] .ntw-hamburger-bar:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
    background: #e8c84a;
  }
  .ntw-hamburger[aria-expanded="true"] .ntw-hamburger-bar:nth-child(2) {
    opacity: 0;
  }
  .ntw-hamburger[aria-expanded="true"] .ntw-hamburger-bar:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
    background: #e8c84a;
  }

  /* ── Mobile menu ── */
  .ntw-mobile-menu {
    background: #0d151d;
    border-top: 1px solid #1c2e3e;
    overflow: hidden;
    max-height: 0;
    transition: max-height .28s ease;
  }
  .ntw-mobile-menu.is-open {
    max-height: 420px;
  }
  @media (min-width: 860px) {
    .ntw-mobile-menu { display: none; }
  }
  .ntw-mobile-nav {
    display: flex;
    flex-direction: column;
    padding: .5rem 1.5rem 1rem;
  }
  .ntw-mobile-link {
    font-family: 'IBM Plex Mono', monospace;
    font-size: .72rem;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #6a8a9e;
    text-decoration: none;
    padding: .75rem 0;
    border-bottom: 1px solid #1c2e3e;
    transition: color .15s;
  }
  .ntw-mobile-link:last-child { border-bottom: none; }
  .ntw-mobile-link:hover,
  .ntw-mobile-link.ntw-nav-link--active { color: #e8c84a; }
</style>`;
  }

  /* ============================================================
     FOOTER HTML
     Amazon Associates disclosure lives here — update once,
     applies to every page automatically.
  ============================================================ */
  function buildFooter() {
    const year = new Date().getFullYear();

    return `
<footer class="ntw-footer" role="contentinfo">
  <div class="ntw-footer-inner container">

    <!-- Brand column -->
    <div class="ntw-footer-brand">
      <a href="${base}index.html" class="ntw-footer-logo" aria-label="NuclearThreatWatch.org">
        <span style="font-family:'Oswald',sans-serif;font-size:.95rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">
          <span style="color:#fff;">NuclearThreat</span><span style="color:#c0392b;">Watch</span><span style="color:#6a8a9e;font-weight:400;">.org</span>
        </span>
      </a>
      <p class="ntw-footer-tagline">Free public radiation monitoring &amp; nuclear preparedness resources. Data sourced from <a href="https://www.epa.gov/radnet" target="_blank" rel="noopener">EPA RadNet</a>. Not an official government service.</p>

      <!-- Amazon Associates Disclosure — required, do not remove -->
      <p class="ntw-associates-disclosure">
        NuclearThreatWatch.org is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate we earn from qualifying purchases.
      </p>
    </div>

    <!-- Resources column -->
    <div class="ntw-footer-col">
      <p class="ntw-footer-col-heading">Resources</p>
      <a href="${base}resources.html" class="ntw-footer-link">All Guides</a>
      <a href="${base}resources/geiger-counter-guide.html" class="ntw-footer-link">Geiger Counter Guide</a>
      <a href="${base}resources/radiation-levels-101.html" class="ntw-footer-link">Radiation Levels 101</a>
      <a href="${base}resources/nuclear-emergency-checklist.html" class="ntw-footer-link">Emergency Checklist</a>
      <a href="${base}resources/potassium-iodide-guide.html" class="ntw-footer-link">Potassium Iodide Guide</a>
      <a href="${base}resources/shelter-in-place-7-10-rule.html" class="ntw-footer-link">Shelter-in-Place Guide</a>
      <a href="${base}resources/us-vs-russia-nuclear.html" class="ntw-footer-link">U.S. vs Russia Arsenal</a>
      <a href="${base}resources/us-vs-china-nuclear.html" class="ntw-footer-link">U.S. vs China Arsenal</a>
      <a href="${base}resources/us-vs-north-korea-nuclear.html" class="ntw-footer-link">U.S. vs North Korea</a>
    </div>

    <!-- Monitor column -->
    <div class="ntw-footer-col">
      <p class="ntw-footer-col-heading">Monitor</p>
      <a href="${base}index.html" class="ntw-footer-link">Live Radiation Map</a>
      <a href="${base}stations.html" class="ntw-footer-link">RadNet Stations</a>
      <a href="${base}pages/map.html" class="ntw-footer-link">Threat Map</a>
      <a href="${base}data.html" class="ntw-footer-link">Data &amp; Methodology</a>
      <a href="${base}methodology.html" class="ntw-footer-link">How We Monitor</a>
    </div>

    <!-- Legal column -->
    <div class="ntw-footer-col">
      <p class="ntw-footer-col-heading">Legal</p>
      <a href="${base}about.html" class="ntw-footer-link">About</a>
      <a href="${base}faq.html" class="ntw-footer-link">FAQ</a>
      <a href="${base}contact.html" class="ntw-footer-link">Contact</a>
      <a href="${base}disclaimer.html" class="ntw-footer-link">Disclaimer</a>
      <a href="${base}privacy.html" class="ntw-footer-link">Privacy Policy</a>
      <a href="${base}terms.html" class="ntw-footer-link">Terms of Service</a>
      <a href="${base}accessibility.html" class="ntw-footer-link">Accessibility</a>
    </div>

  </div>
</footer>

<style>
  /* ── Footer shell ── */
  .ntw-footer {
    background: #04080c;
    border-top: 2px solid #1c2e3e;
    padding: 3rem 0 2rem;
    margin-top: 0;
  }
  .ntw-footer-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  @media (min-width: 640px) {
    .ntw-footer-inner { grid-template-columns: 1fr 1fr; }
  }
  @media (min-width: 960px) {
    .ntw-footer-inner { grid-template-columns: 2fr 1fr 1fr 1fr; }
  }

  /* ── Brand column ── */
  .ntw-footer-brand { display: flex; flex-direction: column; gap: .85rem; }
  .ntw-footer-logo { text-decoration: none; }
  .ntw-footer-tagline {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: .82rem;
    line-height: 1.65;
    color: #2d4a5e;
    margin: 0;
  }
  .ntw-footer-tagline a {
    color: #3a6a8a;
    text-underline-offset: 2px;
  }

  /* ── Associates disclosure ── */
  .ntw-associates-disclosure {
    font-family: 'IBM Plex Mono', monospace;
    font-size: .58rem;
    line-height: 1.7;
    color: #1e3545;
    letter-spacing: .02em;
    border-top: 1px solid #0d1e2a;
    padding-top: .85rem;
    margin: 0;
  }

  /* ── Link columns ── */
  .ntw-footer-col {
    display: flex;
    flex-direction: column;
    gap: .1rem;
  }
  .ntw-footer-col-heading {
    font-family: 'IBM Plex Mono', monospace;
    font-size: .62rem;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: #e8c84a;
    margin: 0 0 .65rem;
    padding-bottom: .4rem;
    border-bottom: 1px solid #1c2e3e;
  }
  .ntw-footer-link {
    font-family: 'IBM Plex Mono', monospace;
    font-size: .65rem;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: #2d4a5e;
    text-decoration: none;
    padding: .28rem 0;
    transition: color .15s;
  }
  .ntw-footer-link:hover { color: #6a8a9e; }
</style>`;
  }

  /* ============================================================
     MOBILE MENU TOGGLE
  ============================================================ */
  function initMobileMenu() {
    const btn = document.querySelector('.ntw-hamburger');
    const menu = document.querySelector('.ntw-mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      const isOpen = menu.classList.contains('is-open');
      menu.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      menu.setAttribute('aria-hidden', String(isOpen));
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        btn.focus();
      }
    });
  }

  /* ============================================================
     INJECT — runs on DOMContentLoaded
  ============================================================ */
  function inject() {
    // Inject header
    const headerSlot = document.querySelector('[data-site-header]');
    if (headerSlot) {
      headerSlot.outerHTML = buildHeader();
    }

    // Inject footer
    const footerSlot = document.querySelector('[data-site-footer]');
    if (footerSlot) {
      footerSlot.outerHTML = buildFooter();
    }

    // Wire up mobile menu after injection
    initMobileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
