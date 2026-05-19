/**
 * Yubari King — Server-Side API Worker
 * Deploy to Cloudflare Workers
 * 
 * Endpoints:
 * POST /api/validate-promo   — Validate promo codes server-side
 * POST /api/submit-review    — Submit a review
 * POST /api/contact          — Forward contact form
 * GET  /api/reviews          — Get approved reviews
 */

// Server-side promo codes (these are the ONLY valid codes)
const VALID_PROMO_CODES = {
  'SALE50': { type: 'percent', value: 50, label: '50% OFF' },
  'WELCOME': { type: 'percent', value: 20, label: '20% OFF' },
  'STAFF': { type: 'percent', value: 30, label: '30% OFF' },
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/validate-promo' && request.method === 'POST') {
        return await handleValidatePromo(request);
      }
      
      if (path === '/api/submit-review' && request.method === 'POST') {
        return await handleSubmitReview(request, env);
      }
      
      if (path === '/api/reviews' && request.method === 'GET') {
        return await handleGetReviews(request, env);
      }
      
      if (path === '/api/contact' && request.method === 'POST') {
        return await handleContact(request, env);
      }

      return jsonResponse({ error: 'Not found' }, 404);
    } catch (err) {
      return jsonResponse({ error: 'Internal server error', message: err.message }, 500);
    }
  },
};

async function handleValidatePromo(request) {
  const body = await request.json();
  const code = (body.code || '').toUpperCase().trim();

  if (!code) {
    return jsonResponse({ valid: false, error: 'No code provided' }, 400);
  }

  const promo = VALID_PROMO_CODES[code];
  
  if (!promo) {
    return jsonResponse({ valid: false, error: 'Invalid promo code' }, 200);
  }

  return jsonResponse({
    valid: true,
    code: code,
    ...promo,
  });
}

async function handleSubmitReview(request, env) {
  const body = await request.json();
  
  // Validate required fields
  if (!body.name || !body.email || !body.rating || !body.text) {
    return jsonResponse({ error: 'Missing required fields' }, 400);
  }
  
  const rating = parseInt(body.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return jsonResponse({ error: 'Invalid rating' }, 400);
  }

  const review = {
    id: crypto.randomUUID(),
    name: sanitizeString(body.name),
    email: sanitizeString(body.email),
    rating: rating,
    text: sanitizeString(body.text),
    date: new Date().toISOString(),
    approved: false, // Reviews require moderation
  };

  // Store in KV (if configured)
  if (env.REVIEWS_KV) {
    const reviews = JSON.parse(await env.REVIEWS_KV.get('pending_reviews') || '[]');
    reviews.push(review);
    await env.REVIEWS_KV.put('pending_reviews', JSON.stringify(reviews));
  }

  // Send notification email (if configured)
  if (env.NOTIFICATION_EMAIL) {
    await sendNotificationEmail(env, 'New Review Pending Approval', `
Name: ${review.name}
Email: ${review.email}
Rating: ${review.rating}/5
Review: ${review.text}
    `);
  }

  return jsonResponse({
    success: true,
    message: 'Review submitted for moderation',
    reviewId: review.id,
  });
}

async function handleGetReviews(request, env) {
  // Return only approved reviews
  let reviews = [];
  
  if (env.REVIEWS_KV) {
    reviews = JSON.parse(await env.REVIEWS_KV.get('approved_reviews') || '[]');
  }

  // If no KV storage, return hardcoded reviews as fallback
  if (reviews.length === 0) {
    reviews = getDefaultReviews();
  }

  // Sort by date, newest first
  reviews.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Limit to 50 reviews
  reviews = reviews.slice(0, 50);

  return jsonResponse({ reviews });
}

async function handleContact(request, env) {
  const body = await request.json();

  if (!body.name || !body.email || !body.message) {
    return jsonResponse({ error: 'Missing required fields' }, 400);
  }

  const submission = {
    name: sanitizeString(body.name),
    email: sanitizeString(body.email),
    subject: sanitizeString(body.subject || 'General Inquiry'),
    message: sanitizeString(body.message),
    date: new Date().toISOString(),
  };

  // Store in KV (if configured)
  if (env.REVIEWS_KV) {
    const contacts = JSON.parse(await env.REVIEWS_KV.get('contact_submissions') || '[]');
    contacts.push(submission);
    await env.REVIEWS_KV.put('contact_submissions', JSON.stringify(contacts));
  }

  // Send notification email (if configured)
  if (env.NOTIFICATION_EMAIL) {
    await sendNotificationEmail(env, 'New Contact Form Submission', `
From: ${submission.name} <${submission.email}>
Subject: ${submission.subject}
Message: ${submission.message}
    `);
  }

  return jsonResponse({
    success: true,
    message: 'Message received. We will respond within 24 hours.',
  });
}

function getDefaultReviews() {
  return [
    {
      id: 'default-1',
      name: 'Sarah M.',
      email: '',
      rating: 5,
      text: "After 8 weeks of consistent use, the fine lines around my eyes are visibly softer. I was sceptical at first given the price, but the results speak for themselves. The weekly application fits perfectly into my routine.",
      date: '2026-03-15T00:00:00Z',
      approved: true,
    },
    {
      id: 'default-2',
      name: 'Elena K.',
      email: '',
      rating: 5,
      text: "I've tried countless serums and creams over the years. Yubari King is the only product that has delivered a noticeable, lasting difference. The protocol is easy to follow and I love that it's just once a week.",
      date: '2026-02-28T00:00:00Z',
      approved: true,
    },
    {
      id: 'default-3',
      name: 'Priya S.',
      email: '',
      rating: 4,
      text: "Really good product. The application is simple and I started seeing a difference in my forehead lines after about 6 weeks. My skin feels firmer and the texture is smoother. Will definitely repurchase.",
      date: '2026-02-10T00:00:00Z',
      approved: true,
    },
    {
      id: 'default-4',
      name: 'Margaret T.',
      email: '',
      rating: 5,
      text: "At 58, I had resigned myself to invasive procedures. This treatment has given me a genuine alternative. My skin looks firmer and the tone is more even. My daughter actually asked what I'd changed in my routine.",
      date: '2026-01-20T00:00:00Z',
      approved: true,
    },
    {
      id: 'default-5',
      name: 'Chloe R.',
      email: '',
      rating: 5,
      text: "Bought this for my mum and ended up stealing it within a month. The difference in her skin after 10 weeks was remarkable — she looks genuinely refreshed. Now we both use it and order together. It's become our Sunday ritual.",
      date: '2026-01-05T00:00:00Z',
      approved: true,
    },
  ];
}

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 2000);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

async function sendNotificationEmail(env, subject, body) {
  // If using SendGrid, Mailgun, or similar — add your integration here
  // This is a placeholder for email notification logic
  console.log(`[EMAIL] ${subject}\n${body}`);
}

/*
 * Deployment Instructions:
 * 
 * 1. Install Wrangler: npm install -g wrangler
 * 2. Authenticate: wrangler login
 * 3. Create KV namespace: wrangler kv:namespace create "REVIEWS_KV"
 * 4. Update wrangler.toml with your KV namespace ID
 * 5. Deploy: wrangler deploy
 * 
 * Required environment variables:
 * - NOTIFICATION_EMAIL: Email to receive notifications
 * 
 * wrangler.toml example:
 * name = "yubari-king-api"
 * main = "api/yubari-king-worker.js"
 * compatibility_date = "2024-01-01"
 * 
 * [[kv_namespaces]]
 * binding = "REVIEWS_KV"
 * id = "your-kv-namespace-id"
 */
