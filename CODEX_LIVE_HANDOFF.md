# A&E Lawn Care - Live Project Handoff (Codex)

Last updated: 2026-04-03

This file reflects the current live project structure and behavior for `https://www.aelawnpros.com`.

## Live Pages and Routes

- `/` -> `index.html`
- `/contact` (via navigation) -> `contact.html`
- `/services` (via navigation) -> `services.html`
- `/admin` -> rewritten to `admin.html` by `vercel.json`

## Core Frontend Files

- `index.html` - homepage, hero video, quote modal, service areas/map, project showcase
- `contact.html` - full quote/contact form page
- `services.html` - dedicated services page with alternating image/content rows
- `admin.html` - owner/admin dashboard page (auth + quote management)
- `styles.css` - global styling for all pages
- `script.js` - shared interactions (year, reveal animation, hero video startup, header fade)
- `contact.js` - quote form submission to Supabase (`quotes` table)
- `admin.js` - admin auth, quote list rendering, translation controls
- `where-we-work.js` - Leaflet map intro animation + city markers
- `us-states.js` - fills state dropdowns for both quote forms
- `vercel.json` - rewrite rule for `/admin` -> `/admin.html`

## Data / Backend Integration

- Supabase client setup:
  - `supabase-config.js`
  - `supabase-client.js`
- Quote form writes to `quotes` table with fields:
  - `name`, `email`, `phone`
  - `street_address`, `city`, `state`, `zip_code`
  - `customer_type`, `service`, `message`

## Current Business Contact Info (Live)

- Main phone: `(864) 473-9976`
- Secondary phone: `(864) 612-1455`
- Public email: `support@aelawnpros.com`

## Current Asset Set Used by Live UI

- Branding/favicon:
  - `assets/logo.png`
  - `assets/favicon-32x32.png`
- Hero/showcase media:
  - `assets/showcase-highlight-reel.mov`
  - `assets/showcase-sod-delivery.png`
  - `assets/showcase-sod-install.png`
  - `assets/showcase-walkway-stone.png`
  - `assets/showcase-timber-steps.png`
  - `assets/showcase-raised-bed.png`
  - `assets/showcase-drainage-pipe.png`
  - `assets/showcase-paver-stairs.png`
  - `assets/showcase-planting.png`
  - `assets/showcase-tree-1.png`

## Cleanup Applied

Removed non-live or unused files to keep this folder aligned with deployed behavior:

- `PROJECT_HANDOFF.md`
- `SUPABASE_SETUP.md`
- `assets/sc-service-map-clean.png`
- `assets/sc-service-map.png`
- `assets/service-area-map.jpg`
- `assets/showcase-flower.png`
- `assets/showcase-grass.png`
- `assets/showcase-tree-2.png`

## Notes for Next Codex Session

- Treat this directory as the source of truth for live page behavior.
- If changing routes, keep `vercel.json` rewrite rules in sync.
- If replacing video formats for performance, update both:
  - `<video><source ...></video>` tags in `index.html`
  - hero fallback background in `styles.css`.
