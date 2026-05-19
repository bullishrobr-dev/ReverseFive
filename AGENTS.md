# Yubari King — Agent Context

> **For coding agents:** Read this file at the start of every session. Update it when you change workflows, tech stack, or project conventions.

---

## Project Overview

**Yubari King Wrinkle Eraser** is a premium single-page product landing page for Zero Lines (Gibraltar). It sells a £300 non-injectable skin correction treatment by Hermetise Professional.

- **Target market:** International (16 languages)
- **Price point:** Premium (£300 GBP)
- **Brand identity:** Dark, luxurious, medical-aesthetic feel
- **Primary domain:** `zerolines.com` (Gibraltar-based)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Markup** | Vanilla HTML5 (single `index.html`) |
| **Styling** | Vanilla CSS (`css/style.css`) — no frameworks |
| **Scripting** | Vanilla JS (`js/app.js`) — no frameworks |
| **Animation** | GSAP + ScrollTrigger (CDN), Lenis smooth scroll (CDN) |
| **Backend (optional)** | Cloudflare Worker (`api/yubari-king-worker.js`) |
| **Forms** | Formspree (free tier) — **placeholders in code** |
| **Analytics** | Google Analytics 4 + Meta Pixel — **placeholders in code** |
| **Hosting** | TBD (likely GitHub Pages or Cloudflare Pages) |

**No build step.** This is a static site. Open `index.html` directly in a browser to preview.

---

## File Structure

```
├── index.html              # Main landing page (~1078 lines)
├── admin.html              # Promo code manager (localStorage-based admin panel)
├── css/style.css           # All styles (~4500+ lines)
├── js/app.js               # All logic (~4600+ lines)
├── api/yubari-king-worker.js   # Cloudflare Worker for server-side validation
├── SETUP.md                # Detailed setup guide for integrations
├── assets/                 # Images, logos, before/after photos
│   ├── yubari-king.PNG     # Product hero image
│   ├── zerolines-logo.png  # Brand logo
│   ├── lady.webp           # Face diagram for "Where to Apply"
│   ├── result1-6.png       # Edited before/after photos
│   ├── realresult1-6.png   # Unedited originals (click-to-toggle)
│   └── ...
```

---

## Key Architecture Decisions

### 1. No Frameworks
Keep it simple. No React, Vue, or build tools. Everything is vanilla HTML/CSS/JS. This keeps hosting simple and load times fast.

### 2. Translations Are Inline
All 16 language translations live inside `js/app.js` as a single `translations` object. There is lazy-load infrastructure but it's not currently used — inline is more reliable for a static site.

**Supported languages:** EN, ES, FR, DE, PT, DA, PL, RU, IT, NL, SV, JA, KO, ZH, AR (RTL), EL

### 3. Client-Side State (localStorage)
- Cart persistence: `yubariCart`
- Theme preference: `yubariTheme`
- Promo codes: `yubariPromoCodes` (shared between site and admin panel)
- Promo usage tracking: `yubariPromoUsage`
- Applied promo: `yubariPromo`
- Reviews (pending): `yubariPendingReviews`

### 4. Cart Is Frontend-Only
There is no real checkout. The "Checkout" button opens an alert with order summary + contact details (WhatsApp/email). Stripe integration is mentioned but not implemented.

### 5. Review System Is Client-Side
- Reviews submitted via modal are stored in `localStorage` as "pending"
- Hardcoded 5 reviews display on page load
- For production: Cloudflare Worker can store reviews in KV with moderation

### 6. Admin Panel Is Local
`admin.html` is a standalone page for creating/managing promo codes. It reads/writes the same `localStorage` keys as the main site. There is no authentication — it's meant to be used locally by the owner.

---

## Configuration Placeholders (Must Be Filled)

These are currently placeholder strings in `index.html`:

| Service | Placeholder | Location |
|---------|-------------|----------|
| Formspree Contact | `YOUR_FORM_ID` | Contact form action (~line 952) |
| Formspree Newsletter | `YOUR_NEWSLETTER_ID` | Newsletter form action (~line 999) |
| Google Analytics 4 | `GA_MEASUREMENT_ID` | `<script>` tag (~line 100) |
| Meta Pixel | `META_PIXEL_ID` | `<script>` tag (~line 109) |

See `SETUP.md` for detailed integration instructions.

---

## Design System

| Token | Value |
|-------|-------|
| Primary accent | `#0ABAB5` (turquoise) |
| Dark bg | `#0a0a0a` |
| Card bg | `#141414` |
| Text primary | `#f5f5f5` |
| Text secondary | `#a0a0a0` |
| Font display | `Playfair Display` (serif) |
| Font body | `Inter` (sans-serif) |

- Dark theme is default; light theme available via toggle
- Gradient orbs + canvas particle background in hero
- Scroll-reveal animations via GSAP
- Mobile sticky CTA bar (appears below hero on ≤768px)

---

## Accessibility Features

- `prefers-reduced-motion`: Disables ALL animations, canvas, orbs, loading screen
- RTL support for Arabic (`dir="rtl"` + CSS overrides)
- ARIA labels on interactive elements
- Lazy loading on below-fold images
- Noscript fallback for scroll reveals

---

## SEO

- JSON-LD structured data: Product schema, FAQPage schema, Organization schema
- Dynamic FAQ schema updates when language changes
- Meta description and Open Graph tags present

---

## Session History

### 2026-05-19 — Git Setup + AGENTS.md
- Initialized Git repository
- Created `.gitignore` (excludes `.DS_Store`, screenshots, backup HTML files)
- Pushed to `https://github.com/bullishrobr-dev/YubariKing.git`
- Created this `AGENTS.md`

---

## User Preferences

> **To be filled by the owner.** Agents should respect these preferences:

- [ ] **Simplicity over complexity** — prefer vanilla solutions over frameworks
- [ ] **Minimal dependencies** — avoid npm packages when possible
- [ ] **Mobile-first** — always test mobile layout
- [ ] **Performance** — keep bundle size low, use lazy loading
- [ ] **Accessibility** — maintain `prefers-reduced-motion` and RTL support

---

## Known Issues / TODO

1. **Checkout is not real** — Currently shows an alert with contact info. Needs Stripe or similar integration for real e-commerce.
2. **Promo codes are client-side** — Default codes (`SALE50`, `WELCOME`, `STAFF`) are hardcoded in `js/app.js`. Cloudflare Worker exists for server-side validation but frontend doesn't call it yet.
3. **Reviews are localStorage-only** — No backend persistence unless Cloudflare Worker is deployed and frontend is wired to it.
4. **Analytics placeholders** — GA4 and Meta Pixel IDs need to be replaced.
5. **Formspree placeholders** — Contact and newsletter forms won't submit until Formspree IDs are configured.
6. **Translation quality** — Some translations (JA, KO, ZH, AR, EL) were machine-translated and may need native speaker review.
7. **Admin panel has no auth** — Anyone with the URL can access `admin.html` and modify promo codes.

---

## Quick Commands

```bash
# Preview locally (macOS)
open index.html

# Or serve via Python
python3 -m http.server 8000

# Deploy Cloudflare Worker (when ready)
cd api
wrangler login
wrangler kv:namespace create "REVIEWS_KV"
wrangler deploy
```

---

## Contact

- **Owner:** bullishrobr-dev (GitHub)
- **Brand:** Zero Lines — info@zerolines.com — +350 5400 5198
- **Repo:** https://github.com/bullishrobr-dev/YubariKing.git
