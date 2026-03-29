# A&E Lawn Care — Project Handoff

Use this doc when you switch projects and come back. It summarizes what was built, where things live, and how to run or extend the site.

---

## What this project is

A static **HTML/CSS/JS** website for **A&E Lawn Care** with:

- Branded homepage (logo, hero, about copy, continuous image showcase)
- Contact page with quote form
- Admin dashboard (hidden from public nav) backed by **Supabase** for storing quote submissions
- In-dashboard message translation (English/Spanish) via a public translation API

No React/Node build step — open files in a browser or serve with a simple static server.

---

## Quick start (local)

```bash
cd "/Users/onlynotice/Desktop/A&E Website"
python3 -m http.server 5500
```

Then open:

- Home: [http://localhost:5500/](http://localhost:5500/)
- Contact: [http://localhost:5500/contact.html](http://localhost:5500/contact.html)
- Admin: [http://localhost:5500/admin.html](http://localhost:5500/admin.html) (bookmark this; not linked in nav)

---

## File map

| File | Purpose |
|------|---------|
| `index.html` | Homepage: header, hero, about, project showcase (continuous scroll strip) |
| `styles.css` | Global styles, contact layout, admin/dashboard, showcase, call button |
| `script.js` | Year in footer, scroll-reveal sections, showcase marquee animation |
| `contact.html` | Quote form + contact sidebar with phone/email |
| `contact.js` | Submits form to Supabase `quotes` table |
| `admin.html` | Owner login + list of submissions |
| `admin.js` | Supabase auth, load/delete quotes, per-message translate buttons |
| `supabase-config.js` | **Your** Supabase URL + anon key (and optional admin email label) |
| `supabase-client.js` | Creates a single Supabase client from globals |
| `SUPABASE_SETUP.md` | SQL + RLS policies for `quotes` table |
| `assets/logo.png` | Site logo + favicon |
| `assets/showcase-*.png` | Showcase carousel images |
| `assets/service-area-map.jpg` | Map image (homepage map was removed; file kept for reuse) |
| `assets/sc-service-map*.png` | Alternate map screenshots (optional / future use) |

---

## Business details wired in

- **Phone:** (864) 612-1455 — `tel:+18646121455` where linked
- **Example email:** quotes@aelawncare.com
- **Homepage copy:** Rewritten bio covering lawn care, landscaping, tree removal, gravel, pool materials, small bridge / structural outdoor work, etc.

---

## Features implemented (chronological summary)

1. **Initial site** — Logo top-left, favicon, Home-focused page, Free Quote CTA.
2. **Contact page** — Separate `contact.html`, larger quote button from home, clean two-column layout, service **dropdown** (not free text), phone + email with SVG icons.
3. **Supabase** — Quote rows in `quotes` table; public insert; authenticated read/delete. Keys in `supabase-config.js`. Full SQL in `SUPABASE_SETUP.md`.
4. **Admin** — No “Admin” link in customer nav. Owners use direct URL `admin.html`. Email/password via Supabase Auth (user you create in dashboard).
5. **Translation** — Admin can translate each message **on page** (Spanish/English buttons); uses public `libretranslate.de` (fine for demos; for production consider a paid API + backend).
6. **Homepage polish** — Yellow “Call Us Now” text on green pill button; continuous horizontal showcase (duplicated cards + `requestAnimationFrame` scroll); scroll-reveal on sections.
7. **Map** — Interactive map was tried then **removed** from homepage per request. Map assets remain in `assets/` if you want to bring it back (Google Maps API or image + hotspots).

---

## Supabase — what you already did

- Created project, ran table + RLS + policies from `SUPABASE_SETUP.md`.
- Created an Auth user for owners.
- Pasted URL + anon key into `supabase-config.js`.

**Security note:** The `anon` key is meant to be public in front-end apps, but **never** commit the `service_role` key or put it in the website.

---

## If something breaks when you return

| Symptom | Check |
|---------|--------|
| Contact form: “Missing Supabase setup” | `supabase-config.js` has non-empty URL and anon key |
| Contact: insert error | Supabase policies allow `anon` INSERT on `quotes` |
| Admin: login fails | User exists under Authentication; email/password correct |
| Admin: empty list | Submit a test from `contact.html`; check Table Editor → `quotes` |
| Showcase not moving | `prefers-reduced-motion: reduce` in OS/browser disables animation |
| Showcase feels fast/slow | In `script.js`, change `speedPxPerSecond` near showcase logic |

---

## Suggested next steps (when you’re back)

- Re-add **service area**: Google Maps JavaScript API + polygon, or static image + pins (no API).
- **Email alerts** on new quote (Supabase Edge Function, or Resend/SendGrid with a small backend).
- Stricter admin: RLS policy so only **one** owner email can `SELECT`/`DELETE`.
- Deploy: **Vercel** (static) + same Supabase project; ensure `supabase-config.js` is deployed or use env at build time if you move to a bundler later.

---

## Related doc

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — database and policies

---

*Last aligned with repo state: handoff doc created for continuity between projects.*
