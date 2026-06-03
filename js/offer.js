/**
 * Reverse Five — Custom Offer Landing Page
 * Reads offer data from URL ?d=base64 parameter and renders the offer.
 */

(function() {
    'use strict';

    const REGULAR_PRICE = 300;
    const WHATSAPP_NUMBER = '35054005198';

    // DOM refs
    const main = document.getElementById('offer-content');

    // Decode offer from URL
    function getOfferFromURL() {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('d');
        if (!encoded) return null;

        try {
            const json = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(json);
        } catch (e) {
            console.error('Failed to decode offer:', e);
            return null;
        }
    }

    // Format currency
    function formatPrice(amount) {
        return '€' + amount.toLocaleString('es-ES');
    }

    // Format countdown
    function formatCountdown(ms) {
        if (ms <= 0) return '00:00:00';
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return [hours, minutes, seconds]
            .map(v => String(v).padStart(2, '0'))
            .join(':');
    }

    // Gift product names (Spanish)
    const giftNames = {
        'day-cream': 'Crema de Día',
        'night-cream': 'Crema de Noche',
        'facial-serum': 'Sérum Facial',
        'eye-serum': 'Sérum de Ojos',
        'eye-cream': 'Contorno de Ojos',
        'facial-peel': 'Peeling Facial',
        'body-scrub': 'Exfoliante Corporal',
        'body-butter': 'Mantequilla Corporal',
        'nail-kit': 'Kit de Uñas',
        'facial-cleanser': 'Limpiador Facial',
    };

    // Gift icons (simple SVG paths)
    const giftIcons = {
        'day-cream': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>',
        'night-cream': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
        'facial-serum': '<path d="M12 2v20M2 12h20"/>',
        'eye-serum': '<circle cx="12" cy="12" r="4"/><path d="M2 12h4M18 12h4"/>',
        'eye-cream': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
        'facial-peel': '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/>',
        'body-scrub': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>',
        'body-butter': '<rect x="6" y="4" width="12" height="16" rx="2"/>',
        'nail-kit': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
        'facial-cleanser': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    };

    // Render active offer
    function renderOffer(offer) {
        const expiry = new Date(offer.expires);
        const now = new Date();
        const isExpired = now >= expiry;
        const totalRegular = REGULAR_PRICE * (offer.units || 1);
        const totalCustom = offer.price * (offer.units || 1);
        const savings = totalRegular - totalCustom;
        const gifts = offer.gifts || [];
        const customer = offer.customer || 'Usted';
        const seller = offer.seller || 'Su asesor';
        const note = offer.note || '';

        let html = '';

        if (isExpired) {
            html = renderExpired(offer);
        } else {
            html = renderActive(offer, expiry, totalRegular, totalCustom, savings, gifts, customer, seller, note);
        }

        main.innerHTML = html;

        if (!isExpired) {
            startCountdown(expiry);
        }
    }

    function renderActive(offer, expiry, totalRegular, totalCustom, savings, gifts, customer, seller, note) {
        const giftHTML = gifts.length > 0
            ? `<div class="offer-gifts">
                <h4>Regalos incluidos (${gifts.length})</h4>
                <div class="gift-grid">
                    ${gifts.map(g => `
                        <div class="gift-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${giftIcons[g] || '<circle cx="12" cy="12" r="10"/>'}</svg>
                            ${giftNames[g] || g}
                        </div>
                    `).join('')}
                </div>
               </div>`
            : '';

        const noteHTML = note
            ? `<div class="offer-note">"${note}"</div>`
            : '';

        const whatsappMsg = encodeURIComponent(
            `¡Hola! Recibí una oferta exclusiva para Reverse Five.` +
            `\n\nDetalles de la oferta:` +
            `\n- Precio: ${formatPrice(offer.price)}` +
            `\n- Unidades: ${offer.units || 1}` +
            (gifts.length > 0 ? `\n- Regalos: ${gifts.map(g => giftNames[g] || g).join(', ')}` : '') +
            `\n- Oferta expira: ${expiry.toLocaleString('es-ES')}` +
            `\n\nMi nombre es ${customer} y me gustaría reclamar esta oferta antes de que expire.`
        );

        const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

        return `
        <div class="offer-hero">
            <div class="container">
                <div class="offer-eyebrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Oferta Exclusiva
                </div>
                <h1 class="offer-title">Oferta Especial</h1>
                <p class="offer-customer">Preparada para ${customer}</p>
                <div class="countdown-timer" id="countdown">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <div>
                        <div class="countdown-label">Expira en</div>
                        <div class="countdown-digits" id="countdown-digits">--:--:--</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="offer-card">
                <div class="seller-info">
                    Oferta preparada por <strong>${seller}</strong>
                </div>
                <div class="offer-product">
                    <img src="assets/reverse-five.png" alt="Reverse Five Wrinkle Eraser">
                    <div class="offer-product-info">
                        <h3>Reverse Five Wrinkle Eraser</h3>
                        <p>${offer.units || 1} unidad${(offer.units || 1) > 1 ? 'es' : ''} · 100 tratamientos · 2 años</p>
                    </div>
                </div>
                <div class="offer-pricing">
                    <div class="price-row regular">
                        <span>Precio regular</span>
                        <span class="price-value">${formatPrice(totalRegular)}</span>
                    </div>
                    <div class="price-row your-price">
                        <span>Tu precio especial</span>
                        <span class="price-value">${formatPrice(totalCustom)}</span>
                    </div>
                    ${savings > 0 ? `
                    <div class="price-row savings">
                        <span>Ahorras</span>
                        <span class="price-value">${formatPrice(savings)}</span>
                    </div>
                    ` : ''}
                </div>
                ${giftHTML}
                ${noteHTML}
                <div class="offer-cta">
                    <a href="${whatsappURL}" class="btn-primary" target="_blank" rel="noopener">
                        Reclamar Oferta por WhatsApp
                    </a>
                    <a href="mailto:info@zerolines.life?subject=Oferta%20Reverse%20Five&body=${encodeURIComponent('Hola, me gustaría reclamar mi oferta para Reverse Five.')}" class="btn-secondary">
                        o escríbenos por email
                    </a>
                </div>
                <div class="qr-area visible" style="margin-top:0;border-top:1px solid var(--border-subtle);">
                    <h3>Escanea para reclamar</h3>
                    <div id="qrcode"></div>
                    <p class="qr-hint" style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">O visita este enlace desde tu móvil</p>
                </div>
            </div>
        </div>
        `;
    }

    function renderExpired(offer) {
        const customer = offer.customer || 'Usted';
        return `
        <div class="offer-expired">
            <div class="container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <h2>Esta oferta ha expirado</h2>
                <p>Lo sentimos ${customer}, esta oferta exclusiva ya no está disponible.</p>
                <a href="index.html" class="btn-primary">Ver producto oficial</a>
            </div>
        </div>
        `;
    }

    function startCountdown(expiry) {
        const digitsEl = document.getElementById('countdown-digits');
        const timerEl = document.getElementById('countdown');
        if (!digitsEl) return;

        function update() {
            const now = new Date();
            const remaining = expiry - now;

            if (remaining <= 0) {
                digitsEl.textContent = '00:00:00';
                // Reload page to show expired state
                setTimeout(() => location.reload(), 1500);
                return;
            }

            digitsEl.textContent = formatCountdown(remaining);

            // Urgent styling under 10 minutes
            if (remaining < 10 * 60 * 1000) {
                timerEl.classList.add('urgent');
            }

            requestAnimationFrame(() => {
                setTimeout(update, 1000);
            });
        }

        update();
    }

    // Initialize
    function init() {
        const offer = getOfferFromURL();
        if (!offer) {
            main.innerHTML = `
                <div class="offer-expired">
                    <div class="container">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <h2>Oferta no encontrada</h2>
                        <p>No se encontró información de oferta en este enlace.</p>
                        <a href="index.html" class="btn-primary">Ver producto oficial</a>
                    </div>
                </div>
            `;
            return;
        }

        renderOffer(offer);

        // Generate QR code for the current URL (so it appears in print)
        const qrcodeDiv = document.getElementById('qrcode');
        if (qrcodeDiv && typeof QRCode !== 'undefined') {
            qrcodeDiv.innerHTML = '';
            new QRCode(qrcodeDiv, {
                text: window.location.href,
                width: 100,
                height: 100,
                colorDark: '#0a0a0a',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M,
            });
        }
    }

    init();
})();
