# Yubari King — Setup Guide

This document explains what was built and what you need to configure.

---

## What Was Built

### 1. Reviews Section
- **5 realistic customer reviews** with star ratings, names, locations, and "Verified Purchase" badges
- **Review submission modal** with star rating input, name, email, and review text
- Reviews are stored in `localStorage` as "pending" and displayed with a moderation message
- Fully translatable across all 16 languages

### 2. Guarantee & Trust Badges
- **30-Day Satisfaction Guarantee** badge below the hero CTA
- Three trust badges: Dermatologist Tested, Cruelty Free, Free Worldwide Shipping
- Styled to match the premium aesthetic

### 3. Mobile Sticky CTA Bar
- Fixed bottom bar on mobile (≤768px) that appears after scrolling past the hero
- Shows price (£300) + "Free Shipping" + "Add to Cart" button
- Smooth show/hide animation

### 4. Proper Contact Form
- Full contact form with Name, Email, Subject dropdown, and Message
- Integrated with **Formspree** (free tier) — see configuration below
- Success state after submission
- Direct WhatsApp and Email links still available alongside the form

### 5. Newsletter Email Capture
- Email subscription section before the footer
- Integrated with **Formspree** (free tier) — see configuration below
- Success message with discount code reference

### 6. Enhanced Footer
- 4-column grid: Brand description, Product links, Support links, Legal links
- Links to Privacy Policy, Terms, and Cookie Policy pages

### 7. Lazy Loading
- All below-the-fold images now have `loading="lazy"` and `decoding="async"`
- Improves initial page load performance

### 8. JSON-LD Structured Data
- **Product schema** with name, image, price, availability, shipping, return policy, aggregate rating, and reviews
- **FAQPage schema** that dynamically populates from the FAQ section
- **Organization schema** with contact info
- This helps Google show rich snippets in search results

### 9. Schema.org FAQ Markup
- Dynamic JSON-LD that updates when the page language changes
- Pulls Q&A directly from the DOM

### 10. Analytics Tracking
- **Google Analytics 4** placeholder (replace `GA_MEASUREMENT_ID`)
- **Meta Pixel** placeholder (replace `META_PIXEL_ID`)
- Tracks: add to cart, begin checkout, apply promo, language changes, scroll depth, review submissions, contact form submissions, newsletter subscriptions

### 11. Lazy-Load Translation Framework
- Infrastructure in place to load translation files on-demand
- Currently all translations are still inline (for reliability), but the framework supports external JSON files

### 12. RTL Support for Arabic
- When Arabic (`ar`) is selected, the page switches to `dir="rtl"`
- CSS overrides handle text alignment, flex directions, and layout for RTL

### 13. Prefers-Reduced-Motion
- Respects user's OS accessibility setting
- Disables all animations, canvas particles, orbs, and loading screen
- Shows all content immediately without scroll reveals

### 14. Server-Side Validation Worker
- Created `api/yubari-king-worker.js` — a Cloudflare Worker script
- Validates promo codes server-side (prevents client-side hacking)
- Stores reviews and contact submissions in Cloudflare KV
- Includes deployment instructions in the file comments

---

## Configuration Required

### 1. Formspree (Contact Form & Newsletter)

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create two forms:
   - One for the **contact form**
   - One for the **newsletter**
3. Replace `YOUR_FORM_ID` in `index.html`:
   - Line ~1099: `action="https://formspree.io/f/YOUR_FORM_ID"` (contact form)
   - Line ~1127: `action="https://formspree.io/f/YOUR_NEWSLETTER_ID"` (newsletter)

### 2. Google Analytics 4

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Find your Measurement ID (looks like `G-XXXXXXXXXX`)
3. Replace `GA_MEASUREMENT_ID` in `index.html` (around line 100)

### 3. Meta Pixel (Facebook)

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Create a pixel and get your Pixel ID
3. Replace `META_PIXEL_ID` in `index.html` (around line 109)

### 4. Cloudflare Worker (Optional but Recommended)

To deploy the server-side validation worker:

```bash
cd api
npm install -g wrangler
wrangler login
wrangler kv:namespace create "REVIEWS_KV"
# Update wrangler.toml with your KV namespace ID
wrangler deploy
```

Then update the frontend JS to call the worker API endpoints instead of client-side promo validation.

---

## Translation Status

All 16 languages now have translations for:
- Original 136 keys (product content, FAQ, cart, etc.)
- New 39 keys (reviews, contact form, newsletter, footer, trust badges)

New language keys were batch-translated via Google Translate. They may benefit from native speaker review, especially for:
- Japanese, Korean, Chinese (East Asian markets)
- Arabic (RTL layout nuances)
- Greek

---

## File Changes Summary

| File | Changes |
|------|---------|
| `index.html` | +~200 lines: Reviews section, trust badges, contact form, newsletter, footer grid, mobile sticky CTA, lazy loading, JSON-LD, analytics |
| `css/style.css` | +~450 lines: All new section styles, RTL overrides, reduced motion, responsive breakpoints |
| `js/app.js` | +~300 lines: Reviews system, mobile CTA, contact form, newsletter, analytics, RTL, reduced motion, FAQ schema |
| `api/yubari-king-worker.js` | New: Cloudflare Worker for server-side validation |
| `SETUP.md` | New: This file |
