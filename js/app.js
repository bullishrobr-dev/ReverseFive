/**
 * ZERO LINES — REVERSE FIVE
 * Premium Interactive Experience
 */

// ============================================
// LOADING SCREEN
// ============================================
let heroTl;

// Loading screen handled by CSS animations

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.classList.add('hidden');
        // Trigger hero animations after loading
        if (heroTl) heroTl.play();
        if (typeof animateCollage === 'function') animateCollage();
    }
}

// Hide after load event + delay, or immediately if already loaded
if (document.readyState === 'complete') {
    setTimeout(hideLoadingScreen, 1800);
} else {
    window.addEventListener('load', () => setTimeout(hideLoadingScreen, 1800));
}

// Safety fallback: never stay stuck longer than 5 seconds
setTimeout(hideLoadingScreen, 5000);

// Extra iOS safety: force hide when tab becomes visible (handles backgrounded tabs)
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        setTimeout(hideLoadingScreen, 500);
    }
});

// ============================================
// THEME TOGGLE
// ============================================
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('reverseTheme') || 'light';

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('reverseTheme', theme);
}

// Apply saved theme immediately with no transition
if (savedTheme === 'light') {
    document.body.classList.add('no-transition');
    setTheme('light');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.remove('no-transition');
        });
    });
} else {
    setTheme('dark');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = document.body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    });
}

// ============================================
// SCROLL SPY — ACTIVE NAV
// ============================================
const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const navSections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    let current = '';
    const scrollPos = lenis ? lenis.scroll + 120 : window.scrollY + 120;
    
    navSections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollPos >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// ============================================
// LENIS SMOOTH SCROLL
// ============================================
let lenis = null;
const hasLenis = () => lenis !== null;
try {
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
});

// Integrate with GSAP ScrollTrigger (use GSAP ticker only — no double RAF)
if (lenis && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    }
    }
} catch (e) {
    console.warn('Lenis init failed:', e);
}

// ============================================
// CURSOR AMBIENT GLOW
// ============================================
(function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow || window.matchMedia('(pointer: coarse)').matches) {
        if (glow) glow.remove();
        return;
    }

    let mx = 0, my = 0, cx = 0, cy = 0;
    let rafId = null;
    let isActive = false;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (!isActive) {
            isActive = true;
            glow.classList.add('active');
        }
    });

    document.addEventListener('mouseleave', () => {
        glow.classList.remove('active');
        isActive = false;
    });

    function updateGlow() {
        if (!isActive) { rafId = null; return; }
        cx += (mx - cx) * 0.08;
        cy += (my - cy) * 0.08;
        glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
        rafId = requestAnimationFrame(updateGlow);
    }

    document.addEventListener('mousemove', () => {
        if (!rafId) rafId = requestAnimationFrame(updateGlow);
    }, { once: false });
})();

// ============================================
// MAGNETIC BUTTONS
// ============================================
(function initMagneticButtons() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .nav a, .footer-link');
    const radius = 60;

    buttons.forEach(btn => {
        btn.classList.add('magnetic-btn');
        let rafId = null;

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const dist = Math.sqrt(x * x + y * y);
            const strength = Math.max(0, 1 - dist / radius) * 0.35;

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            });
        });

        btn.addEventListener('mouseleave', () => {
            if (rafId) cancelAnimationFrame(rafId);
            btn.style.transform = '';
        });
    });
})();

// ============================================
// HEADER SCROLL BEHAVIOR
// ============================================
const header = document.getElementById('header');
let lastScrollY = 0;

if (hasLenis()) lenis.on('scroll', ({ scroll }) => {
    if (scroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    lastScrollY = scroll;
    updateActiveNav();
});

// ============================================
// MOBILE MENU
// ============================================
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    });
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            if (hasLenis()) lenis.scrollTo(target, { offset: -80 }); else target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ============================================
// HERO ANIMATIONS
// ============================================
const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

if (hasGSAP) {
    heroTl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    paused: true
});

heroTl
    .from('.eyebrow', { opacity: 0, y: 20, duration: 0.8 }, 0.2)
    .from('.hero-title', { opacity: 0, y: 40, duration: 1 }, 0.4)
    .from('.hero-slogan', { opacity: 0, y: 30, duration: 0.8 }, 0.6)
    .from('.hero-description', { opacity: 0, y: 20, duration: 0.8 }, 0.8)
    .from('.hero-cta', { opacity: 0, y: 20, duration: 0.8 }, 1)
    .from('.price-display', { opacity: 0, y: 15, duration: 0.6 }, 1.1)
    .from('.product-float', { opacity: 0, scale: 0.9, duration: 1.2 }, 0.6)
    .from('.scroll-indicator', { opacity: 0, duration: 1 }, 2.5);

// Collage photos fall animation
function animateCollage() {
    const photos = document.querySelectorAll('.collage-photo');
    
    photos.forEach((photo, i) => {
        gsap.to(photo, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: 1.8 + (i * 0.15),
            ease: 'bounce.out',
            onComplete: () => photo.classList.add('landed')
        });
    });
    
}
}

// ============================================
// PREMIUM SCROLL EXPERIENCE
// ============================================

const PX_EASE = 'power3.out';
const PX_DUR = 1.0;
const PX_STAGGER = 0.12;

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Refresh ScrollTrigger on resize / orientation change (critical for iOS)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            ScrollTrigger.refresh();
        }, 250);
    });

    // ── SCROLL PROGRESS BAR ──
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    gsap.to(progressBar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
    });

    // ── PARALLAX LAYERS ──
    // Background orbs drift slower than scroll
    gsap.to('.gradient-orbs', {
        y: -200,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true }
    });
    // Hero particles drift subtly
    gsap.to('#hero-canvas', {
        y: -100,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    // Product image gentle parallax
    gsap.to('.product-float', {
        y: -60,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // ── UTILITY: STAGGERED GRID REVEAL ──
    function revealGrid(containerSelector, itemSelector, fromVars, dur) {
        document.querySelectorAll(containerSelector).forEach(grid => {
            const items = grid.querySelectorAll(itemSelector);
            if (!items.length) return;
            // Immediately set hidden state so no flash
            gsap.set(items, fromVars);
            gsap.to(items, {
                opacity: 1, y: 0, x: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0%)',
                duration: dur || PX_DUR,
                ease: PX_EASE,
                stagger: PX_STAGGER,
                scrollTrigger: { trigger: grid, start: 'top 82%', toggleActions: 'play none none none' }
            });
        });
    }

    // ── SECTION HEADERS ──
    document.querySelectorAll('.section-header').forEach(header => {
        gsap.set(header, { opacity: 0, y: 50 });
        gsap.to(header, {
            opacity: 1, y: 0, duration: PX_DUR, ease: PX_EASE,
            scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' }
        });
    });

    // ── OVERVIEW: Feature Cards ──
    revealGrid('.feature-grid', '.feature-card', { opacity: 0, y: 70, scale: 0.9 });

    // ── WHAT IT IS: Benefit Items ──
    revealGrid('.benefits-grid', '.benefit-item', { opacity: 0, x: -50 });

    // ── RESULTS: Stat Cards ──
    revealGrid('.stats-grid', '.stat-card', { opacity: 0, y: 60, scale: 0.88 });
    // Photo gallery clip-path reveals
    document.querySelectorAll('.photo-item').forEach((item, i) => {
        gsap.set(item, { opacity: 0, clipPath: 'inset(100% 0 0 0)' });
        gsap.to(item, {
            opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: PX_EASE,
            scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play none none none' },
            delay: i * 0.08
        });
    });
    // Stats disclaimer
    gsap.set('.stats-disclaimer-box', { opacity: 0, y: 30 });
    gsap.to('.stats-disclaimer-box', {
        opacity: 1, y: 0, duration: 0.9, ease: PX_EASE,
        scrollTrigger: { trigger: '.stats-disclaimer-box', start: 'top 90%', toggleActions: 'play none none none' }
    });

    // ── HOW IT WORKS: Slide from sides ──
    gsap.set('.how-left', { opacity: 0, x: -80 });
    gsap.to('.how-left', {
        opacity: 1, x: 0, duration: PX_DUR, ease: PX_EASE,
        scrollTrigger: { trigger: '.how-left', start: 'top 82%', toggleActions: 'play none none none' }
    });
    gsap.set('.how-right', { opacity: 0, x: 80 });
    gsap.to('.how-right', {
        opacity: 1, x: 0, duration: PX_DUR, ease: PX_EASE,
        scrollTrigger: { trigger: '.how-right', start: 'top 82%', toggleActions: 'play none none none' }
    });

    // ── WHERE TO APPLY: Clip-path + slide ──
    gsap.set('.face-photo-wrapper', { opacity: 0, clipPath: 'inset(0 100% 0 0)' });
    gsap.to('.face-photo-wrapper', {
        opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 1.3, ease: PX_EASE,
        scrollTrigger: { trigger: '.face-photo-wrapper', start: 'top 80%', toggleActions: 'play none none none' }
    });
    gsap.set('.application-zones', { opacity: 0, x: 60 });
    gsap.to('.application-zones', {
        opacity: 1, x: 0, duration: PX_DUR, ease: PX_EASE,
        scrollTrigger: { trigger: '.application-zones', start: 'top 80%', toggleActions: 'play none none none' },
        delay: 0.2
    });

    // ── PROTOCOL: Steps + Summary ──
    revealGrid('.protocol-steps', '.protocol-step', { opacity: 0, y: 60, scale: 0.88 });
    gsap.set('.protocol-summary', { opacity: 0, y: 50, scale: 0.95 });
    gsap.to('.protocol-summary', {
        opacity: 1, y: 0, scale: 1, duration: PX_DUR, ease: PX_EASE,
        scrollTrigger: { trigger: '.protocol-summary', start: 'top 85%', toggleActions: 'play none none none' }
    });

    // ── IMPORTANT GUIDELINES: Panels slide in ──
    gsap.set('.guideline-panel.do', { opacity: 0, x: -60 });
    gsap.to('.guideline-panel.do', {
        opacity: 1, x: 0, duration: PX_DUR, ease: PX_EASE,
        scrollTrigger: { trigger: '.guideline-panel.do', start: 'top 82%', toggleActions: 'play none none none' }
    });
    gsap.set('.guideline-panel.avoid', { opacity: 0, x: 60 });
    gsap.to('.guideline-panel.avoid', {
        opacity: 1, x: 0, duration: PX_DUR, ease: PX_EASE,
        scrollTrigger: { trigger: '.guideline-panel.avoid', start: 'top 82%', toggleActions: 'play none none none' }
    });
    gsap.set('.warning-card', { opacity: 0, y: 40, scale: 0.94 });
    gsap.to('.warning-card', {
        opacity: 1, y: 0, scale: 1, duration: PX_DUR, ease: PX_EASE,
        scrollTrigger: { trigger: '.warning-card', start: 'top 88%', toggleActions: 'play none none none' }
    });

    // ── WHY IT'S DIFFERENT: Comparison cards ──
    revealGrid('.comparison-grid', '.comparison-card', { opacity: 0, y: 70, scale: 0.9 });

    // ── FAQ: Staggered fade-up ──
    revealGrid('.faq-list', '.faq-item', { opacity: 0, y: 40 });

    // ── REVIEWS: Summary + Cards ──
    gsap.set('.reviews-summary', { opacity: 0, y: 30 });
    gsap.to('.reviews-summary', {
        opacity: 1, y: 0, duration: 0.9, ease: PX_EASE,
        scrollTrigger: { trigger: '.reviews-summary', start: 'top 88%', toggleActions: 'play none none none' }
    });
    revealGrid('.reviews-grid', '.review-card', { opacity: 0, y: 70, scale: 0.9 });

    // ── CONTACT: Slide from sides ──
    gsap.set('.contact-info', { opacity: 0, x: -60 });
    gsap.to('.contact-info', {
        opacity: 1, x: 0, duration: PX_DUR, ease: PX_EASE,
        scrollTrigger: { trigger: '.contact-info', start: 'top 82%', toggleActions: 'play none none none' }
    });
    gsap.set('.contact-form-wrapper', { opacity: 0, x: 60 });
    gsap.to('.contact-form-wrapper', {
        opacity: 1, x: 0, duration: PX_DUR, ease: PX_EASE,
        scrollTrigger: { trigger: '.contact-form-wrapper', start: 'top 82%', toggleActions: 'play none none none' }
    });

    // ── NEWSLETTER & CTA: Scale up ──
    gsap.set('.newsletter-content', { opacity: 0, y: 50, scale: 0.94 });
    gsap.to('.newsletter-content', {
        opacity: 1, y: 0, scale: 1, duration: PX_DUR, ease: PX_EASE,
        scrollTrigger: { trigger: '.newsletter-content', start: 'top 88%', toggleActions: 'play none none none' }
    });
    gsap.set('.cta-content', { opacity: 0, y: 60, scale: 0.92 });
    gsap.to('.cta-content', {
        opacity: 1, y: 0, scale: 1, duration: 1.1, ease: PX_EASE,
        scrollTrigger: { trigger: '.cta-content', start: 'top 88%', toggleActions: 'play none none none' }
    });

} else {
    // Fallback: show all elements immediately
    document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.clipPath = 'none';
    });
}

// Stat bar animation
const statBars = document.querySelectorAll('.stat-bar-fill');
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    statBars.forEach(bar => {
        const width = bar.dataset.width;
        gsap.to(bar, {
        width: width + '%',
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: bar,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
    });
});
}

// ============================================
// CANVAS PARTICLE BACKGROUND
// ============================================
const canvas = document.getElementById('hero-canvas');

// Disable on touch/mobile devices for performance
if (canvas && window.matchMedia('(pointer: coarse)').matches) {
    canvas.style.display = 'none';
}

const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let animationId;

if (!canvas || !ctx) {

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.hue = Math.random() > 0.5 ? 178 : 45; // turquoise or gold
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity})`;
        ctx.fill();
    }
}

// Create particles
for (let i = 0; i < 60; i++) {
    particles.push(new Particle());
}

// Draw connections
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(10, 186, 181, ${0.05 * (1 - distance / 150)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    drawConnections();
    animationId = requestAnimationFrame(animateCanvas);
}

animateCanvas();

// Pause animation when not visible
const canvasObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (!animationId) animateCanvas();
        } else {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });
}, { threshold: 0 });

canvasObserver.observe(canvas);
}

// ============================================
// CART FUNCTIONALITY
// ============================================
const cartToggle = document.getElementById('cart-toggle');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartEmpty = document.getElementById('cart-empty');
const cartFooter = document.getElementById('cart-footer');
const cartCount = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

let cart = JSON.parse(localStorage.getItem('reverseCart')) || [];
let appliedPromo = JSON.parse(localStorage.getItem('reversePromo')) || null;

// Default promo codes - in production, these come from backend
const defaultPromoCodes = {
    'SALE50': { type: 'percent', value: 50, label: '50% OFF' },
    'WELCOME': { type: 'percent', value: 20, label: '20% OFF' },
    'STAFF': { type: 'percent', value: 30, label: '30% OFF' },
};

// Load promo codes from localStorage or use defaults
let promoCodes = JSON.parse(localStorage.getItem('reversePromoCodes')) || defaultPromoCodes;

function saveCart() {
    localStorage.setItem('reverseCart', JSON.stringify(cart));
}

function formatPrice(price) {
    return `€${price}`;
}

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    if (appliedPromo && promoCodes[appliedPromo.code]) {
        const promo = promoCodes[appliedPromo.code];
        if (promo.type === 'percent') {
            discount = Math.round(subtotal * (promo.value / 100));
        } else if (promo.type === 'fixed') {
            discount = Math.min(promo.value, subtotal);
        }
    }
    
    return { subtotal, discount, total: subtotal - discount };
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const { subtotal, discount, total } = calculateTotals();

    cartCount.textContent = totalItems;
    cartCount.classList.toggle('visible', totalItems > 0);

    if (cart.length === 0) {
        cartEmpty.style.display = 'flex';
        cartFooter.style.display = 'none';
    } else {
        cartEmpty.style.display = 'none';
        cartFooter.style.display = 'block';

        // Render cart items
        const itemsHTML = cart.map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <div class="cart-item-image">
                    <img src="assets/reverse-five.png" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn qty-minus" data-index="${index}">−</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn qty-plus" data-index="${index}">+</button>
                </div>
                <button class="cart-item-remove" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');

        // Insert after empty state
        const existingItems = cartItems.querySelectorAll('.cart-item');
        existingItems.forEach(el => el.remove());
        cartItems.insertAdjacentHTML('beforeend', itemsHTML);

        // Attach event listeners
        cartItems.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.index), -1));
        });
        cartItems.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.index), 1));
        });
        cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.index)));
        });
    }

    // Update totals display
    document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
    
    const discountRow = document.getElementById('cart-discount-row');
    if (discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('cart-discount').textContent = `-${formatPrice(discount)}`;
    } else {
        discountRow.style.display = 'none';
    }
    
    cartTotalEl.textContent = formatPrice(total);
}

function addToCart(product) {
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
        });
    }

    saveCart();
    updateCartUI();
    openCart();
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    showAppliedPromo();
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const product = {
            id: btn.dataset.product,
            name: btn.dataset.name,
            price: parseInt(btn.dataset.price),
        };
        addToCart(product);
    });
});

// Promo code
const promoInput = document.getElementById('promo-input');
const promoBtn = document.getElementById('promo-btn');
const promoMessage = document.getElementById('promo-message');

function applyPromoCode(code) {
    code = code.trim().toUpperCase();
    const promo = promoCodes[code];
    
    if (!promo) {
        promoMessage.textContent = 'Invalid promo code';
        promoMessage.className = 'promo-message error';
        appliedPromo = null;
        localStorage.removeItem('reversePromo');
        return false;
    }
    
    appliedPromo = { code, ...promo };
    localStorage.setItem('reversePromo', JSON.stringify(appliedPromo));
    promoMessage.textContent = `${promo.label} applied!`;
    promoMessage.className = 'promo-message success';
    return true;
}

promoBtn.addEventListener('click', () => {
    applyPromoCode(promoInput.value);
    updateCartUI();
});

promoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        applyPromoCode(promoInput.value);
        updateCartUI();
    }
});

// Show applied promo on open
function showAppliedPromo() {
    if (appliedPromo) {
        promoInput.value = appliedPromo.code;
        promoMessage.textContent = `${appliedPromo.label} applied!`;
        promoMessage.className = 'promo-message success';
    }
}

// Checkout button
checkoutBtn.addEventListener('click', () => {
    const { subtotal, discount, total } = calculateTotals();
    let message = `Order Summary:\n\n`;
    cart.forEach(item => {
        message += `${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity)}\n`;
    });
    message += `\nSubtotal: ${formatPrice(subtotal)}`;
    if (discount > 0) {
        message += `\nDiscount (${appliedPromo.code}): -${formatPrice(discount)}`;
    }
    message += `\nTotal: ${formatPrice(total)}\n\n`;
    message += `For now, please contact us to complete your purchase:\n`;
    message += `Email: info@zerolines.life\n`;
    message += `WhatsApp: +350 5400 5198`;
    
    alert(message);
});

// Initialize cart
updateCartUI();

// ============================================
// FAQ ACCORDION
// ============================================
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        const isActive = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.faq-item').forEach(faq => {
            faq.classList.remove('active');
            faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Open clicked if it wasn't active
        if (!isActive) {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
        }
    });
});

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
    en: {
        nav_overview: 'Overview',
        nav_what_it_is: 'What it is',
        nav_results: 'Results',
        nav_how_it_works: 'How it works',
        nav_protocol: 'Protocol',
        nav_faq: 'FAQ',
        nav_contact: 'Contact',
        hero_eyebrow: 'Opatra London',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Wrinkle Eraser',
        hero_description: 'Advanced Skin Correction Treatment. Non-injectable alternative to Botox.',
        hero_tag1: 'Once a week application',
        hero_tag2: 'Non-invasive · Non-painful',
        hero_tag3: '30 seconds to apply',
        hero_tag4: 'Dermatologist tested',
        hero_pill1: 'Non-Injectable',
        hero_pill2: 'Dermatologist Tested',
        hero_pill3: '100 Treatments',
        hero_pill4: 'GMP Certified',
        hero_cta_secondary: 'See how it works →',
        hero_guarantee: '30-Day Money-Back Guarantee',
        hero_price_week: 'Less than €3 per week',
        hero_price_treatments: '100 treatments',
        hero_price_supply: '2-year supply',
        add_to_cart: 'Add to Cart — €300',
        learn_more: 'Learn More',
        overview_heading: 'A different category of correction',
        overview_intro: 'Reverse Five is not a moisturizer masking fine lines with temporary hydration. It is a structured correction protocol designed to support visible refinement over time.',
        overview_card1_title: 'Structured protocol',
        overview_card1_body: 'A defined application system with clear timing, frequency, and duration parameters designed for consistent progressive refinement.',
        overview_card2_title: 'Needle free correction',
        overview_card2_body: 'External application with no injection required. Designed to support visible smoothing without breaking the skin barrier.',
        overview_card3_title: 'In addition to skincare',
        overview_card3_body: 'Not a replacement for your routine, but a complementary correction treatment that works alongside your existing regimen.',
        what_heading: 'What this product is designed to support',
        what_benefit1: 'Helps improve the look of expression lines, supporting a smoother appearance over time',
        what_benefit2: 'Designed to reduce the appearance of puffiness, particularly in the under-eye area',
        what_benefit3: 'Supports the improvement of visible firmness and skin tone',
        what_benefit4: 'Supports the skin\'s natural collagen activity without containing collagen itself',
        what_benefit5: 'Formulated for precision application to targeted areas of visible concern',
        what_benefit6: 'Suitable for use on sensitive skin with external-only application',
        stats_heading: 'Results & Statistics',
        stats_subtext: 'Visual improvements and results with consistent use',
        stats_wrinkle_headline: 'Reduction in visible wrinkles and fine lines',
        stats_wrinkle_subtext: 'With consistent weekly use',
        stats_eyelid_headline: 'Eyelid lift',
        stats_eyelid_subtext: 'May help reduce the appearance of puffiness and support upper eyelid appearance',
        stats_maintenance_headline: 'Results maintained',
        stats_maintenance_subtext: 'After completing the full protocol, results may be maintained long-term',
        stats_disclaimer: 'Individual results may vary. Some individuals may see maximum results as early as 4 weeks.',
        stats_photo_note: 'Photos have been lightly edited for a cleaner presentation. Click any photo to see the original.',
        view_original: 'View Original',
        view_edited: 'View Edited',
        how_heading: 'How it works',
        how_activation_heading: 'Activation mechanism',
        how_activation_p1: 'Reverse Five requires a minimum 5-hour activation window after application. During this period, the treatment interacts with your skin\'s natural processes. Do not wash or rub the treated areas during this activation window.',
        how_activation_p2: 'After the 5-hour minimum, you may continue with your normal skincare routine. The formulation is designed to work progressively with consistent weekly use.',
        how_ingredients_heading: 'Key ingredient system',
        how_ingredient1_title: 'Peptides',
        how_ingredient1_body: 'Support skin\'s structural refinement processes and help improve the visible appearance of firmness.',
        how_ingredient2_title: 'Hyaluronic Acid',
        how_ingredient2_body: 'Provides surface hydration support and helps maintain skin moisture balance during the correction process.',
        how_ingredient3_title: 'Stem Cell Complex',
        how_ingredient3_body: 'Designed to support the skin\'s natural renewal activity and visible refinement over time.',
        protocol_heading: 'Usage protocol',
        protocol_intro: 'Reverse Five follows a structured correction protocol with defined frequency, timing, and duration parameters. Consistency is the foundation of visible refinement.',
        protocol_step1_title: 'Weekly application',
        protocol_step1_body: 'Apply once per week to target areas. Do not exceed recommended frequency.',
        protocol_step2_title: 'Activation window',
        protocol_step2_body: 'Allow minimum 5 hours for activation. No washing or rubbing during this period.',
        protocol_step3_title: 'Consistency',
        protocol_step3_body: 'One syringe provides approximately 100 applications, designed to last two years with weekly use.',
        protocol_step4_title: 'Maintenance phase',
        protocol_step4_body: 'After completing the protocol, visible results may be maintained for 6–18 months.',
        protocol_summary_heading: 'Protocol Summary',
        protocol_row1_label: 'Frequency',
        protocol_row1_value: 'Once per week',
        protocol_row2_label: 'Activation',
        protocol_row2_value: 'Minimum 5 hours',
        protocol_row3_label: 'Applications',
        protocol_row3_value: '~100 per syringe',
        protocol_row4_label: 'Duration',
        protocol_row4_value: '~2 years of use',
        protocol_row5_label: 'Maintenance',
        protocol_row5_value: '6–18 months',
        important_heading: 'Important guidelines',
        important_intro: 'Follow these guidelines to ensure optimal conditions for the treatment protocol.',
        important_do_title: 'Do',
        important_do_item1: 'Apply to clean, dry skin',
        important_do_item2: 'Allow minimum 5-hour activation window',
        important_do_item3: 'Apply once per week only',
        important_do_item4: 'Use precision application to target areas',
        important_do_item5: 'Follow consistent weekly schedule',
        important_avoid_title: 'Avoid',
        important_avoid_item1: 'Washing face during activation window',
        important_avoid_item2: 'Rubbing or touching treated areas',
        important_avoid_item3: 'Exceeding once-weekly frequency',
        important_avoid_item4: 'Applying to deep nasolabial folds',
        important_avoid_item5: 'Internal use (external only)',
        important_card_title: 'External use only',
        important_card_body: 'Reverse Five is designed exclusively for external application. Do not ingest or apply to mucous membranes or broken skin. If irritation occurs, discontinue use and consult a healthcare professional.',
        why_heading: 'Why it\'s different',
        why_intro: 'Reverse Five represents a distinct approach to visible skin correction, structured as a protocol rather than a daily skincare product.',
        why_traditional_label: 'Traditional creams',
        why_traditional_heading: 'Surface hydration approach',
        why_traditional_item1: 'Primarily hydration-based',
        why_traditional_item2: 'Short-term plumping effect',
        why_traditional_item3: 'Daily application required',
        why_traditional_item4: 'Temporary visible improvement',
        why_traditional_item5: 'Results diminish quickly when stopped',
        why_botox_label: 'Botox® injections',
        why_botox_heading: 'Clinical neurotoxin approach',
        why_botox_item1: 'Injected directly into facial muscles',
        why_botox_item2: 'Freezes movement to smooth lines',
        why_botox_item3: 'Clinic visit required every 3–4 months',
        why_botox_item4: '€200–€400 per treatment session',
        why_botox_item5: 'Potential bruising, swelling, downtime',
        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Structured correction protocol',
        why_reverse_item1: 'Designed for progressive refinement',
        why_reverse_item2: 'Once-weekly application system',
        why_reverse_item3: 'Defined activation requirements',
        why_reverse_item4: 'Supports natural collagen activity',
        why_reverse_item5: 'Maintenance phase after protocol completion',
        why_reverse_item6: 'Non-injectable alternative approach',
        faq_heading: 'Frequently asked questions',
        faq_q1: 'Does it replace my skincare routine?',
        faq_a1: 'No. Reverse Five is a complementary correction treatment designed to work alongside your existing skincare routine. Continue using your regular cleansers, moisturizers, and serums. Apply Reverse Five once per week according to the protocol guidelines.',
        faq_q2: 'How often do I use it?',
        faq_a2: 'Once per week only. The protocol is designed for weekly application with a minimum 5-hour activation window. Do not exceed this frequency, as the treatment requires time to work with your skin\'s natural processes between applications.',
        faq_q3: 'When can I wash my face after applying?',
        faq_a3: 'Wait a minimum of 5 hours after application before washing your face. During this activation window, avoid washing or rubbing the treated areas. After 5 hours, you may resume your normal skincare routine.',
        faq_q4: 'Where should I not apply it?',
        faq_a4: 'Reverse Five is not intended for deep nasolabial folds. Focus application on expression lines in target areas: upper eyelid, under eyes, crow\'s feet, forehead lines, frown lines (11s), and upper and lower lip lines. Avoid application to broken skin or mucous membranes.',
        faq_q5: 'Is it suitable for sensitive skin?',
        faq_a5: 'Yes. Reverse Five is formulated to be suitable for sensitive skin with external-only application. If you experience any irritation, discontinue use and consult a healthcare professional.',
        faq_q6: 'How long does one syringe last?',
        faq_a6: 'One syringe provides approximately 100 applications. With the recommended once-weekly frequency, this is designed to last approximately two years of consistent use following the protocol.',
        faq_q7: 'What results timeline should I expect?',
        faq_a7: 'Reverse Five is designed as a progressive refinement protocol, not an instant solution. Visible results develop gradually over consistent weekly use. After completing the full protocol (approximately two years), results may be maintained for 6–18 months.',
        faq_q8: 'Can I combine with other products?',
        faq_a8: 'Yes, Reverse Five is designed to work alongside your existing skincare routine. However, during the 5-hour activation window, do not apply other products to treated areas. After activation, resume your normal product regimen.',
        cta_title: 'Experience the difference',
        cta_description: 'Start your structured correction protocol today. One syringe. Two years. Visible refinement.',
        cta_button: 'Add to Cart — €300',
        footer_note1: 'Informational product page • Zero Lines',
        footer_note2: 'Opatra London • Reverse Five Wrinkle Eraser',
        cart_title: 'Your Cart',
        cart_empty: 'Your cart is empty',
        cart_total: 'Total',
        checkout: 'Checkout',
        checkout_note: 'Secure payment via Stripe',
        reviews_heading: 'What Our Customers Say',
        reviews_subtext: 'Real experiences from real people. Join over 1,000 satisfied customers who have made Reverse Five part of their routine.',
        reviews_write_btn: 'Write a Review',
        reviews_modal_title: 'Share Your Experience',
        reviews_modal_desc: 'Your feedback helps others discover Reverse Five.',
        reviews_label_name: 'Your Name',
        reviews_label_email: 'Email',
        reviews_label_rating: 'Your Rating',
        reviews_label_text: 'Your Review',
        reviews_submit_btn: 'Submit Review',
        contact_title: 'Get in Touch',
        contact_desc: 'Have questions about Reverse Five? Our team is here to help. Whether you need guidance on the protocol, shipping information, or anything else — send us a message.',
        contact_whatsapp: 'WhatsApp Us<br><small>+350 5400 5198</small>',
        contact_email: 'Email Us<br><small>info@zerolines.life</small>',
        contact_label_name: 'Name',
        contact_label_email: 'Email',
        contact_label_subject: 'Subject',
        contact_subject_default: 'Select a topic',
        contact_subject_product: 'Product Question',
        contact_subject_shipping: 'Shipping & Delivery',
        contact_subject_protocol: 'Usage Protocol',
        contact_subject_order: 'Order Inquiry',
        contact_subject_other: 'Something Else',
        contact_label_message: 'Message',
        contact_send_btn: 'Send Message',
        contact_response_note: 'We typically respond within 24 hours.',
        newsletter_title: 'Join the Zero Lines Community',
        newsletter_desc: 'Get exclusive tips, early access to new products, and 10% off your first order.',
        newsletter_subscribe: 'Subscribe',
        newsletter_note: 'No spam. Unsubscribe anytime.',
        footer_desc: 'Advanced skin correction treatments designed for visible, lasting refinement.',
        footer_product: 'Product',
        footer_support: 'Support',
        footer_legal: 'Legal',
        mobile_sticky_shipping: 'Free Shipping',
        guarantee_text: '30-Day Satisfaction Guarantee',
        trust_dermatologist: 'Dermatologist Tested',
        trust_cruelty_free: 'Cruelty Free',
        trust_free_shipping: 'Free Worldwide Shipping',
        nav_where_to_apply: 'Where to apply',
        where_heading: 'Where to apply',
        where_intro: 'Reverse Five is designed for precision application to targeted areas showing visible signs of expression lines and volume changes.',
        zone_forehead: 'Forehead Lines',
        zone_forehead_desc: 'Horizontal expression lines across the forehead.',
        zone_frown: 'Frown Lines (11s)',
        zone_frown_desc: 'Vertical lines between the eyebrows.',
        zone_upper_eyelid: 'Upper Eyelid',
        zone_upper_eyelid_desc: 'Above the eye crease for visible firmness support.',
        zone_under_eye: 'Under Eye',
        zone_under_eye_desc: 'Below the lower lash line to target puffiness and lines.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'The outer corners of the eyes.',
        zone_upper_lip: 'Upper Lip',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Lower Lip',
        zone_lower_lip_desc: 'Below the lower lip line.',
        zone_not_intended: 'Not intended for deep nasolabial folds (the lines running from nose to mouth corners).',
        label_philosophy: 'The Philosophy',
        label_difference: 'The Difference',
        label_results: 'Clinical Results',
        label_approach: 'The Approach',
        label_experts: 'Trusted by Professionals',
        label_targets: 'What It Targets',
        label_mechanism: 'The Mechanism',
        label_areas: 'Target Areas',
        label_protocol: 'The Protocol',
        label_safety: 'Safety First',
        label_questions: 'Common Questions',
        label_reviews: 'Real People',
        philosophy_title: 'Activate Your Body. Let Nature Do the Rest.',
        philosophy_intro: 'Zero Lines was founded on a simple truth: your body already knows how to heal itself.',
        philosophy_card1_title: "Don't Mask. Correct.",
        philosophy_card1_body: 'Traditional creams flood your skin with external collagen and synthetic fillers. The effect vanishes the moment you stop. Reverse Five creates the conditions for your skin to correct itself.',
        philosophy_card2_title: "Signal, Don't Add.",
        philosophy_card2_body: "Our peptide complex signals your skin's fibroblasts to reactivate their natural collagen production cycle. We don't give you collagen. We teach your body to make it again.",
        philosophy_card3_title: 'Results That Last.',
        philosophy_card3_body: 'Because the correction comes from within, results are maintained 6–18 months after protocol completion. No daily dependency. No endless product cycles.',
        philosophy_card4_title: 'Two Years. One Syringe.',
        philosophy_card4_body: 'One weekly treatment. Five minutes of application. A 5-hour activation window. Sixty treatments per syringe. Structured, simple, and designed for real life.',
        experts_title: 'What the Experts Say',
        experts_intro: 'Leading dermatologists and aestheticians on the science behind peptide-based skin correction.',
        expert1_quote: "Among all the topical protocols I have evaluated, Reverse Five's peptide concentration and activation mechanism deliver the most consistent visible results. The 5-hour window allows for genuine cellular interaction rather than superficial coating.",
        expert1_stat_label: 'Patient Satisfaction',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Board-Certified Dermatologist<br>Harvard Medical School',
        expert2_quote: 'The peptide signalling approach is genuinely innovative. Rather than adding external collagen, it instructs the skin to resume its own production. My patients see measurable improvements in firmness and line depth within 8 to 12 weeks.',
        expert2_stat_label: 'Visible Improvement',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Aesthetic Medicine Specialist<br>Johns Hopkins Dermatology',
        expert3_quote: 'I recommend Reverse Five to clients who want real structural correction without needles. The hyaluronic acid maintains the moisture barrier while peptides do the heavy lifting. It is the closest thing to a clinical treatment you can use at home.',
        expert3_stat_label: 'Collagen Activation',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Lead Medical Aesthetician<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Consumer Creams',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Primarily surface hydration',
        checklist_creams_2: 'Short-term plumping effect',
        checklist_creams_3: 'Daily application required',
        checklist_creams_4: 'No clinical validation',
        checklist_creams_5: 'Results vanish when stopped',
        checklist_creams_6: 'No activation mechanism',
        checklist_reverse_1: 'Peptide activation protocol',
        checklist_reverse_2: 'Progressive structural correction',
        checklist_reverse_3: 'Once weekly — 5 min application',
        checklist_reverse_4: 'GMP-certified manufacturing',
        checklist_reverse_5: 'Results maintained 6–18 months',
        checklist_reverse_6: '5-hour cellular activation window',
    },
    fr: {
        nav_overview: 'Aperçu',
        nav_what_it_is: 'Qu\'est-ce que c\'est',
        nav_results: 'Résultats',
        nav_how_it_works: 'Comment ça marche',
        nav_protocol: 'Protocole',
        nav_faq: 'FAQ',
        nav_contact: 'Contact',
        hero_eyebrow: 'Opatra London',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Effaceur de Rides',
        hero_description: 'Traitement avancé de correction cutanée. Alternative non injectable au Botox.',
        hero_tag1: 'Application une fois par semaine',
        hero_tag2: 'Non-invasif · Non-douloureux',
        hero_tag3: '30 secondes à appliquer',
        hero_tag4: 'Testé dermatologiquement',
        hero_pill1: 'Non Injectable',
        hero_pill2: 'Testé par des Dermatologues',
        hero_pill3: '100 Traitements',
        hero_pill4: 'Certifié GMP',
        hero_cta_secondary: 'Voir comment ça marche →',
        hero_guarantee: 'Garantie de Remboursement 30 Jours',
        hero_price_week: 'Moins de €3 par semaine',
        hero_price_treatments: '100 traitements',
        hero_price_supply: 'Approvisionnement 2 ans',
        add_to_cart: 'Ajouter au Panier — €300',
        learn_more: 'En Savoir Plus',
        overview_heading: 'Une catégorie de correction différente',
        overview_intro: 'Reverse Five n\'est pas un hydratant qui masque les ridules avec une hydratation temporaire. C\'est un protocole de correction structuré conçu pour soutenir un affinement visible au fil du temps.',
        overview_card1_title: 'Protocole structuré',
        overview_card1_body: 'Un système d\'application défini avec des paramètres de timing, de fréquence et de durée clairs conçus pour un affinement progressif constant.',
        overview_card2_title: 'Correction sans aiguille',
        overview_card2_body: 'Application externe sans injection requise. Conçu pour soutenir un lissage visible sans briser la barrière cutanée.',
        overview_card3_title: 'En complément des soins',
        overview_card3_body: 'Pas un remplacement de votre routine, mais un traitement de correction complémentaire qui fonctionne aux côtés de votre régime existant.',
        what_heading: 'Ce que ce produit est conçu pour soutenir',
        what_benefit1: 'Aide à améliorer l\'aspect des ridules d\'expression, soutenant un aspect plus lisse au fil du temps',
        what_benefit2: 'Conçu pour réduire l\'aspect des poches, particulièrement dans la zone sous les yeux',
        what_benefit3: 'Soutient l\'amélioration de la fermeté visible et du teint',
        what_benefit4: 'Soutient l\'activité naturelle du collagène de la peau sans contenir de collagène',
        what_benefit5: 'Formulé pour une application de précision aux zones ciblées de préoccupation visible',
        what_benefit6: 'Convient aux peaux sensibles avec une application externe uniquement',
        stats_heading: 'Résultats & Statistiques',
        stats_subtext: 'Améliorations visuelles et résultats avec une utilisation constante',
        stats_wrinkle_headline: 'Réduction des rides et ridules visibles',
        stats_wrinkle_subtext: 'Avec une utilisation hebdomadaire constante',
        stats_eyelid_headline: 'Lifting des paupières',
        stats_eyelid_subtext: 'Peut aider à réduire l\'aspect des poches et soutenir l\'aspect de la paupière supérieure',
        stats_maintenance_headline: 'Résultats maintenus',
        stats_maintenance_subtext: 'Après avoir terminé le protocole complet, les résultats peuvent être maintenus à long terme',
        stats_disclaimer: 'Les résultats individuels peuvent varier. Certaines personnes peuvent voir des résultats maximums dès 4 semaines.',
        stats_photo_note: 'Les photos ont été légèrement retouchées pour une présentation plus soignée. Cliquez sur n\'importe quelle photo pour voir l\'original.',
        view_original: 'Voir l\'Original',
        view_edited: 'Voir l\'Édité',
        how_heading: 'Comment ça marche',
        how_activation_heading: 'Mécanisme d\'activation',
        how_activation_p1: 'Reverse Five nécessite une fenêtre d\'activation minimale de 5 heures après l\'application. Pendant cette période, le traitement interagit avec les processus naturels de votre peau. Ne lavez ni frottez les zones traitées pendant cette fenêtre d\'activation.',
        how_activation_p2: 'Après les 5 heures minimum, vous pouvez continuer votre routine de soins normale. La formulation est conçue pour fonctionner progressivement avec une utilisation hebdomadaire constante.',
        how_ingredients_heading: 'Système d\'ingrédients clés',
        how_ingredient1_title: 'Peptides',
        how_ingredient1_body: 'Soutiennent les processus de raffinement structurel de la peau et aident à améliorer l\'aspect visible de la fermeté.',
        how_ingredient2_title: 'Acide Hyaluronique',
        how_ingredient2_body: 'Fournit un support d\'hydratation de surface et aide à maintenir l\'équilibre de l\'humidité de la peau pendant le processus de correction.',
        how_ingredient3_title: 'Complexe de Cellules Souches',
        how_ingredient3_body: 'Conçu pour soutenir l\'activité de renouvellement naturel de la peau et l\'affinement visible au fil du temps.',
        protocol_heading: 'Protocole d\'utilisation',
        protocol_intro: 'Reverse Five suit un protocole de correction structuré avec des paramètres de fréquence, de timing et de durée définis. La cohérence est le fondement de l\'affinement visible.',
        protocol_step1_title: 'Application hebdomadaire',
        protocol_step1_body: 'Appliquez une fois par semaine sur les zones cibles. Ne dépassez pas la fréquence recommandée.',
        protocol_step2_title: 'Fenêtre d\'activation',
        protocol_step2_body: 'Laissez un minimum de 5 heures pour l\'activation. Pas de lavage ni de frottement pendant cette période.',
        protocol_step3_title: 'Cohérence',
        protocol_step3_body: 'Une seringue fournit environ 100 applications, conçues pour durer deux ans avec une utilisation hebdomadaire.',
        protocol_step4_title: 'Phase de maintenance',
        protocol_step4_body: 'Après avoir terminé le protocole, les résultats visibles peuvent être maintenus pendant 6 à 18 mois.',
        protocol_summary_heading: 'Résumé du Protocole',
        protocol_row1_label: 'Fréquence',
        protocol_row1_value: 'Une fois par semaine',
        protocol_row2_label: 'Activation',
        protocol_row2_value: 'Minimum 5 heures',
        protocol_row3_label: 'Applications',
        protocol_row3_value: '~100 par seringue',
        protocol_row4_label: 'Durée',
        protocol_row4_value: '~1 an d\'utilisation',
        protocol_row5_label: 'Maintenance',
        protocol_row5_value: '6–18 mois',
        important_heading: 'Directives importantes',
        important_intro: 'Suivez ces directives pour assurer des conditions optimales pour le protocole de traitement.',
        important_do_title: 'À Faire',
        important_do_item1: 'Appliquer sur une peau propre et sèche',
        important_do_item2: 'Laisser une fenêtre d\'activation minimale de 5 heures',
        important_do_item3: 'Appliquer une fois par semaine uniquement',
        important_do_item4: 'Utiliser une application de précision aux zones cibles',
        important_do_item5: 'Suivre un horaire hebdomadaire constant',
        important_avoid_title: 'À Éviter',
        important_avoid_item1: 'Se laver le visage pendant la fenêtre d\'activation',
        important_avoid_item2: 'Frotter ou toucher les zones traitées',
        important_avoid_item3: 'Dépasser la fréquence hebdomadaire',
        important_avoid_item4: 'Appliquer sur les plis nasogéniens profonds',
        important_avoid_item5: 'Usage interne (externe uniquement)',
        important_card_title: 'Usage externe uniquement',
        important_card_body: 'Reverse Five est conçu exclusivement pour une application externe. Ne pas ingérer ni appliquer sur les muqueuses ou la peau abîmée. En cas d\'irritation, cessez l\'utilisation et consultez un professionnel de santé.',
        why_heading: 'Pourquoi c\'est différent',
        why_intro: 'Reverse Five représente une approche distincte de la correction cutanée visible, structurée comme un protocole plutôt qu\'un produit de soins quotidien.',
        why_traditional_label: 'Crèmes traditionnelles',
        why_traditional_heading: 'Approche d\'hydratation de surface',
        why_traditional_item1: 'Principalement basée sur l\'hydratation',
        why_traditional_item2: 'Effet de repulpant à court terme',
        why_traditional_item3: 'Application quotidienne requise',
        why_traditional_item4: 'Amélioration visible temporaire',
        why_traditional_item5: 'Les résultats diminuent rapidement à l\'arrêt',
        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Protocole de correction structuré',
        why_reverse_item1: 'Conçu pour un affinement progressif',
        why_reverse_item2: 'Système d\'application hebdomadaire',
        why_reverse_item3: 'Exigences d\'activation définies',
        why_reverse_item4: 'Soutient l\'activité naturelle du collagène',
        why_reverse_item5: 'Phase de maintenance après accomplissement du protocole',
        why_reverse_item6: 'Approche alternative non injectable',
        faq_heading: 'Questions fréquemment posées',
        faq_q1: 'Remplace-t-il ma routine de soins?',
        faq_a1: 'Non. Reverse Five est un traitement de correction complémentaire conçu pour fonctionner aux côtés de votre routine de soins existante. Continuez à utiliser vos nettoyants, hydratants et sérums réguliers. Appliquez Reverse Five une fois par semaine selon les directives du protocole.',
        faq_q2: 'À quelle fréquence l\'utiliser?',
        faq_a2: 'Une fois par semaine uniquement. Le protocole est conçu pour une application hebdomadaire avec une fenêtre d\'activation minimale de 5 heures. Ne dépassez pas cette fréquence, car le traitement nécessite du temps pour agir avec les processus naturels de votre peau entre les applications.',
        faq_q3: 'Quand puis-je me laver le visage après l\'application?',
        faq_a3: 'Attendez un minimum de 5 heures après l\'application avant de vous laver le visage. Pendant cette fenêtre d\'activation, évitez de laver ou de frotter les zones traitées. Après 5 heures, vous pouvez reprendre votre routine de soins normale.',
        faq_q4: 'Où ne dois-je pas l\'appliquer?',
        faq_a4: 'Reverse Five n\'est pas destiné aux plis nasogéniens profonds. Concentrez l\'application sur les ridules d\'expression dans les zones cibles: paupière supérieure, sous les yeux, pattes d\'oie, rides du front, rides du lion (11), et ridules des lèvres supérieure et inférieure. Évitez l\'application sur la peau abîmée ou les muqueuses.',
        faq_q5: 'Convient-il aux peaux sensibles?',
        faq_a5: 'Oui. Reverse Five est formulé pour convenir aux peaux sensibles avec une application externe uniquement. Si vous ressentez une irritation, cessez l\'utilisation et consultez un professionnel de santé.',
        faq_q6: 'Combien de temps dure une seringue?',
        faq_a6: 'Une seringue fournit environ 100 applications. Avec la fréquence hebdomadaire recommandée, cela est conçu pour durer environ deux ans d\'utilisation constante selon le protocole.',
        faq_q7: 'Quel délai de résultats dois-je attendre?',
        faq_a7: 'Reverse Five est conçu comme un protocole d\'affinement progressif, pas une solution instantanée. Les résultats visibles se développent progressivement avec une utilisation hebdomadaire constante. Après avoir terminé le protocole complet (environ deux ans), les résultats peuvent être maintenus pendant 6 à 18 mois.',
        faq_q8: 'Puis-je le combiner avec d\'autres produits?',
        faq_a8: 'Oui, Reverse Five est conçu pour fonctionner aux côtés de votre routine de soins existante. Cependant, pendant la fenêtre d\'activation de 5 heures, n\'appliquez pas d\'autres produits sur les zones traitées. Après l\'activation, reprenez votre régime de produits normal.',
        cta_title: 'Faites l\'expérience de la différence',
        cta_description: 'Commencez votre protocole de correction structuré aujourd\'hui. Une seringue. Deux ans. Un affinement visible.',
        cta_button: 'Ajouter au Panier — €300',
        footer_note1: 'Page produit informative • Zero Lines',
        footer_note2: 'Opatra London • Reverse Five Wrinkle Eraser',
        cart_title: 'Votre Panier',
        cart_empty: 'Votre panier est vide',
        cart_total: 'Total',
        checkout: 'Payer',
        checkout_note: 'Paiement sécurisé via Stripe',
        reviews_heading: 'Ce que disent nos clients',
        reviews_subtext: 'De vraies expériences de vraies personnes. Rejoignez plus de 3 000 clients satisfaits qui ont intégré Reverse Five à leur routine.',
        reviews_write_btn: 'Écrire un avis',
        reviews_modal_title: 'Partagez votre expérience',
        reviews_modal_desc: 'Vos commentaires aident les autres à découvrir Reverse Five.',
        reviews_label_name: 'Votre nom',
        reviews_label_email: 'Courriel',
        reviews_label_rating: 'Votre note',
        reviews_label_text: 'Votre avis',
        reviews_submit_btn: 'Soumettre l\'avis',
        contact_title: 'Entrez en contact',
        contact_desc: 'Vous avez des questions sur le roi Reverse ? Notre équipe est là pour vous aider. Que vous ayez besoin de conseils sur le protocole, les informations d\'expédition ou toute autre chose, envoyez-nous un message.',
        contact_whatsapp: 'WhatsApp Nous<br><small>+350 5400 5198</small>',
        contact_email: 'Envoyez-nous un e-mail<br><small>info@zerolines.life</small>',
        contact_label_name: 'Nom',
        contact_label_email: 'Courriel',
        contact_label_subject: 'Sujet',
        contact_subject_default: 'Sélectionnez un sujet',
        contact_subject_product: 'Question produit',
        contact_subject_shipping: 'Expédition et livraison',
        contact_subject_protocol: 'Protocole d\'utilisation',
        contact_subject_order: 'Demande de commande',
        contact_subject_other: 'Autre chose',
        contact_label_message: 'Message',
        contact_send_btn: 'Envoyer un message',
        contact_response_note: 'Nous répondons généralement dans les 24 heures.',
        newsletter_title: 'Rejoignez la communauté Zero Lines',
        newsletter_desc: 'Bénéficiez de conseils exclusifs, d\'un accès anticipé aux nouveaux produits et de 10 % de réduction sur votre première commande.',
        newsletter_subscribe: 'Abonnez-vous',
        newsletter_note: 'Pas de spam. Désabonnez-vous à tout moment.',
        footer_desc: 'Traitements avancés de correction de la peau conçus pour un affinement visible et durable.',
        footer_product: 'Produit',
        footer_support: 'Assistance',
        footer_legal: 'Mentions légales',
        mobile_sticky_shipping: 'Livraison gratuite',
        guarantee_text: 'Garantie de satisfaction de 30 jours',
        trust_dermatologist: 'Testé par des dermatologues',
        trust_cruelty_free: 'Sans cruauté',
        trust_free_shipping: 'Livraison gratuite dans le monde entier',
        nav_where_to_apply: 'Zones d\'application',
        where_heading: 'Où postuler',
        where_intro: 'Reverse Five est conçu pour une application précise sur les zones ciblées présentant des signes visibles de rides d\'expression et de changements de volume.',
        zone_forehead: 'Lignes du front',
        zone_forehead_desc: 'Lignes d\'expression horizontales sur le front.',
        zone_frown: 'Rides de froncement de sourcils (11s)',
        zone_frown_desc: 'Lignes verticales entre les sourcils.',
        zone_upper_eyelid: 'Paupière supérieure',
        zone_upper_eyelid_desc: 'Au-dessus du pli des yeux pour un soutien visible de la fermeté.',
        zone_under_eye: 'Sous les yeux',
        zone_under_eye_desc: 'Sous la ligne des cils inférieurs pour cibler les poches et les rides.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'Les coins externes des yeux.',
        zone_upper_lip: 'Lèvre supérieure',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Lèvre inférieure',
        zone_lower_lip_desc: 'Sous la ligne de la lèvre inférieure.',
        zone_not_intended: 'Non destiné aux sillons nasogéniens profonds (les lignes allant du nez aux coins de la bouche).',

        label_philosophy: 'La Philosophie',
        label_difference: 'La Différence',
        label_results: 'Résultats Cliniques',
        label_approach: 'L\'Approche',
        label_experts: 'Recommandé par les Professionnels',
        label_targets: 'Ce que c\'est Cible',
        label_mechanism: 'Le Mécanisme',
        label_areas: 'Zones Cibles',
        label_protocol: 'Le Protocole',
        label_safety: 'La Sécurité d\'abord',
        label_questions: 'Questions Fréquentes',
        label_reviews: 'Des Personnes Réelles',
        philosophy_title: 'Activez Votre Corps. Laissez la Nature Faire le Reste.',
        philosophy_intro: 'Zero Lines repose sur une vérité simple : votre corps sait déjà se régénérer.',
        philosophy_card1_title: 'Ne Masquez Pas. Corrigez.',
        philosophy_card1_body: 'Les crèmes traditionnelles inondent votre peau de collagène externe et de synthétique. L\'effet s\'évanouit dès que vous arrêtez. Reverse Five crée les conditions pour que votre peau se corrige elle-même.',
        philosophy_card2_title: 'Signalez, N\'Ajoutez Pas.',
        philosophy_card2_body: 'Notre complexe peptidique signale aux fibroblastes de votre peau de réactiver leur cycle naturel de production de collagène. Nous ne vous donnons pas de collagène. Nous apprenons à votre corps à en produire à nouveau.',
        philosophy_card3_title: 'Des Résultats Durables.',
        philosophy_card3_body: 'Parce que la correction vient de l\'intérieur, les résultats se maintiennent 6 à 18 mois après la fin du protocole. Pas de dépendance quotidienne. Pas de cycles de produits sans fin.',
        philosophy_card4_title: 'Deux Ans. Une Seringue.',
        philosophy_card4_body: 'Un traitement hebdomadaire. Cinq minutes d\'application. Une fenêtre d\'activation de 5 heures. Soixante traitements par seringue. Structuré, simple et conçu pour la vraie vie.',
        experts_title: 'Ce que Disent les Experts',
        experts_intro: 'Des dermatologues et esthéticiennes de renom sur la science de la correction cutanée par peptides.',
        expert1_quote: 'Parmi tous les protocoles topiques que j\'ai évalués, la concentration en peptides et le mécanisme d\'activation de Reverse Five offrent les résultats visibles les plus constants. La fenêtre de 5 heures permet une véritable interaction cellulaire plutôt qu\'un simple enrobage superficiel.',
        expert1_stat_label: 'Satisfaction des Patients',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Dermatologue Diplômée<br>Harvard Medical School',
        expert2_quote: 'L\'approche par signalisation peptidique est véritablement innovante. Plutôt que d\'ajouter du collagène externe, elle demande à la peau de reprendre sa propre production. Mes patients constatent des améliorations mesurables de fermeté et de profondeur des ridules en 8 à 12 semaines.',
        expert2_stat_label: 'Amélioration Visible',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Spécialiste en Médecine Esthétique<br>Johns Hopkins Dermatology',
        expert3_quote: 'Je recommande Reverse Five aux clients qui veulent une véritable correction structurelle sans aiguilles. L\'acide hyaluronique maintient la barrière d\'hydratation tandis que les peptides font le gros du travail. C\'est le traitement le plus proche d\'une approche clinique que l\'on puisse utiliser à domicile.',
        expert3_stat_label: 'Activation du Collagène',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Esthéticienne Médicale Principale<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Crèmes Grand Public',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Hydratation superficielle principalement',
        checklist_creams_2: 'Effet repulpant à court terme',
        checklist_creams_3: 'Application quotidienne requise',
        checklist_creams_4: 'Aucune validation clinique',
        checklist_creams_5: 'Les résultats disparaissent à l\'arrêt',
        checklist_creams_6: 'Aucun mécanisme d\'activation',
        checklist_reverse_1: 'Protocole d\'activation par peptides',
        checklist_reverse_2: 'Correction structurelle progressive',
        checklist_reverse_3: 'Une fois par semaine — 5 min d\'application',
        checklist_reverse_4: 'Fabrication certifiée GMP',
        checklist_reverse_5: 'Résultats maintenus 6 à 18 mois',
        checklist_reverse_6: 'Fenêtre d\'activation cellulaire de 5 heures',
    },
    de: {
        nav_overview: 'Übersicht',
        nav_what_it_is: 'Was es ist',
        nav_results: 'Ergebnisse',
        nav_how_it_works: 'Wie es funktioniert',
        nav_protocol: 'Protokoll',
        nav_faq: 'FAQ',
        nav_contact: 'Kontakt',
        hero_eyebrow: 'Opatra London',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Faltenradierer',
        hero_description: 'Fortschrittliche Hautkorrekturbehandlung. Nicht-injizierbare Alternative zu Botox.',
        hero_tag1: 'Einmal pro Woche Anwendung',
        hero_tag2: 'Nicht-invasiv · Schmerzfrei',
        hero_tag3: '30 Sekunden zum Auftragen',
        hero_tag4: 'Dermatologisch getestet',
        hero_pill1: 'Nicht-Injizierbar',
        hero_pill2: 'Dermatologisch Getestet',
        hero_pill3: '100 Behandlungen',
        hero_pill4: 'GMP-Zertifiziert',
        hero_cta_secondary: 'Sehen Sie, wie es funktioniert →',
        hero_guarantee: '30-Tage Geld-Zurück-Garantie',
        hero_price_week: 'Weniger als €3 pro Woche',
        hero_price_treatments: '100 Behandlungen',
        hero_price_supply: '2-Jahres-Vorrat',
        add_to_cart: 'In den Warenkorb — €300',
        learn_more: 'Mehr Erfahren',
        overview_heading: 'Eine andere Kategorie der Korrektur',
        overview_intro: 'Reverse Five ist keine Feuchtigkeitscreme, die feine Linien mit temporärer Hydration maskiert. Es ist ein strukturiertes Korrekturprotokoll, das darauf ausgelegt ist, sichtbare Verfeinerung im Laufe der Zeit zu unterstützen.',
        overview_card1_title: 'Strukturiertes Protokoll',
        overview_card1_body: 'Ein definiertes Anwendungssystem mit klaren Timing-, Frequenz- und Dauerparametern für konsistente progressive Verfeinerung.',
        overview_card2_title: 'Nadelfreie Korrektur',
        overview_card2_body: 'Externe Anwendung ohne Injektion. Entwickelt, um sichtbares Glätten zu unterstützen, ohne die Hautbarriere zu durchbrechen.',
        overview_card3_title: 'Zusätzlich zur Hautpflege',
        overview_card3_body: 'Kein Ersatz für Ihre Routine, sondern eine ergänzende Korrekturbehandlung, die neben Ihrem bestehenden Regime funktioniert.',
        what_heading: 'Wofür dieses Produkt entwickelt wurde',
        what_benefit1: 'Hilft, das Aussehen von Ausdruckslinien zu verbessern und unterstützt ein glatteres Erscheinungsbild im Laufe der Zeit',
        what_benefit2: 'Entwickelt, um das Erscheinungsbild von Schwellungen zu reduzieren, besonders im Augenbereich',
        what_benefit3: 'Unterstützt die Verbesserung der sichtbaren Festigkeit und des Hauttons',
        what_benefit4: 'Unterstützt die natürliche Kollagenaktivität der Haut, ohne selbst Kollagen zu enthalten',
        what_benefit5: 'Formuliert für präzise Anwendung auf gezielte Bereiche sichtbarer Anliegen',
        what_benefit6: 'Geeignet für empfindliche Haut mit ausschließlich externer Anwendung',
        stats_heading: 'Ergebnisse & Statistiken',
        stats_subtext: 'Sichtbare Verbesserungen und Ergebnisse bei konsequenter Anwendung',
        stats_wrinkle_headline: 'Reduktion sichtbarer Falten und feiner Linien',
        stats_wrinkle_subtext: 'Bei konsequenter wöchentlicher Anwendung',
        stats_eyelid_headline: 'Augenlidstraffung',
        stats_eyelid_subtext: 'Kann helfen, das Erscheinungsbild von Schwellungen zu reduzieren und das obere Augenlid zu unterstützen',
        stats_maintenance_headline: 'Ergebnisse erhalten',
        stats_maintenance_subtext: 'Nach Abschluss des vollständigen Protokolls können die Ergebnisse langfristig erhalten bleiben',
        stats_disclaimer: 'Individuelle Ergebnisse können variieren. Einige Personen können maximale Ergebnisse bereits nach 4 Wochen sehen.',
        stats_photo_note: 'Die Fotos wurden leicht bearbeitet, um eine sauberere Präsentation zu ermöglichen. Klicken Sie auf ein beliebiges Foto, um das Original zu sehen.',
        view_original: 'Original Ansehen',
        view_edited: 'Bearbeitet Ansehen',
        how_heading: 'Wie es funktioniert',
        how_activation_heading: 'Aktivierungsmechanismus',
        how_activation_p1: 'Reverse Five erfordert ein Mindestaktivierungsfenster von 5 Stunden nach der Anwendung. Während dieses Zeitraums interagiert die Behandlung mit den natürlichen Prozessen Ihrer Haut. Waschen oder reiben Sie die behandelten Bereiche während dieses Aktivierungsfensters nicht.',
        how_activation_p2: 'Nach den Mindest 5 Stunden können Sie mit Ihrer normalen Hautpflegeroutine fortfahren. Die Formulierung ist darauf ausgelegt, progressiv mit konsequenter wöchentlicher Anwendung zu wirken.',
        how_ingredients_heading: 'Wichtiges Inhaltsstoffsystem',
        how_ingredient1_title: 'Peptide',
        how_ingredient1_body: 'Unterstützen die strukturellen Verfeinerungsprozesse der Haut und helfen, das sichtbare Erscheinungsbild der Festigkeit zu verbessern.',
        how_ingredient2_title: 'Hyaluronsäure',
        how_ingredient2_body: 'Bietet Oberflächenhydratation und hilft, das Feuchtigkeitsgleichgewicht der Haut während des Korrekturprozesses aufrechtzuerhalten.',
        how_ingredient3_title: 'Stammzellkomplex',
        how_ingredient3_body: 'Entwickelt, um die natürliche Erneuerungsaktivität der Haut und sichtbare Verfeinerung im Laufe der Zeit zu unterstützen.',
        protocol_heading: 'Anwendungsprotokoll',
        protocol_intro: 'Reverse Five folgt einem strukturierten Korrekturprotokoll mit definierten Frequenz-, Zeit- und Dauerparametern. Konsistenz ist die Grundlage sichtbarer Verfeinerung.',
        protocol_step1_title: 'Wöchentliche Anwendung',
        protocol_step1_body: 'Einmal pro Woche auf Zielbereiche auftragen. Die empfohlene Frequenz nicht überschreiten.',
        protocol_step2_title: 'Aktivierungsfenster',
        protocol_step2_body: 'Mindestens 5 Stunden für die Aktivierung einplanen. Während dieses Zeitraums nicht waschen oder reiben.',
        protocol_step3_title: 'Konsistenz',
        protocol_step3_body: 'Eine Spritze bietet ca. 100 Anwendungen, entwickelt für zwei Jahre bei wöchentlicher Anwendung.',
        protocol_step4_title: 'Wartungsphase',
        protocol_step4_body: 'Nach Abschluss des Protokolls können sichtbare Ergebnisse für 6–18 Monate erhalten bleiben.',
        protocol_summary_heading: 'Protokollzusammenfassung',
        protocol_row1_label: 'Frequenz',
        protocol_row1_value: 'Einmal pro Woche',
        protocol_row2_label: 'Aktivierung',
        protocol_row2_value: 'Mindestens 5 Stunden',
        protocol_row3_label: 'Anwendungen',
        protocol_row3_value: '~100 pro Spritze',
        protocol_row4_label: 'Dauer',
        protocol_row4_value: '~2 Jahre Nutzung',
        protocol_row5_label: 'Wartung',
        protocol_row5_value: '6–18 Monate',
        important_heading: 'Wichtige Richtlinien',
        important_intro: 'Befolgen Sie diese Richtlinien, um optimale Bedingungen für das Behandlungsprotokoll sicherzustellen.',
        important_do_title: 'Zu Tun',
        important_do_item1: 'Auf saubere, trockene Haut auftragen',
        important_do_item2: 'Mindestens 5-stündiges Aktivierungsfenster einhalten',
        important_do_item3: 'Nur einmal pro Woche auftragen',
        important_do_item4: 'Präzise Anwendung auf Zielbereiche',
        important_do_item5: 'Konsequenten wöchentlichen Zeitplan einhalten',
        important_avoid_title: 'Vermeiden',
        important_avoid_item1: 'Gesicht waschen während des Aktivierungsfensters',
        important_avoid_item2: 'Reiben oder Berühren der behandelten Bereiche',
        important_avoid_item3: 'Überschreiten der wöchentlichen Frequenz',
        important_avoid_item4: 'Auf tiefe Nasolabialfalten auftragen',
        important_avoid_item5: 'Interne Anwendung (nur extern)',
        important_card_title: 'Nur für externe Anwendung',
        important_card_body: 'Reverse Five ist ausschließlich für die externe Anwendung bestimmt. Nicht einnehmen oder auf Schleimhäute oder verletzte Haut auftragen. Bei Reizungen die Anwendung einstellen und einen Arzt konsultieren.',
        why_heading: 'Warum es anders ist',
        why_intro: 'Reverse Five repräsentiert einen unterschiedlichen Ansatz zur sichtbaren Hautkorrektur, strukturiert als Protokoll und nicht als tägliches Hautpflegeprodukt.',
        why_traditional_label: 'Traditionelle Cremes',
        why_traditional_heading: 'Oberflächlicher Hydratationsansatz',
        why_traditional_item1: 'Hauptsächlich hydrationsbasiert',
        why_traditional_item2: 'Kurzfristiger Auffülleffekt',
        why_traditional_item3: 'Tägliche Anwendung erforderlich',
        why_traditional_item4: 'Temporäre sichtbare Verbesserung',
        why_traditional_item5: 'Ergebnisse lassen schnell nach beim Absetzen',
        why_botox_label: 'Botox®-Injektionen',
        why_botox_heading: 'Klinischer Neurotoxin-Ansatz',
        why_botox_item1: 'Direkt in die Gesichtsmuskeln injiziert',
        why_botox_item2: 'Bewegungen einfrieren zur Glättung von Linien',
        why_botox_item3: 'Klinikbesuch alle 3–4 Monate erforderlich',
        why_botox_item4: '€200–€400 pro Behandlungssitzung',
        why_botox_item5: 'Mögliche Blutergüsse, Schwellungen, Ausfallzeit',

        why_botox_label: 'Injections de Botox®',
        why_botox_heading: 'Approche neurotoxine clinique',
        why_botox_item1: 'Injecté directement dans les muscles faciaux',
        why_botox_item2: 'Gèle le mouvement pour lisser les rides',
        why_botox_item3: 'Visite clinique requise tous les 3–4 mois',
        why_botox_item4: '€200–€400 par séance de traitement',
        why_botox_item5: 'Risque de bleus, gonflement, temps de récupération',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Strukturiertes Korrekturprotokoll',
        why_reverse_item1: 'Für progressive Verfeinerung entwickelt',
        why_reverse_item2: 'Wöchentliches Anwendungssystem',
        why_reverse_item3: 'Definierte Aktivierungsanforderungen',
        why_reverse_item4: 'Unterstützt natürliche Kollagenaktivität',
        why_reverse_item5: 'Wartungsphase nach Protokollabschluss',
        why_reverse_item6: 'Nicht-injizierbarer alternativer Ansatz',
        faq_heading: 'Häufig gestellte Fragen',
        faq_q1: 'Ersetzt es meine Hautpflegeroutine?',
        faq_a1: 'Nein. Reverse Five ist eine ergänzende Korrekturbehandlung, die neben Ihrer bestehenden Hautpflegeroutine funktionieren soll. Fahren Sie mit Ihren regulären Reinigern, Feuchtigkeitscremes und Seren fort. Tragen Sie Reverse Five einmal pro Woche gemäß den Protokollrichtlinien auf.',
        faq_q2: 'Wie oft verwende ich es?',
        faq_a2: 'Nur einmal pro Woche. Das Protokoll ist für wöchentliche Anwendung mit einem Mindestaktivierungsfenster von 5 Stunden ausgelegt. Überschreiten Sie diese Frequenz nicht, da die Behandlung Zeit benötigt, um mit den natürlichen Prozessen Ihrer Haut zwischen den Anwendungen zu arbeiten.',
        faq_q3: 'Wann kann ich mir nach dem Auftragen das Gesicht waschen?',
        faq_a3: 'Warten Sie mindestens 5 Stunden nach der Anwendung, bevor Sie sich das Gesicht waschen. Vermeiden Sie während dieses Aktivierungsfensters das Waschen oder Reiben der behandelten Bereiche. Nach 5 Stunden können Sie Ihre normale Hautpflegeroutine fortsetzen.',
        faq_q4: 'Wo sollte ich es nicht auftragen?',
        faq_a4: 'Reverse Five ist nicht für tiefe Nasolabialfalten bestimmt. Konzentrieren Sie die Anwendung auf Ausdruckslinien in Zielbereichen: oberes Augenlid, unter den Augen, Krähenfüße, Stirnfalten, Zornesfalten (11er) und Ober- und Unterlippenfalten. Vermeiden Sie die Anwendung auf verletzter Haut oder Schleimhäuten.',
        faq_q5: 'Ist es für empfindliche Haut geeignet?',
        faq_a5: 'Ja. Reverse Five ist formuliert, um für empfindliche Haut mit ausschließlich externer Anwendung geeignet zu sein. Bei Irritationen brechen Sie die Anwendung ab und konsultieren Sie einen Arzt.',
        faq_q6: 'Wie lange hält eine Spritze?',
        faq_a6: 'Eine Spritze bietet ca. 100 Anwendungen. Bei der empfohlenen wöchentlichen Frequenz ist sie für ca. zwei Jahre konsequenter Nutzung nach dem Protokoll ausgelegt.',
        faq_q7: 'Welchen Ergebniszeitplan sollte ich erwarten?',
        faq_a7: 'Reverse Five ist als progressives Verfeinerungsprotokoll konzipiert, nicht als sofortige Lösung. Sichtbare Ergebnisse entwickeln sich allmählich bei konsequenter wöchentlicher Anwendung. Nach Abschluss des vollständigen Protokolls (ca. zwei Jahre) können Ergebnisse für 6–18 Monate erhalten bleiben.',
        faq_q8: 'Kann ich es mit anderen Produkten kombinieren?',
        faq_a8: 'Ja, Reverse Five ist entwickelt, um neben Ihrer bestehenden Hautpflegeroutine zu funktionieren. Während des 5-stündigen Aktivierungsfensters jedoch keine anderen Produkte auf behandelte Bereiche auftragen. Nach der Aktivierung fahren Sie mit Ihrem normalen Produktregime fort.',
        cta_title: 'Erleben Sie den Unterschied',
        cta_description: 'Beginnen Sie noch heute mit Ihrem strukturierten Korrekturprotokoll. Eine Spritze. Zwei Jahre. Sichtbare Verfeinerung.',
        cta_button: 'In den Warenkorb — €300',
        footer_note1: 'Informationelle Produktseite • Zero Lines',
        footer_note2: 'Opatra London • Reverse Five Wrinkle Eraser',
        cart_title: 'Ihr Warenkorb',
        cart_empty: 'Ihr Warenkorb ist leer',
        cart_total: 'Gesamt',
        checkout: 'Zur Kasse',
        checkout_note: 'Sichere Zahlung via Stripe',
        reviews_heading: 'Was unsere Kunden sagen',
        reviews_subtext: 'Echte Erlebnisse von echten Menschen. Schließen Sie sich über 3.000 zufriedenen Kunden an, die Reverse Five zu einem Teil ihrer Routine gemacht haben.',
        reviews_write_btn: 'Schreiben Sie eine Rezension',
        reviews_modal_title: 'Teilen Sie Ihre Erfahrungen',
        reviews_modal_desc: 'Ihr Feedback hilft anderen, Reverse Five zu entdecken.',
        reviews_label_name: 'Ihr Name',
        reviews_label_email: 'E-Mail',
        reviews_label_rating: 'Ihre Bewertung',
        reviews_label_text: 'Ihre Bewertung',
        reviews_submit_btn: 'Bewertung abgeben',
        contact_title: 'Kontaktieren Sie uns',
        contact_desc: 'Haben Sie Fragen zu Reverse Five? Unser Team ist für Sie da. Egal, ob Sie Anleitung zum Protokoll, Versandinformationen oder etwas anderes benötigen – senden Sie uns eine Nachricht.',
        contact_whatsapp: 'WhatsApp uns<br><small>+350 5400 5198</small>',
        contact_email: 'Schicken Sie uns eine E-Mail<br><small>info@zerolines.life</small>',
        contact_label_name: 'Name',
        contact_label_email: 'E-Mail',
        contact_label_subject: 'Betreff',
        contact_subject_default: 'Wählen Sie ein Thema',
        contact_subject_product: 'Produktfrage',
        contact_subject_shipping: 'Versand & Lieferung',
        contact_subject_protocol: 'Nutzungsprotokoll',
        contact_subject_order: 'Bestellanfrage',
        contact_subject_other: 'Etwas anderes',
        contact_label_message: 'Nachricht',
        contact_send_btn: 'Nachricht senden',
        contact_response_note: 'Wir antworten in der Regel innerhalb von 24 Stunden.',
        newsletter_title: 'Treten Sie der Zero Lines Community bei',
        newsletter_desc: 'Erhalten Sie exklusive Tipps, frühen Zugang zu neuen Produkten und 10 % Rabatt auf Ihre erste Bestellung.',
        newsletter_subscribe: 'Abonnieren',
        newsletter_note: 'Kein Spam. Abmelden jederzeit möglich.',
        footer_desc: 'Fortschrittliche Hautkorrekturbehandlungen für eine sichtbare, dauerhafte Verfeinerung.',
        footer_product: 'Produkt',
        footer_support: 'Unterstützen Sie',
        footer_legal: 'Rechtlich',
        mobile_sticky_shipping: 'Kostenloser Versand',
        guarantee_text: '30-Tage-Zufriedenheitsgarantie',
        trust_dermatologist: 'Dermatologisch getestet',
        trust_cruelty_free: 'Frei von Grausamkeiten',
        trust_free_shipping: 'Kostenloser weltweiter Versand',
        nav_where_to_apply: 'Anwendungsbereiche',
        where_heading: 'Wo man sich bewerben kann',
        where_intro: 'Reverse Five ist für die präzise Anwendung auf gezielte Bereiche konzipiert, die sichtbare Anzeichen von Mimikfalten und Volumenveränderungen aufweisen.',
        zone_forehead: 'Stirnfalten',
        zone_forehead_desc: 'Horizontale Mimikfalten auf der Stirn.',
        zone_frown: 'Zornesfalten (11s)',
        zone_frown_desc: 'Vertikale Linien zwischen den Augenbrauen.',
        zone_upper_eyelid: 'Oberes Augenlid',
        zone_upper_eyelid_desc: 'Oberhalb der Augenfalte für sichtbare Festigkeitsunterstützung.',
        zone_under_eye: 'Unter Auge',
        zone_under_eye_desc: 'Unterhalb des unteren Wimpernkranzes auftragen, um Schwellungen und Linien zu bekämpfen.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'Die äußeren Augenwinkel.',
        zone_upper_lip: 'Oberlippe',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Unterlippe',
        zone_lower_lip_desc: 'Unterhalb der Unterlippenlinie.',
        zone_not_intended: 'Nicht für tiefe Nasolabialfalten (die Linien, die von der Nase bis zu den Mundwinkeln verlaufen) geeignet.',

        label_philosophy: 'Die Philosophie',
        label_difference: 'Der Unterschied',
        label_results: 'Klinische Ergebnisse',
        label_approach: 'Der Ansatz',
        label_experts: 'Von Fachleuten Vertraut',
        label_targets: 'Was es Anspricht',
        label_mechanism: 'Der Mechanismus',
        label_areas: 'Zielbereiche',
        label_protocol: 'Das Protokoll',
        label_safety: 'Sicherheit Zuerst',
        label_questions: 'Häufige Fragen',
        label_reviews: 'Echte Menschen',
        philosophy_title: 'Aktivieren Sie Ihren Körper. Lassen Sie die Natur den Rest erledigen.',
        philosophy_intro: 'Zero Lines basiert auf einer einfachen Wahrheit: Ihr Körper weiß bereits, wie er sich selbst heilt.',
        philosophy_card1_title: 'Nicht Maskieren. Korrigieren.',
        philosophy_card1_body: 'Traditionelle Cremes überfluten Ihre Haut mit externem Kollagen und synthetischen Füllstoffen. Die Wirkung verschwindet, sobald Sie aufhören. Reverse Five schafft die Bedingungen dafür, dass sich Ihre Haut selbst korrigiert.',
        philosophy_card2_title: 'Signalisieren, Nicht Zuführen.',
        philosophy_card2_body: 'Unser Peptidkomplex signalisiert den Fibroblasten Ihrer Haut, ihren natürlichen Kollagenproduktionszyklus wieder zu aktivieren. Wir geben Ihnen kein Kollagen. Wir bringen Ihrem Körper bei, es wieder selbst herzustellen.',
        philosophy_card3_title: 'Ergebnisse, die Bleiben.',
        philosophy_card3_body: 'Da die Korrektur von innen kommt, halten sich die Ergebnisse 6 bis 18 Monate nach Abschluss des Protokolls. Keine tägliche Abhängigkeit. Keine endlosen Produktzyklen.',
        philosophy_card4_title: 'Zwei Jahre. Eine Spritze.',
        philosophy_card4_body: 'Eine wöchentliche Behandlung. Fünf Minuten Auftrag. Ein 5-stündiges Aktivierungsfenster. Sechzig Anwendungen pro Spritze. Strukturiert, einfach und für das echte Leben konzipiert.',
        experts_title: 'Was die Experten Sagen',
        experts_intro: 'Führende Dermatologen und Ästhetiker zur Wissenschaft hinter der hautkorrigierenden Peptidbehandlung.',
        expert1_quote: 'Von allen topischen Protokollen, die ich bewertet habe, liefern die Peptidkonzentration und der Aktivierungsmechanismus von Reverse Five die konsistentesten sichtbaren Ergebnisse. Das 5-Stunden-Fenster ermöglicht eine echte zelluläre Interaktion statt einer oberflächlichen Beschichtung.',
        expert1_stat_label: 'Patientenzufriedenheit',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Fachärztin für Dermatologie<br>Harvard Medical School',
        expert2_quote: 'Der Peptid-Signalansatz ist wirklich innovativ. Statt externes Kollagen zuzuführen, weist er die Haut an, die eigene Produktion wieder aufzunehmen. Meine Patienten sehen messbare Verbesserungen bei Festigkeit und Linienfältigkeit innerhalb von 8 bis 12 Wochen.',
        expert2_stat_label: 'Sichtbare Verbesserung',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Spezialist für Ästhetische Medizin<br>Johns Hopkins Dermatology',
        expert3_quote: 'Ich empfehle Reverse Five Klienten, die eine echte strukturelle Korrektur ohne Nadeln wünschen. Die Hyaluronsäure erhält die Feuchtigkeitsbarriere, während die Peptide die Hauptarbeit leisten. Es ist das dem klinischen Behandlung nächste, was Sie zu Hause anwenden können.',
        expert3_stat_label: 'Kollagenaktivierung',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Leitende Medizinische Ästhetikerin<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Verbrauchercremes',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Hauptsächlich oberflächliche Hydratation',
        checklist_creams_2: 'Kurzfristiger Aufpolsterungseffekt',
        checklist_creams_3: 'Tägliche Anwendung erforderlich',
        checklist_creams_4: 'Keine klinische Validierung',
        checklist_creams_5: 'Ergebnisse verschwinden beim Absetzen',
        checklist_creams_6: 'Kein Aktivierungsmechanismus',
        checklist_reverse_1: 'Peptid-Aktivierungsprotokoll',
        checklist_reverse_2: 'Progressive strukturelle Korrektur',
        checklist_reverse_3: 'Einmal wöchentlich — 5 Min Auftrag',
        checklist_reverse_4: 'GMP-zertifizierte Herstellung',
        checklist_reverse_5: 'Ergebnisse gehalten 6–18 Monate',
        checklist_reverse_6: '5-stündiges zelluläres Aktivierungsfenster',
    },
    es: {
        nav_overview: 'Resumen',
        nav_what_it_is: 'Qué es',
        nav_results: 'Resultados',
        nav_how_it_works: 'Cómo funciona',
        nav_protocol: 'Protocolo',
        nav_faq: 'FAQ',
        nav_contact: 'Contacto',
        hero_eyebrow: 'Opatra London',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Borrador de Arrugas',
        hero_description: 'Tratamiento Avanzado de Corrección Cutánea. Alternativa no inyectable al Botox.',
        hero_tag1: 'Aplicación una vez por semana',
        hero_tag2: 'No invasivo · Sin dolor',
        hero_tag3: '30 segundos para aplicar',
        hero_tag4: 'Testado dermatológicamente',
        hero_pill1: 'No Inyectable',
        hero_pill2: 'Testado por Dermatólogos',
        hero_pill3: '100 Tratamientos',
        hero_pill4: 'Certificado GMP',
        hero_cta_secondary: 'Ver cómo funciona →',
        hero_guarantee: 'Garantía de Devolución de 30 Días',
        hero_price_week: 'Menos de €3 por semana',
        hero_price_treatments: '100 tratamientos',
        hero_price_supply: 'Suministro de 2 años',
        add_to_cart: 'Añadir al Carrito — €300',
        learn_more: 'Saber Más',
        overview_heading: 'Una categoría diferente de corrección',
        overview_intro: 'Reverse Five no es una hidratante que enmascare las líneas finas con hidratación temporal. Es un protocolo de corrección estructurado diseñado para apoyar el refinamiento visible con el tiempo.',
        overview_card1_title: 'Protocolo estructurado',
        overview_card1_body: 'Un sistema de aplicación definido con parámetros claros de tiempo, frecuencia y duración diseñados para un refinamiento progresivo consistente.',
        overview_card2_title: 'Corrección sin agujas',
        overview_card2_body: 'Aplicación externa sin inyección requerida. Diseñado para apoyar el alisado visible sin romper la barrera cutánea.',
        overview_card3_title: 'Además del cuidado de la piel',
        overview_card3_body: 'No es un reemplazo de tu rutina, sino un tratamiento de corrección complementario que funciona junto con tu régimen existente.',
        what_heading: 'Lo que este producto está diseñado para apoyar',
        what_benefit1: 'Ayuda a mejorar el aspecto de las líneas de expresión, apoyando una apariencia más suave con el tiempo',
        what_benefit2: 'Diseñado para reducir la apariencia de la hinchazón, particularmente en el área debajo de los ojos',
        what_benefit3: 'Apoya la mejora de la firmeza visible y el tono de la piel',
        what_benefit4: 'Apoya la actividad natural de colágeno de la piel sin contener colágeno',
        what_benefit5: 'Formulado para aplicación de precisión a áreas objetivo de preocupación visible',
        what_benefit6: 'Adecuado para uso en piel sensible con aplicación externa únicamente',
        stats_heading: 'Resultados & Estadísticas',
        stats_subtext: 'Mejoras visuales y resultados con uso constante',
        stats_wrinkle_headline: 'Reducción de arrugas y líneas finas visibles',
        stats_wrinkle_subtext: 'Con uso semanal constante',
        stats_eyelid_headline: 'Elevación del párpado',
        stats_eyelid_subtext: 'Puede ayudar a reducir la apariencia de hinchazón y apoyar la apariencia del párpado superior',
        stats_maintenance_headline: 'Resultados mantenidos',
        stats_maintenance_subtext: 'Después de completar el protocolo completo, los resultados pueden mantenerse a largo plazo',
        stats_disclaimer: 'Los resultados individuales pueden variar. Algunas personas pueden ver resultados máximos tan pronto como 4 semanas.',
        stats_photo_note: 'Las fotos han sido ligeramente editadas para una presentación más limpia. Haz clic en cualquier foto para ver la original.',
        view_original: 'Ver Original',
        view_edited: 'Ver Editado',
        how_heading: 'Cómo funciona',
        how_activation_heading: 'Mecanismo de activación',
        how_activation_p1: 'Reverse Five requiere una ventana de activación mínima de 5 horas después de la aplicación. Durante este período, el tratamiento interactúa con los procesos naturales de tu piel. No laves ni frotes las áreas tratadas durante esta ventana de activación.',
        how_activation_p2: 'Después del mínimo de 5 horas, puedes continuar con tu rutina normal de cuidado de la piel. La formulación está diseñada para funcionar progresivamente con un uso semanal constante.',
        how_ingredients_heading: 'Sistema de ingredientes clave',
        how_ingredient1_title: 'Péptidos',
        how_ingredient1_body: 'Apoyan los procesos de refinamiento estructural de la piel y ayudan a mejorar la apariencia visible de la firmeza.',
        how_ingredient2_title: 'Ácido Hialurónico',
        how_ingredient2_body: 'Proporciona soporte de hidratación superficial y ayuda a mantener el equilibrio de humedad de la piel durante el proceso de corrección.',
        how_ingredient3_title: 'Complejo de Células Madre',
        how_ingredient3_body: 'Diseñado para apoyar la actividad de renovación natural de la piel y el refinamiento visible con el tiempo.',
        protocol_heading: 'Protocolo de uso',
        protocol_intro: 'Reverse Five sigue un protocolo de corrección estructurado con parámetros definidos de frecuencia, tiempo y duración. La consistencia es la base del refinamiento visible.',
        protocol_step1_title: 'Aplicación semanal',
        protocol_step1_body: 'Aplicar una vez por semana en áreas objetivo. No exceder la frecuencia recomendada.',
        protocol_step2_title: 'Ventana de activación',
        protocol_step2_body: 'Permitir un mínimo de 5 horas para la activación. No lavar ni frotar durante este período.',
        protocol_step3_title: 'Consistencia',
        protocol_step3_body: 'Una jeringa proporciona aproximadamente 100 aplicaciones, diseñadas para durar dos años con uso semanal.',
        protocol_step4_title: 'Fase de mantenimiento',
        protocol_step4_body: 'Después de completar el protocolo, los resultados visibles pueden mantenerse durante 6–18 meses.',
        protocol_summary_heading: 'Resumen del Protocolo',
        protocol_row1_label: 'Frecuencia',
        protocol_row1_value: 'Una vez por semana',
        protocol_row2_label: 'Activación',
        protocol_row2_value: 'Mínimo 5 horas',
        protocol_row3_label: 'Aplicaciones',
        protocol_row3_value: '~100 por jeringa',
        protocol_row4_label: 'Duración',
        protocol_row4_value: '~2 años de uso',
        protocol_row5_label: 'Mantenimiento',
        protocol_row5_value: '6–18 meses',
        important_heading: 'Directrices importantes',
        important_intro: 'Sigue estas directrices para asegurar condiciones óptimas para el protocolo de tratamiento.',
        important_do_title: 'Hacer',
        important_do_item1: 'Aplicar sobre piel limpia y seca',
        important_do_item2: 'Permitir una ventana de activación mínima de 5 horas',
        important_do_item3: 'Aplicar una vez por semana únicamente',
        important_do_item4: 'Usar aplicación de precisión en áreas objetivo',
        important_do_item5: 'Seguir un horario semanal consistente',
        important_avoid_title: 'Evitar',
        important_avoid_item1: 'Lavar la cara durante la ventana de activación',
        important_avoid_item2: 'Frotar o tocar las áreas tratadas',
        important_avoid_item3: 'Exceder la frecuencia semanal',
        important_avoid_item4: 'Aplicar en pliegues nasogenianos profundos',
        important_avoid_item5: 'Uso interno (externo únicamente)',
        important_card_title: 'Uso externo únicamente',
        important_card_body: 'Reverse Five está diseñado exclusivamente para aplicación externa. No ingerir ni aplicar en mucosas o piel dañada. Si ocurre irritación, descontinuar el uso y consultar a un profesional de la salud.',
        why_heading: 'Por qué es diferente',
        why_intro: 'Reverse Five representa un enfoque distinto para la corrección cutánea visible, estructurado como un protocolo en lugar de un producto de cuidado diario.',
        why_traditional_label: 'Cremas tradicionales',
        why_traditional_heading: 'Enfoque de hidratación superficial',
        why_traditional_item1: 'Principalmente basada en hidratación',
        why_traditional_item2: 'Efecto de relleno a corto plazo',
        why_traditional_item3: 'Requiere aplicación diaria',
        why_traditional_item4: 'Mejora visible temporal',
        why_traditional_item5: 'Los resultados disminuyen rápidamente al detenerse',
        why_botox_label: 'Inyecciones de Botox®',
        why_botox_heading: 'Enfoque de neurotoxina clínica',
        why_botox_item1: 'Inyectado directamente en los músculos faciales',
        why_botox_item2: 'Congela el movimiento para alisar líneas',
        why_botox_item3: 'Visita clínica requerida cada 3–4 meses',
        why_botox_item4: '€200–€400 por sesión de tratamiento',
        why_botox_item5: 'Posibles hematomas, hinchazón, tiempo de inactividad',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Protocolo de corrección estructurado',
        why_reverse_item1: 'Diseñado para refinamiento progresivo',
        why_reverse_item2: 'Sistema de aplicación semanal',
        why_reverse_item3: 'Requisitos de activación definidos',
        why_reverse_item4: 'Apoya la actividad natural de colágeno',
        why_reverse_item5: 'Fase de mantenimiento después de completar el protocolo',
        why_reverse_item6: 'Enfoque alternativo no inyectable',
        faq_heading: 'Preguntas frecuentes',
        faq_q1: '¿Reemplaza mi rutina de cuidado de la piel?',
        faq_a1: 'No. Reverse Five es un tratamiento de corrección complementario diseñado para funcionar junto con tu rutina de cuidado de la piel existente. Continúa usando tus limpiadores, hidratantes y sueros regulares. Aplica Reverse Five una vez por semana según las directrices del protocolo.',
        faq_q2: '¿Con qué frecuencia lo uso?',
        faq_a2: 'Una vez por semana únicamente. El protocolo está diseñado para aplicación semanal con una ventana de activación mínima de 5 horas. No excedas esta frecuencia, ya que el tratamiento requiere tiempo para trabajar con los procesos naturales de tu piel entre aplicaciones.',
        faq_q3: '¿Cuándo puedo lavarme la cara después de aplicarlo?',
        faq_a3: 'Espera un mínimo de 5 horas después de la aplicación antes de lavarte la cara. Durante esta ventana de activación, evita lavar o frotar las áreas tratadas. Después de 5 horas, puedes reanudar tu rutina normal de cuidado de la piel.',
        faq_q4: '¿Dónde no debería aplicarlo?',
        faq_a4: 'Reverse Five no está destinado para pliegues nasogenianos profundos. Enfoca la aplicación en líneas de expresión en áreas objetivo: párpado superior, debajo de los ojos, patas de gallo, líneas de la frente, líneas de ceño (11), y líneas de labio superior e inferior. Evita la aplicación en piel dañada o mucosas.',
        faq_q5: '¿Es adecuado para piel sensible?',
        faq_a5: 'Sí. Reverse Five está formulado para ser adecuado para piel sensible con aplicación externa únicamente. Si experimentas alguna irritación, descontinúa el uso y consulta a un profesional de la salud.',
        faq_q6: '¿Cuánto dura una jeringa?',
        faq_a6: 'Una jeringa proporciona aproximadamente 100 aplicaciones. Con la frecuencia semanal recomendada, está diseñada para durar aproximadamente dos años de uso constante siguiendo el protocolo.',
        faq_q7: '¿Qué cronograma de resultados debo esperar?',
        faq_a7: 'Reverse Five está diseñado como un protocolo de refinamiento progresivo, no una solución instantánea. Los resultados visibles se desarrollan gradualmente con un uso semanal constante. Después de completar el protocolo completo (aproximadamente dos años), los resultados pueden mantenerse durante 6–18 meses.',
        faq_q8: '¿Puedo combinarlo con otros productos?',
        faq_a8: 'Sí, Reverse Five está diseñado para funcionar junto con tu rutina de cuidado de la piel existente. Sin embargo, durante la ventana de activación de 5 horas, no apliques otros productos en las áreas tratadas. Después de la activación, reanuda tu régimen de productos normal.',
        cta_title: 'Experimenta la diferencia',
        cta_description: 'Comienza tu protocolo de corrección estructurado hoy. Una jeringa. Dos años. Refinamiento visible.',
        cta_button: 'Añadir al Carrito — €300',
        footer_note1: 'Página informativa de producto • Zero Lines',
        footer_note2: 'Opatra London • Reverse Five Wrinkle Eraser',
        cart_title: 'Tu Carrito',
        cart_empty: 'Tu carrito está vacío',
        cart_total: 'Total',
        checkout: 'Pagar',
        checkout_note: 'Pago seguro via Stripe',
        reviews_heading: 'Lo que dicen nuestros clientes',
        reviews_subtext: 'Experiencias reales de personas reales. Únase a más de 3000 clientes satisfechos que han hecho de Reverse Five parte de su rutina.',
        reviews_write_btn: 'Escribe una reseña',
        reviews_modal_title: 'Comparte tu experiencia',
        reviews_modal_desc: 'Tus comentarios ayudan a otros a descubrir Reverse Five.',
        reviews_label_name: 'Tu nombre',
        reviews_label_email: 'Correo electrónico',
        reviews_label_rating: 'Tu calificación',
        reviews_label_text: 'Tu reseña',
        reviews_submit_btn: 'Enviar reseña',
        contact_title: 'Ponte en contacto',
        contact_desc: '¿Tienes preguntas sobre el Rey Reverse? Nuestro equipo está aquí para ayudar. Ya sea que necesite orientación sobre el protocolo, información de envío o cualquier otra cosa, envíenos un mensaje.',
        contact_whatsapp: 'Envíanos WhatsApp<br><small>+350 5400 5198</small>',
        contact_email: 'Envíenos un correo electrónico<br><small>info@zerolines.life</small>',
        contact_label_name: 'Nombre',
        contact_label_email: 'Correo electrónico',
        contact_label_subject: 'Asunto',
        contact_subject_default: 'Selecciona un tema',
        contact_subject_product: 'Pregunta sobre el producto',
        contact_subject_shipping: 'Envío y entrega',
        contact_subject_protocol: 'Protocolo de uso',
        contact_subject_order: 'Consulta de pedido',
        contact_subject_other: 'Algo más',
        contact_label_message: 'Mensaje',
        contact_send_btn: 'Enviar mensaje',
        contact_response_note: 'Normalmente respondemos dentro de las 24 horas.',
        newsletter_title: 'Únase a la comunidad Zero Lines',
        newsletter_desc: 'Obtenga consejos exclusivos, acceso temprano a nuevos productos y un 10 % de descuento en su primer pedido.',
        newsletter_subscribe: 'Suscríbete',
        newsletter_note: 'Sin spam. Darse de baja en cualquier momento.',
        footer_desc: 'Tratamientos avanzados de corrección de la piel diseñados para un refinamiento visible y duradero.',
        footer_product: 'Producto',
        footer_support: 'Soporte',
        footer_legal: 'Legales',
        mobile_sticky_shipping: 'Envío gratis',
        guarantee_text: 'Garantía de satisfacción de 30 días',
        trust_dermatologist: 'Probado por dermatólogos',
        trust_cruelty_free: 'Libre de crueldad',
        trust_free_shipping: 'Envío mundial gratuito',
        nav_where_to_apply: 'Zonas de aplicación',
        where_heading: 'donde aplicar',
        where_intro: 'Reverse Five está diseñado para una aplicación precisa en áreas específicas que muestran signos visibles de líneas de expresión y cambios de volumen.',
        zone_forehead: 'Líneas de la frente',
        zone_forehead_desc: 'Líneas de expresión horizontales en la frente.',
        zone_frown: 'Líneas de expresión (11s)',
        zone_frown_desc: 'Líneas verticales entre las cejas.',
        zone_upper_eyelid: 'Párpado superior',
        zone_upper_eyelid_desc: 'Por encima del pliegue de los ojos para un apoyo visible de la firmeza.',
        zone_under_eye: 'Debajo del ojo',
        zone_under_eye_desc: 'Debajo de la línea de las pestañas inferiores para combatir la hinchazón y las líneas.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'Las esquinas exteriores de los ojos.',
        zone_upper_lip: 'Labio superior',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Labio inferior',
        zone_lower_lip_desc: 'Debajo de la línea del labio inferior.',
        zone_not_intended: 'No está destinado a los pliegues nasolabiales profundos (las líneas que van desde la nariz hasta las comisuras de la boca).',

        label_philosophy: 'La Filosofía',
        label_difference: 'La Diferencia',
        label_results: 'Resultados Clínicos',
        label_approach: 'El Enfoque',
        label_experts: 'Recomendado por Profesionales',
        label_targets: 'Lo que Actúa',
        label_mechanism: 'El Mecanismo',
        label_areas: 'Áreas de Acción',
        label_protocol: 'El Protocolo',
        label_safety: 'Seguridad Primero',
        label_questions: 'Preguntas Frecuentes',
        label_reviews: 'Gente Real',
        philosophy_title: 'Activa tu Cuerpo. Deja que la Naturaleza haga el Resto.',
        philosophy_intro: 'Zero Lines se fundó sobre una verdad simple: tu cuerpo ya sabe cómo curarse a sí mismo.',
        philosophy_card1_title: 'No Enmascares. Corrige.',
        philosophy_card1_body: 'Las cremas tradicionales inundan tu piel con colágeno externo y rellenos sintéticos. El efecto desaparece en cuanto dejas de usarlas. Reverse Five crea las condiciones para que tu piel se corrija por sí sola.',
        philosophy_card2_title: 'Señaliza, No Añadas.',
        philosophy_card2_body: 'Nuestro complejo peptídico señaliza a los fibroblastos de tu piel para reactivar su ciclo natural de producción de colágeno. No te damos colágeno. Enseñamos a tu cuerpo a producirlo de nuevo.',
        philosophy_card3_title: 'Resultados que Perduran.',
        philosophy_card3_body: 'Como la corrección viene de dentro, los resultados se mantienen de 6 a 18 meses después de completar el protocolo. Sin dependencia diaria. Sin ciclos interminables de productos.',
        philosophy_card4_title: 'Dos Años. Una Jeringa.',
        philosophy_card4_body: 'Un tratamiento semanal. Cinco minutos de aplicación. Una ventana de activación de 5 horas. Sesenta tratamientos por jeringa. Estructurado, simple y diseñado para la vida real.',
        experts_title: 'Lo que Dicen los Expertos',
        experts_intro: 'Dermatólogos y esteticistas líderes sobre la ciencia detrás de la corrección cutánea basada en péptidos.',
        expert1_quote: 'Entre todos los protocolos tópicos que he evaluado, la concentración de péptidos y el mecanismo de activación de Reverse Five ofrecen los resultados visibles más consistentes. La ventana de 5 horas permite una interacción celular genuina en lugar de un simple recubrimiento superficial.',
        expert1_stat_label: 'Satisfacción del Paciente',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Dermatóloga Certificada<br>Harvard Medical School',
        expert2_quote: 'El enfoque de señalización peptídica es genuinamente innovador. En lugar de añadir colágeno externo, indica a la piel que reanude su propia producción. Mis pacientes ven mejoras medibles en firmeza y profundidad de líneas entre 8 y 12 semanas.',
        expert2_stat_label: 'Mejora Visible',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Especialista en Medicina Estética<br>Johns Hopkins Dermatology',
        expert3_quote: 'Recomiendo Reverse Five a clientes que desean una corrección estructural real sin agujas. El ácido hialurónico mantiene la barrera de humedad mientras los péptidos hacen el trabajo pesado. Es lo más cercano a un tratamiento clínico que puedes usar en casa.',
        expert3_stat_label: 'Activación de Colágeno',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Esteticista Médica Principal<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Cremas Convencionales',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Hidratación superficial principalmente',
        checklist_creams_2: 'Efecto rellenador a corto plazo',
        checklist_creams_3: 'Aplicación diaria requerida',
        checklist_creams_4: 'Sin validación clínica',
        checklist_creams_5: 'Los resultados desaparecen al dejarlo',
        checklist_creams_6: 'Sin mecanismo de activación',
        checklist_reverse_1: 'Protocolo de activación por péptidos',
        checklist_reverse_2: 'Corrección estructural progresiva',
        checklist_reverse_3: 'Una vez por semana — 5 min de aplicación',
        checklist_reverse_4: 'Fabricación certificada GMP',
        checklist_reverse_5: 'Resultados mantenidos 6–18 meses',
        checklist_reverse_6: 'Ventana de activación celular de 5 horas',
    },
    pt: {
        nav_overview: 'Visão Geral',
        nav_what_it_is: 'O que é',
        nav_results: 'Resultados',
        nav_how_it_works: 'Como funciona',
        nav_protocol: 'Protocolo',
        nav_faq: 'FAQ',
        nav_contact: 'Contato',
        hero_eyebrow: 'Opatra London',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Apagador de Rugas',
        hero_description: 'Tratamento Avançado de Correção Cutânea. Alternativa não injetável ao Botox.',
        hero_tag1: 'Aplicação uma vez por semana',
        hero_tag2: 'Não invasivo · Sem dor',
        hero_tag3: '30 segundos para aplicar',
        hero_tag4: 'Testado dermatologicamente',
        hero_pill1: 'Não Injetável',
        hero_pill2: 'Testado por Dermatologistas',
        hero_pill3: '100 Tratamentos',
        hero_pill4: 'Certificado GMP',
        hero_cta_secondary: 'Ver como funciona →',
        hero_guarantee: 'Garantia de Reembolso de 30 Dias',
        hero_price_week: 'Menos de €3 por semana',
        hero_price_treatments: '100 tratamentos',
        hero_price_supply: 'Fornecimento de 2 anos',
        add_to_cart: 'Adicionar ao Carrinho — €300',
        learn_more: 'Saber Mais',
        overview_heading: 'Uma categoria diferente de correção',
        overview_intro: 'Reverse Five não é um hidratante que mascara as linhas finas com hidratação temporária. É um protocolo de correção estruturado concebido para apoiar o refinamento visível ao longo do tempo.',
        overview_card1_title: 'Protocolo estruturado',
        overview_card1_body: 'Um sistema de aplicação definido com parâmetros claros de tempo, frequência e duração concebidos para um refinamento progressivo consistente.',
        overview_card2_title: 'Correção sem agulhas',
        overview_card2_body: 'Aplicação externa sem injeção necessária. Concebido para apoiar o alisamento visível sem quebrar a barreira cutânea.',
        overview_card3_title: 'Além dos cuidados com a pele',
        overview_card3_body: 'Não é um substituto da sua rotina, mas um tratamento de correção complementar que funciona junto com o seu regime existente.',
        what_heading: 'O que este produto foi concebido para apoiar',
        what_benefit1: 'Ajuda a melhorar o aspeto das linhas de expressão, apoiando uma aparência mais suave ao longo do tempo',
        what_benefit2: 'Concebido para reduzir o aspeto do inchaço, particularmente na área debaixo dos olhos',
        what_benefit3: 'Apoia a melhoria da firmeza visível e do tom da pele',
        what_benefit4: 'Apoia a atividade natural de colagénio da pele sem conter colagénio',
        what_benefit5: 'Formulado para aplicação de precisão em áreas visíveis de preocupação',
        what_benefit6: 'Adequado para uso em pele sensível com aplicação apenas externa',
        stats_heading: 'Resultados & Estatísticas',
        stats_subtext: 'Melhorias visuais e resultados com uso consistente',
        stats_wrinkle_headline: 'Redução de rugas e linhas finas visíveis',
        stats_wrinkle_subtext: 'Com uso semanal consistente',
        stats_eyelid_headline: 'Elevação da pálpebra',
        stats_eyelid_subtext: 'Pode ajudar a reduzir o aspeto do inchaço e apoiar a aparência da pálpebra superior',
        stats_maintenance_headline: 'Resultados mantidos',
        stats_maintenance_subtext: 'Após completar o protocolo completo, os resultados podem ser mantidos a longo prazo',
        stats_disclaimer: 'Os resultados individuais podem variar. Algumas pessoas podem ver resultados máximos logo às 4 semanas.',
        stats_photo_note: 'As fotos foram levemente editadas para uma apresentação mais limpa. Clique em qualquer foto para ver a original.',
        view_original: 'Ver Original',
        view_edited: 'Ver Editado',
        how_heading: 'Como funciona',
        how_activation_heading: 'Mecanismo de ativação',
        how_activation_p1: 'Reverse Five requer uma janela de ativação mínima de 5 horas após a aplicação. Durante este período, o tratamento interage com os processos naturais da sua pele. Não lave ou esfregue as áreas tratadas durante esta janela de ativação.',
        how_activation_p2: 'Após o mínimo de 5 horas, pode continuar com a sua rotina normal de cuidados com a pele. A formulação é concebida para funcionar progressivamente com uso semanal consistente.',
        how_ingredients_heading: 'Sistema de ingredientes-chave',
        how_ingredient1_title: 'Peptídeos',
        how_ingredient1_body: 'Apoiam os processos de refinamento estrutural da pele e ajudam a melhorar a aparência visível da firmeza.',
        how_ingredient2_title: 'Ácido Hialurónico',
        how_ingredient2_body: 'Fornece suporte de hidratação superficial e ajuda a manter o equilíbrio de humidade da pele durante o processo de correção.',
        how_ingredient3_title: 'Complexo de Células Estaminais',
        how_ingredient3_body: 'Concebido para apoiar a atividade de renovação natural da pele e o refinamento visível ao longo do tempo.',
        protocol_heading: 'Protocolo de uso',
        protocol_intro: 'Reverse Five segue um protocolo de correção estruturado com parâmetros definidos de frequência, tempo e duração. A consistência é o fundamento do refinamento visível.',
        protocol_step1_title: 'Aplicação semanal',
        protocol_step1_body: 'Aplicar uma vez por semana nas áreas alvo. Não exceder a frequência recomendada.',
        protocol_step2_title: 'Janela de ativação',
        protocol_step2_body: 'Permitir um mínimo de 5 horas para ativação. Sem lavar ou esfregar durante este período.',
        protocol_step3_title: 'Consistência',
        protocol_step3_body: 'Uma seringa fornece aproximadamente 100 aplicações, concebida para durar dois anos com uso semanal.',
        protocol_step4_title: 'Fase de manutenção',
        protocol_step4_body: 'Após completar o protocolo, os resultados visíveis podem ser mantidos durante 6–18 meses.',
        protocol_summary_heading: 'Resumo do Protocolo',
        protocol_row1_label: 'Frequência',
        protocol_row1_value: 'Uma vez por semana',
        protocol_row2_label: 'Ativação',
        protocol_row2_value: 'Mínimo 5 horas',
        protocol_row3_label: 'Aplicações',
        protocol_row3_value: '~100 por seringa',
        protocol_row4_label: 'Duração',
        protocol_row4_value: '~2 anos de uso',
        protocol_row5_label: 'Manutenção',
        protocol_row5_value: '6–18 meses',
        important_heading: 'Diretrizes importantes',
        important_intro: 'Siga estas diretrizes para garantir condições ótimas para o protocolo de tratamento.',
        important_do_title: 'Fazer',
        important_do_item1: 'Aplicar em pele limpa e seca',
        important_do_item2: 'Permitir uma janela de ativação mínima de 5 horas',
        important_do_item3: 'Aplicar apenas uma vez por semana',
        important_do_item4: 'Usar aplicação de precisão nas áreas alvo',
        important_do_item5: 'Seguir um horário semanal consistente',
        important_avoid_title: 'Evitar',
        important_avoid_item1: 'Lavar o rosto durante a janela de ativação',
        important_avoid_item2: 'Esfregar ou tocar nas áreas tratadas',
        important_avoid_item3: 'Exceder a frequência semanal',
        important_avoid_item4: 'Aplicar em sulcos nasogenianos profundos',
        important_avoid_item5: 'Uso interno (apenas externo)',
        important_card_title: 'Apenas para uso externo',
        important_card_body: 'Reverse Five foi concebido exclusivamente para aplicação externa. Não ingerir nem aplicar em mucosas ou pele lesionada. Se ocorrer irritação, descontinuar o uso e consultar um profissional de saúde.',
        why_heading: 'Por que é diferente',
        why_intro: 'Reverse Five representa uma abordagem distinta à correção cutânea visível, estruturado como um protocolo em vez de um produto de cuidados diários.',
        why_traditional_label: 'Cremes tradicionais',
        why_traditional_heading: 'Abordagem de hidratação superficial',
        why_traditional_item1: 'Principalmente baseado em hidratação',
        why_traditional_item2: 'Efeito de preenchimento a curto prazo',
        why_traditional_item3: 'Requer aplicação diária',
        why_traditional_item4: 'Melhoria visível temporária',
        why_traditional_item5: 'Os resultados diminuem rapidamente ao parar',
        why_botox_label: 'Injeções de Botox®',
        why_botox_heading: 'Abordagem de neurotoxina clínica',
        why_botox_item1: 'Injetado diretamente nos músculos faciais',
        why_botox_item2: 'Congela o movimento para suavizar linhas',
        why_botox_item3: 'Visita clínica necessária a cada 3–4 meses',
        why_botox_item4: '€200–€400 por sessão de tratamento',
        why_botox_item5: 'Possível hematomas, inchaço, tempo de recuperação',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Protocolo de correção estruturado',
        why_reverse_item1: 'Concebido para refinamento progressivo',
        why_reverse_item2: 'Sistema de aplicação semanal',
        why_reverse_item3: 'Requisitos de ativação definidos',
        why_reverse_item4: 'Apoia a atividade natural de colagénio',
        why_reverse_item5: 'Fase de manutenção após conclusão do protocolo',
        why_reverse_item6: 'Abordagem alternativa não injetável',
        faq_heading: 'Perguntas frequentes',
        faq_q1: 'Substitui a minha rotina de cuidados com a pele?',
        faq_a1: 'Não. Reverse Five é um tratamento de correção complementar concebido para funcionar junto com a sua rotina de cuidados existente. Continue a usar os seus limpadores, hidratantes e séruns regulares. Aplique Reverse Five uma vez por semana de acordo com as diretrizes do protocolo.',
        faq_q2: 'Com que frequência o uso?',
        faq_a2: 'Apenas uma vez por semana. O protocolo é concebido para aplicação semanal com uma janela de ativação mínima de 5 horas. Não exceda esta frequência, pois o tratamento requer tempo para trabalhar com os processos naturais da sua pele entre aplicações.',
        faq_q3: 'Quando posso lavar o rosto após aplicar?',
        faq_a3: 'Espere um mínimo de 5 horas após a aplicação antes de lavar o rosto. Durante esta janela de ativação, evite lavar ou esfregar as áreas tratadas. Após 5 horas, pode retomar a sua rotina normal de cuidados com a pele.',
        faq_q4: 'Onde não devo aplicar?',
        faq_a4: 'Reverse Five não é destinado a sulcos nasogenianos profundos. Concentre a aplicação em linhas de expressão em áreas alvo: pálpebra superior, debaixo dos olhos, pés de galinha, linhas da testa, linhas de expressão (11), e linhas do lábio superior e inferior. Evite a aplicação em pele lesionada ou mucosas.',
        faq_q5: 'É adequado para pele sensível?',
        faq_a5: 'Sim. Reverse Five é formulado para ser adequado para pele sensível com aplicação apenas externa. Se sentir alguma irritação, descontinue o uso e consulte um profissional de saúde.',
        faq_q6: 'Quanto tempo dura uma seringa?',
        faq_a6: 'Uma seringa fornece aproximadamente 100 aplicações. Com a frequência semanal recomendada, é concebida para durar aproximadamente dois anos de uso consistente seguindo o protocolo.',
        faq_q7: 'Que cronograma de resultados devo esperar?',
        faq_a7: 'Reverse Five é concebido como um protocolo de refinamento progressivo, não uma solução instantânea. Os resultados visíveis desenvolvem-se gradualmente com uso semanal consistente. Após completar o protocolo completo (aproximadamente dois anos), os resultados podem ser mantidos durante 6–18 meses.',
        faq_q8: 'Posso combiná-lo com outros produtos?',
        faq_a8: 'Sim, Reverse Five é concebido para funcionar junto com a sua rotina de cuidados existente. No entanto, durante a janela de ativação de 5 horas, não aplique outros produtos nas áreas tratadas. Após a ativação, retome o seu regime normal de produtos.',
        cta_title: 'Experimente a diferença',
        cta_description: 'Comece o seu protocolo de correção estruturado hoje. Uma seringa. Dois anos. Refinamento visível.',
        cta_button: 'Adicionar ao Carrinho — €300',
        footer_note1: 'Página de produto informativa • Zero Lines',
        footer_note2: 'Opatra London • Reverse Five Wrinkle Eraser',
        cart_title: 'O Seu Carrinho',
        cart_empty: 'O seu carrinho está vazio',
        cart_total: 'Total',
        checkout: 'Finalizar Compra',
        checkout_note: 'Pagamento seguro via Stripe',
        reviews_heading: 'O que nossos clientes dizem',
        reviews_subtext: 'Experiências reais de pessoas reais. Junte-se a mais de 3.000 clientes satisfeitos que fizeram do Reverse Five parte de sua rotina.',
        reviews_write_btn: 'Escreva um comentário',
        reviews_modal_title: 'Compartilhe sua experiência',
        reviews_modal_desc: 'Seu feedback ajuda outras pessoas a descobrir Reverse Five.',
        reviews_label_name: 'Seu nome',
        reviews_label_email: 'E-mail',
        reviews_label_rating: 'Sua avaliação',
        reviews_label_text: 'Sua avaliação',
        reviews_submit_btn: 'Enviar avaliação',
        contact_title: 'Entre em contato',
        contact_desc: 'Tem dúvidas sobre Reverse Five? Nossa equipe está aqui para ajudar. Se você precisar de orientação sobre o protocolo, informações de envio ou qualquer outra coisa, envie-nos uma mensagem.',
        contact_whatsapp: 'Fale conosco pelo WhatsApp<br><small>+350 5400 5198</small>',
        contact_email: 'Envie-nos um e-mail<br><small>info@zerolines.life</small>',
        contact_label_name: 'Nome',
        contact_label_email: 'E-mail',
        contact_label_subject: 'Assunto',
        contact_subject_default: 'Selecione um tópico',
        contact_subject_product: 'Pergunta sobre o produto',
        contact_subject_shipping: 'Envio e entrega',
        contact_subject_protocol: 'Protocolo de uso',
        contact_subject_order: 'Consulta de pedido',
        contact_subject_other: 'Outra coisa',
        contact_label_message: 'Mensagem',
        contact_send_btn: 'Enviar mensagem',
        contact_response_note: 'Normalmente respondemos dentro de 24 horas.',
        newsletter_title: 'Junte-se à comunidade Zero Lines',
        newsletter_desc: 'Receba dicas exclusivas, acesso antecipado a novos produtos e 10% de desconto no primeiro pedido.',
        newsletter_subscribe: 'Inscrever-se',
        newsletter_note: 'Sem spam. Cancele a inscrição a qualquer momento.',
        footer_desc: 'Tratamentos avançados de correção da pele projetados para um refinamento visível e duradouro.',
        footer_product: 'Produto',
        footer_support: 'Apoiar',
        footer_legal: 'Jurídico',
        mobile_sticky_shipping: 'Frete grátis',
        guarantee_text: 'Garantia de satisfação de 30 dias',
        trust_dermatologist: 'Testado por dermatologista',
        trust_cruelty_free: 'Livre de crueldade',
        trust_free_shipping: 'Frete grátis para todo o mundo',
        nav_where_to_apply: 'Zonas de aplicação',
        where_heading: 'Onde se inscrever',
        where_intro: 'Reverse Five foi projetado para aplicação precisa em áreas específicas que mostram sinais visíveis de linhas de expressão e alterações de volume.',
        zone_forehead: 'Linhas da testa',
        zone_forehead_desc: 'Linhas de expressão horizontais na testa.',
        zone_frown: 'Linhas de expressão (11s)',
        zone_frown_desc: 'Linhas verticais entre as sobrancelhas.',
        zone_upper_eyelid: 'Pálpebra Superior',
        zone_upper_eyelid_desc: 'Acima da dobra dos olhos para suporte de firmeza visível.',
        zone_under_eye: 'Sob os olhos',
        zone_under_eye_desc: 'Abaixo da linha dos cílios inferiores para combater o inchaço e as linhas.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'Os cantos externos dos olhos.',
        zone_upper_lip: 'Lábio superior',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Lábio Inferior',
        zone_lower_lip_desc: 'Abaixo da linha do lábio inferior.',
        zone_not_intended: 'Não se destina a sulcos nasolabiais profundos (as linhas que vão do nariz aos cantos da boca).',

        label_philosophy: 'A Filosofia',
        label_difference: 'A Diferença',
        label_results: 'Resultados Clínicos',
        label_approach: 'A Abordagem',
        label_experts: 'Recomendado por Profissionais',
        label_targets: 'O que Atua',
        label_mechanism: 'O Mecanismo',
        label_areas: 'Áreas de Ação',
        label_protocol: 'O Protocolo',
        label_safety: 'Segurança em Primeiro Lugar',
        label_questions: 'Perguntas Frequentes',
        label_reviews: 'Pessoas Reais',
        philosophy_title: 'Ative o seu Corpo. Deixe a Natureza fazer o Resto.',
        philosophy_intro: 'A Zero Lines foi fundada numa verdade simples: o seu corpo já sabe como se curar.',
        philosophy_card1_title: 'Não Disfarce. Corrija.',
        philosophy_card1_body: 'Os cremes tradicionais inundam a sua pele com colagénio externo e preenchedores sintéticos. O efeito desaparece no momento em que para. Reverse Five cria as condições para que a sua pele se corrija sozinha.',
        philosophy_card2_title: 'Sinalize, Não Adicione.',
        philosophy_card2_body: 'O nosso complexo peptídico sinaliza aos fibroblastos da sua pele para reativarem o seu ciclo natural de produção de colagénio. Não lhe damos colagénio. Ensinamos o seu corpo a produzi-lo novamente.',
        philosophy_card3_title: 'Resultados que Duram.',
        philosophy_card3_body: 'Como a correção vem de dentro, os resultados mantêm-se de 6 a 18 meses após a conclusão do protocolo. Sem dependência diária. Sem ciclos intermináveis de produtos.',
        philosophy_card4_title: 'Dois Anos. Uma Seringa.',
        philosophy_card4_body: 'Um tratamento semanal. Cinco minutos de aplicação. Uma janela de ativação de 5 horas. Sessenta tratamentos por seringa. Estruturado, simples e desenhado para a vida real.',
        experts_title: 'O que os Especialistas Dizem',
        experts_intro: 'Dermatologistas e esteticistas de referência sobre a ciência por detrás da correção da pele por peptídeos.',
        expert1_quote: 'Entre todos os protocolos tópicos que avaliei, a concentração de peptídeos e o mecanismo de ativação de Reverse Five oferecem os resultados visíveis mais consistentes. A janela de 5 horas permite uma interação celular genuína em vez de um simples revestimento superficial.',
        expert1_stat_label: 'Satisfação do Paciente',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Dermatologista Certificada<br>Harvard Medical School',
        expert2_quote: 'A abordagem de sinalização por peptídeos é genuinamente inovadora. Em vez de adicionar colagénio externo, instrui a pele a retomar a sua própria produção. Os meus pacientes observam melhorias mensuráveis na firmeza e profundidade das linhas entre 8 a 12 semanas.',
        expert2_stat_label: 'Melhoria Visível',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Especialista em Medicina Estética<br>Johns Hopkins Dermatology',
        expert3_quote: 'Recomendo Reverse Five a clientes que querem uma verdadeira correção estrutural sem agulhas. O ácido hialurónico mantém a barreira de hidratação enquanto os peptídeos fazem o trabalho pesado. É o mais próximo de um tratamento clínico que pode usar em casa.',
        expert3_stat_label: 'Ativação de Colagénio',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Esteticista Médica Chefe<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Cremes Convencionais',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Hidratação superficial principalmente',
        checklist_creams_2: 'Efeito preenchedor a curto prazo',
        checklist_creams_3: 'Aplicação diária necessária',
        checklist_creams_4: 'Sem validação clínica',
        checklist_creams_5: 'Os resultados desaparecem ao parar',
        checklist_creams_6: 'Sem mecanismo de ativação',
        checklist_reverse_1: 'Protocolo de ativação por peptídeos',
        checklist_reverse_2: 'Correção estrutural progressiva',
        checklist_reverse_3: 'Uma vez por semana — 5 min de aplicação',
        checklist_reverse_4: 'Fabrico certificado GMP',
        checklist_reverse_5: 'Resultados mantidos 6–18 meses',
        checklist_reverse_6: 'Janela de ativação celular de 5 horas',
    },
    da: {
        nav_overview: 'Oversigt',
        nav_what_it_is: 'Hvad det er',
        nav_results: 'Resultater',
        nav_how_it_works: 'Sådan virker det',
        nav_protocol: 'Protokol',
        nav_faq: 'FAQ',
        nav_contact: 'Kontakt',
        hero_eyebrow: 'Opatra London',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Rynkefjerner',
        hero_description: 'Avanceret hudkorrektionsbehandling. Ikke-injicerbar alternativ til Botox.',
        hero_tag1: 'Påføring en gang om ugen',
        hero_tag2: 'Ikke-invasiv · Smertefri',
        hero_tag3: '30 sekunder at påføre',
        hero_tag4: 'Dermatologisk testet',
        hero_pill1: 'Ikke-Injicerbar',
        hero_pill2: 'Dermatologisk Testet',
        hero_pill3: '100 Behandlinger',
        hero_pill4: 'GMP-Certificeret',
        hero_cta_secondary: 'Se hvordan det virker →',
        hero_guarantee: '30-Dages Pengene-Tilbage-Garanti',
        hero_price_week: 'Mindre end €3 om ugen',
        hero_price_treatments: '100 behandlinger',
        hero_price_supply: '2-års forsyning',
        add_to_cart: 'Læg i Kurv — €300',
        learn_more: 'Læs Mere',
        overview_heading: 'En anden kategori af korrektion',
        overview_intro: 'Reverse Five er ikke en fugtighedscreme, der maskerer fine linjer med midlertidig fugt. Det er en struktureret korrektionsprotokol designet til at understøtte synlig forfinelse over tid.',
        overview_card1_title: 'Struktureret protokol',
        overview_card1_body: 'Et defineret påføringssystem med klare timing-, frekvens- og varighedsparametre designet til konsistent progressiv forfinelse.',
        overview_card2_title: 'Nålefri korrektion',
        overview_card2_body: 'Ekstern påføring uden injektion nødvendig. Designet til at understøtte synlig udglatning uden at bryde hudbarrieren.',
        overview_card3_title: 'Udover hudpleje',
        overview_card3_body: 'Ikke en erstatning for din rutine, men en komplementær korrektionsbehandling, der fungerer sammen med dit eksisterende regime.',
        what_heading: 'Hvad dette produkt er designet til at understøtte',
        what_benefit1: 'Hjælper med at forbedre udseendet af mimikrynker og understøtter et glattere udseende over tid',
        what_benefit2: 'Designet til at reducere udseendet af hævelser, især i området under øjnene',
        what_benefit3: 'Understøtter forbedring af synlig fasthed og hudtone',
        what_benefit4: 'Understøtter hudens naturlige kollagenaktivitet uden selv at indeholde kollagen',
        what_benefit5: 'Formuleret til præcis påføring på målrettede områder med synlige bekymringer',
        what_benefit6: 'Egnet til sensitiv hud med kun ekstern påføring',
        stats_heading: 'Resultater & Statistik',
        stats_subtext: 'Visuelle forbedringer og resultater med konsekvent brug',
        stats_wrinkle_headline: 'Reduktion af synlige rynker og fine linjer',
        stats_wrinkle_subtext: 'Med konsekvent ugentlig brug',
        stats_eyelid_headline: 'Øjenløft',
        stats_eyelid_subtext: 'Kan hjælpe med at reducere udseendet af hævelser og understøtte øvre øjenlågs udseende',
        stats_maintenance_headline: 'Resultater opretholdt',
        stats_maintenance_subtext: 'Efter gennemførelse af den fulde protokol kan resultaterne opretholdes på lang sigt',
        stats_disclaimer: 'Individuelle resultater kan variere. Nogle personer kan se maksimale resultater allerede efter 4 uger.',
        stats_photo_note: 'Fotos er let redigeret for en renere præsentation. Klik på et hvilket som helst foto for at se originalen.',
        view_original: 'Se Original',
        view_edited: 'Se Redigeret',
        how_heading: 'Sådan virker det',
        how_activation_heading: 'Aktiveringsmekanisme',
        how_activation_p1: 'Reverse Five kræver et minimum på 5 timers aktiveringsvindue efter påføring. I denne periode interagerer behandlingen med din huds naturlige processer. Vask eller gnid ikke de behandlede områder under dette aktiveringsvindue.',
        how_activation_p2: 'Efter minimum 5 timer kan du fortsætte med din normale hudplejerutine. Formuleringen er designet til at arbejde progressivt med konsekvent ugentlig brug.',
        how_ingredients_heading: 'Nøgleingrediens system',
        how_ingredient1_title: 'Peptider',
        how_ingredient1_body: 'Understøtter hudens strukturelle forbedringsprocesser og hjælper med at forbedre det synlige udseende af fasthed.',
        how_ingredient2_title: 'Hyaluronsyre',
        how_ingredient2_body: 'Giver overfladisk hydrering og hjælper med at opretholde hudens fugtbalance under korrektionsprocessen.',
        how_ingredient3_title: 'Stamcellekompleks',
        how_ingredient3_body: 'Designet til at understøtte hudens naturlige fornyelsesaktivitet og synlige forfinelse over tid.',
        protocol_heading: 'Brugsprotokol',
        protocol_intro: 'Reverse Five følger en struktureret korrektionsprotokol med definerede frekvens-, tids- og varighedsparametre. Konsistens er grundlaget for synlig forfinelse.',
        protocol_step1_title: 'Ugentlig påføring',
        protocol_step1_body: 'Påfør en gang om ugen på målområder. Overskrid ikke den anbefalede frekvens.',
        protocol_step2_title: 'Aktiveringsvindue',
        protocol_step2_body: 'Tillad minimum 5 timer til aktivering. Ingen vask eller gnidning i denne periode.',
        protocol_step3_title: 'Konsistens',
        protocol_step3_body: 'Én sprøjte giver ca. 100 påføringer, designet til at vare to år ved ugentlig brug.',
        protocol_step4_title: 'Vedligeholdelsesfase',
        protocol_step4_body: 'Efter gennemførelse af protokollen kan synlige resultater opretholdes i 6–18 måneder.',
        protocol_summary_heading: 'Protokolresumé',
        protocol_row1_label: 'Frekvens',
        protocol_row1_value: 'En gang om ugen',
        protocol_row2_label: 'Aktivering',
        protocol_row2_value: 'Minimum 5 timer',
        protocol_row3_label: 'Påføringer',
        protocol_row3_value: '~100 pr. sprøjte',
        protocol_row4_label: 'Varighed',
        protocol_row4_value: '~2 års brug',
        protocol_row5_label: 'Vedligeholdelse',
        protocol_row5_value: '6–18 måneder',
        important_heading: 'Vigtige retningslinjer',
        important_intro: 'Følg disse retningslinjer for at sikre optimale betingelser for behandlingsprotokollen.',
        important_do_title: 'Gør',
        important_do_item1: 'Påfør på ren, tør hud',
        important_do_item2: 'Tillad et minimum på 5 timers aktiveringsvindue',
        important_do_item3: 'Påfør kun en gang om ugen',
        important_do_item4: 'Brug præcis påføring på målområder',
        important_do_item5: 'Følg en konsekvent ugentlig tidsplan',
        important_avoid_title: 'Undgå',
        important_avoid_item1: 'At vaske ansigtet under aktiveringsvinduet',
        important_avoid_item2: 'At gnide eller røre de behandlede områder',
        important_avoid_item3: 'At overskride den ugentlige frekvens',
        important_avoid_item4: 'At påføre på dybe nasolabiale folder',
        important_avoid_item5: 'Intern brug (kun ekstern)',
        important_card_title: 'Kun til ekstern brug',
        important_card_body: 'Reverse Five er udelukkende designet til ekstern påføring. Indtag ikke eller påfør på slimhinder eller beskadiget hud. Hvis irritation opstår, seponer brugen og konsulter en sundhedsfaglig professionel.',
        why_heading: 'Hvorfor det er anderledes',
        why_intro: 'Reverse Five repræsenterer en distinkt tilgang til synlig hudkorrektion, struktureret som en protokol snarere end et dagligt hudplejeprodukt.',
        why_traditional_label: 'Traditionelle cremer',
        why_traditional_heading: 'Overfladisk hydrerings tilgang',
        why_traditional_item1: 'Primært hydreringsbaseret',
        why_traditional_item2: 'Kortvarig opstrammende effekt',
        why_traditional_item3: 'Kræver daglig påføring',
        why_traditional_item4: 'Midlertidig synlig forbedring',
        why_traditional_item5: 'Resultater forsvinder hurtigt ved stop',
        why_botox_label: 'Botox®-injektioner',
        why_botox_heading: 'Klinisk neurotoksin-tilgang',
        why_botox_item1: 'Injiceret direkte i ansigtsmusklerne',
        why_botox_item2: 'Fryser bevægelse for at udglatte linjer',
        why_botox_item3: 'Klinikbesøg påkrævet hver 3–4. måned',
        why_botox_item4: '€200–€400 pr. behandlingssession',
        why_botox_item5: 'Potentielle blå mærker, hævelse, nedetid',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Struktureret korrektionsprotokol',
        why_reverse_item1: 'Designet til progressiv forfinelse',
        why_reverse_item2: 'Ugentligt påføringssystem',
        why_reverse_item3: 'Definerede aktiveringskrav',
        why_reverse_item4: 'Understøtter naturlig kollagenaktivitet',
        why_reverse_item5: 'Vedligeholdelsesfase efter protokolafslutning',
        why_reverse_item6: 'Ikke-injicerbar alternativ tilgang',
        faq_heading: 'Ofte stillede spørgsmål',
        faq_q1: 'Erstatter det min hudplejerutine?',
        faq_a1: 'Nej. Reverse Five er en komplementær korrektionsbehandling designet til at fungere sammen med din eksisterende hudplejerutine. Fortsæt med at bruge dine almindelige rensere, fugtighedscremer og serum. Påfør Reverse Five en gang om ugen i henhold til protokollens retningslinjer.',
        faq_q2: 'Hvor ofte bruger jeg det?',
        faq_a2: 'Kun en gang om ugen. Protokollen er designet til ugentlig påføring med et minimum på 5 timers aktiveringsvindue. Overskrid ikke denne frekvens, da behandlingen kræver tid til at arbejde med din huds naturlige processer mellem påføringer.',
        faq_q3: 'Hvornår kan jeg vaske mit ansigt efter påføring?',
        faq_a3: 'Vent mindst 5 timer efter påføring, før du vasker dit ansigt. Undgå at vaske eller gnide de behandlede områder i dette aktiveringsvindue. Efter 5 timer kan du genoptage din normale hudplejerutine.',
        faq_q4: 'Hvor skal jeg ikke påføre det?',
        faq_a4: 'Reverse Five er ikke beregnet til dybe nasolabiale folder. Koncentrer påføringen på mimikrynker i målområder: øvre øjenlåg, under øjnene, kragefødder, panderynker, rynker mellem øjenbrynene (11\'er) og overlæbe- og underlæbelinjer. Undgå påføring på beskadiget hud eller slimhinder.',
        faq_q5: 'Er det egnet til sensitiv hud?',
        faq_a5: 'Ja. Reverse Five er formuleret til at være egnet til sensitiv hud med kun ekstern påføring. Hvis du oplever irritation, seponer brugen og konsulter en sundhedsfaglig professionel.',
        faq_q6: 'Hvor længe holder en sprøjte?',
        faq_a6: 'Én sprøjte giver ca. 100 påføringer. Med den anbefalede ugentlige frekvens er den designet til at vare ca. to år ved konsekvent brug i henhold til protokollen.',
        faq_q7: 'Hvilket resultattidslinje skal jeg forvente?',
        faq_a7: 'Reverse Five er designet som et progressivt forfinelsesprotokol, ikke en øjeblikkelig løsning. Synlige resultater udvikles gradvist ved konsekvent ugentlig brug. Efter gennemførelse af den fulde protokol (ca. to år) kan resultater opretholdes i 6–18 måneder.',
        faq_q8: 'Kan jeg kombinere det med andre produkter?',
        faq_a8: 'Ja, Reverse Five er designet til at fungere sammen med din eksisterende hudplejerutine. I løbet af det 5-timers aktiveringsvindue må du dog ikke påføre andre produkter på de behandlede områder. Efter aktiveringen genoptages dit normale produktregime.',
        cta_title: 'Oplev forskellen',
        cta_description: 'Start din strukturerede korrektionsprotokol i dag. Én sprøjte. To år. Synlig forfinelse.',
        cta_button: 'Læg i Kurv — €300',
        footer_note1: 'Informativ produktside • Zero Lines',
        footer_note2: 'Opatra London • Reverse Five Wrinkle Eraser',
        cart_title: 'Din Kurv',
        cart_empty: 'Din kurv er tom',
        cart_total: 'Total',
        checkout: 'Til Betaling',
        checkout_note: 'Sikker betaling via Stripe',
        reviews_heading: 'Hvad vores kunder siger',
        reviews_subtext: 'Rigtige oplevelser fra rigtige mennesker. Slut dig til over 3.000 tilfredse kunder, der har gjort Reverse Five til en del af deres rutine.',
        reviews_write_btn: 'Skriv en anmeldelse',
        reviews_modal_title: 'Del din oplevelse',
        reviews_modal_desc: 'Din feedback hjælper andre med at opdage Reverse Five.',
        reviews_label_name: 'Dit navn',
        reviews_label_email: 'E-mail',
        reviews_label_rating: 'Din bedømmelse',
        reviews_label_text: 'Din anmeldelse',
        reviews_submit_btn: 'Send anmeldelse',
        contact_title: 'Kontakt',
        contact_desc: 'Har du spørgsmål om Reverse Five? Vores team er her for at hjælpe. Uanset om du har brug for vejledning om protokollen, forsendelsesoplysninger eller andet - send os en besked.',
        contact_whatsapp: 'WhatsApp os<br><small>+350 5400 5198</small>',
        contact_email: 'Send os en e-mail<br><small>info@zerolines.life</small>',
        contact_label_name: 'Navn',
        contact_label_email: 'E-mail',
        contact_label_subject: 'Emne',
        contact_subject_default: 'Vælg et emne',
        contact_subject_product: 'Produktspørgsmål',
        contact_subject_shipping: 'Forsendelse & Levering',
        contact_subject_protocol: 'Brugsprotokol',
        contact_subject_order: 'Ordreforespørgsel',
        contact_subject_other: 'Noget andet',
        contact_label_message: 'Meddelelse',
        contact_send_btn: 'Send besked',
        contact_response_note: 'Vi svarer typisk inden for 24 timer.',
        newsletter_title: 'Deltag i Zero Lines-fællesskabet',
        newsletter_desc: 'Få eksklusive tips, tidlig adgang til nye produkter og 10 % rabat på din første ordre.',
        newsletter_subscribe: 'Abonner',
        newsletter_note: 'Ingen spam. Afmeld når som helst.',
        footer_desc: 'Avancerede hudkorrektionsbehandlinger designet til synlig, varig raffinement.',
        footer_product: 'Produkt',
        footer_support: 'Support',
        footer_legal: 'Juridisk',
        mobile_sticky_shipping: 'Gratis forsendelse',
        guarantee_text: '30-dages tilfredshedsgaranti',
        trust_dermatologist: 'Dermatolog testet',
        trust_cruelty_free: 'Cruelty Free',
        trust_free_shipping: 'Gratis verdensomspændende forsendelse',
        nav_where_to_apply: 'Påføringszoner',
        where_heading: 'Hvor skal man søge',
        where_intro: 'Reverse Five er designet til præcis påføring på målrettede områder, der viser synlige tegn på udtrykslinjer og volumenændringer.',
        zone_forehead: 'Pandelinjer',
        zone_forehead_desc: 'Vandrette udtrykslinjer hen over panden.',
        zone_frown: 'panderynker (11s)',
        zone_frown_desc: 'Lodrette linjer mellem øjenbrynene.',
        zone_upper_eyelid: 'Øvre øjenlåg',
        zone_upper_eyelid_desc: 'Over øjenfolden for synlig støtte til fasthed.',
        zone_under_eye: 'Under Eye',
        zone_under_eye_desc: 'Under den nederste vippekant for at målrette hævelser og linjer.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'De ydre hjørner af øjnene.',
        zone_upper_lip: 'Overlæbe',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Underlæbe',
        zone_lower_lip_desc: 'Under underlæbelinjen.',
        zone_not_intended: 'Ikke beregnet til dybe nasolabiale folder (linjerne fra næse til mundhjørner).',

        label_philosophy: 'Filosofien',
        label_difference: 'Forskellen',
        label_results: 'Kliniske Resultater',
        label_approach: 'Tilgangen',
        label_experts: 'Anbefalet af Fagfolk',
        label_targets: 'Hvad det Virker På',
        label_mechanism: 'Mekanismen',
        label_areas: 'Målområder',
        label_protocol: 'Protokollen',
        label_safety: 'Sikkerhed Først',
        label_questions: 'Ofte Stillede Spørgsmål',
        label_reviews: 'Rigtige Mennesker',
        philosophy_title: 'Aktivér din Krop. Lad Naturen gøre Resten.',
        philosophy_intro: 'Zero Lines er grundlagt på en simpel sandhed: din krop ved allerede, hvordan den helbreder sig selv.',
        philosophy_card1_title: 'Skjul Ikke. Korriger.',
        philosophy_card1_body: 'Traditionelle cremer oversvømmer din hud med ekstern kollagen og syntetiske fyldstoffer. Effekten forsvinder, så snart du stopper. Reverse Five skaber betingelserne for, at din hud korrigerer sig selv.',
        philosophy_card2_title: 'Signalér, Tilsæt Ikke.',
        philosophy_card2_body: 'Vores peptidkompleks signalerer til din huds fibroblaster, at de skal genaktivere deres naturlige kollagenproduktionscyklus. Vi giver dig ikke kollagen. Vi lærer din krop at producere det igen.',
        philosophy_card3_title: 'Resultater, der Holder.',
        philosophy_card3_body: 'Fordi korrigeringen kommer indefra, vedbliver resultaterne 6 til 18 måneder efter protokollens afslutning. Ingen daglig afhængighed. Ingen endeløse produktcykler.',
        philosophy_card4_title: 'To År. Én Sprøjte.',
        philosophy_card4_body: 'Én ugentlig behandling. Fem minutters påføring. Et 5-timers aktiveringsvindue. tres behandlinger pr. sprøjte. Struktureret, enkelt og designet til virkeligheden.',
        experts_title: 'Hvad Eksperterne Siger',
        experts_intro: 'Førende dermatologer og estetikere om videnskaben bag peptide-baseret hudkorrektion.',
        expert1_quote: 'Blandt alle de topiske protokoller, jeg har evalueret, leverer Reverse Fives peptidkoncentration og aktiveringsmekanisme de mest konsistente synlige resultater. Det 5-timers vindue muliggør ægte cellulær interaktion frem for overfladisk overtræk.',
        expert1_stat_label: 'Patients tilfredshed',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Dermatolog med Bestået Eksamen<br>Harvard Medical School',
        expert2_quote: 'Peptid-signaltilgangen er genuint innovativ. Frem for at tilføje ekstern kollagen instruerer den huden i at genoptage sin egen produktion. Mine patienter ser målbare forbedringer i fasthed og linjedybde inden for 8 til 12 uger.',
        expert2_stat_label: 'Synlig Forbedring',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Specialist i Æstetisk Medicin<br>Johns Hopkins Dermatology',
        expert3_quote: 'Jeg anbefaler Reverse Five til klienter, der ønsker reel strukturel korrektion uden nåle. Hyaluronsyren opretholder fugtighedsbarrieren, mens peptiderne gør det tunge arbejde. Det er det nærmeste, man kommer en klinisk behandling, som man kan bruge derhjemme.',
        expert3_stat_label: 'Kollagenaktivering',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Ledende Medicinsk Estetiker<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Forbrugercremer',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Primært overfladehydrering',
        checklist_creams_2: 'Kortvarig opstrammende effekt',
        checklist_creams_3: 'Daglig påføring påkrævet',
        checklist_creams_4: 'Ingen klinisk validering',
        checklist_creams_5: 'Resultater forsvinder ved ophør',
        checklist_creams_6: 'Ingen aktiveringsmekanisme',
        checklist_reverse_1: 'Peptidaktiveringsprotokol',
        checklist_reverse_2: 'Progressiv strukturel korrektion',
        checklist_reverse_3: 'Én gang ugentligt — 5 min påføring',
        checklist_reverse_4: 'GMP-certificeret fremstilling',
        checklist_reverse_5: 'Resultater vedligeholdes 6–18 måneder',
        checklist_reverse_6: '5-timers cellulært aktiveringsvindue',
    },
    pl: {
        nav_overview: 'Przegląd',
        nav_what_it_is: 'Co to jest',
        nav_results: 'Wyniki',
        nav_how_it_works: 'Jak to działa',
        nav_protocol: 'Protokół',
        nav_faq: 'FAQ',
        nav_contact: 'Kontakt',
        hero_eyebrow: 'Opatra London',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Wygaszacz Zmarszczek',
        hero_description: 'Zaawansowane zabiegi korekcyjne skóry. Nieinwazyjna alternatywa dla botoksu.',
        hero_tag1: 'Aplikacja raz w tygodniu',
        hero_tag2: 'Nieinwazyjny · Bezbolesny',
        hero_tag3: '30 sekund na nałożenie',
        hero_tag4: 'Testowany dermatologicznie',
        hero_pill1: 'Nieinwazyjny',
        hero_pill2: 'Testowany Dermatologicznie',
        hero_pill3: '100 Zabiegów',
        hero_pill4: 'Certyfikowany GMP',
        hero_cta_secondary: 'Zobacz jak to działa →',
        hero_guarantee: '30-Dniowa Gwarancja Zwrotu Pieniędzy',
        hero_price_week: 'Mniej niż €3 tygodniowo',
        hero_price_treatments: '100 zabiegów',
        hero_price_supply: 'Zapas na 2 lata',
        add_to_cart: 'Dodaj do Koszyka — €300',
        learn_more: 'Dowiedz się Więcej',
        overview_heading: 'Inna kategoria korekcji',
        overview_intro: 'Reverse Five to nie krem nawilżający maskujący drobne linie tymczasowym nawilżeniem. To ustrukturyzowany protokół korekcyjny zaprojektowany, aby wspierać widoczne ulepszenie z czasem.',
        overview_card1_title: 'Ustrukturyzowany protokół',
        overview_card1_body: 'Zdefiniowany system aplikacji z jasnymi parametrami czasu, częstotliwości i trwania, zaprojektowany dla konsekwentnego, progresywnego ulepszenia.',
        overview_card2_title: 'Korekcja bez igieł',
        overview_card2_body: 'Aplikacja zewnętrzna bez konieczności wstrzyknięć. Zaprojektowana, aby wspierać widoczne wygładzenie bez łamania bariery skórnej.',
        overview_card3_title: 'Uzupełnienie pielęgnacji skóry',
        overview_card3_body: 'Nie zastępuje Twojej rutyny, ale komplementarny zabieg korekcyjny, który działa wraz z istniejącym schematem.',
        what_heading: 'Wsparcie, do jakiego produkt jest zaprojektowany',
        what_benefit1: 'Pomaga poprawić wygląd linii mimicznych, wspierając gładszy wygląd z czasem',
        what_benefit2: 'Zaprojektowany, aby zmniejszyć widoczność obrzęków, szczególnie w okolicy pod oczami',
        what_benefit3: 'Wspiera poprawę widocznej jędrności i kolorytu skóry',
        what_benefit4: 'Wspiera naturalną aktywność kolagenu skóry, nie zawierając samego kolagenu',
        what_benefit5: 'Sformułowany do precyzyjnej aplikacji na docelowe obszary widocznych problemów',
        what_benefit6: 'Odpowiedni do stosowania na wrażliwej skórze z wyłącznie zewnętrznym zastosowaniem',
        stats_heading: 'Wyniki & Statystyki',
        stats_subtext: 'Widoczne poprawy i wyniki przy konsekwentnym stosowaniu',
        stats_wrinkle_headline: 'Redukcja widocznych zmarszczek i drobnych linii',
        stats_wrinkle_subtext: 'Przy konsekwentnym, cotygodniowym stosowaniu',
        stats_eyelid_headline: 'Uniesienie powieki',
        stats_eyelid_subtext: 'Może pomóc zmniejszyć widoczność obrzęków i wesprzeć wygląd górnej powieki',
        stats_maintenance_headline: 'Utrzymane wyniki',
        stats_maintenance_subtext: 'Po ukończeniu pełnego protokołu, wyniki mogą być utrzymane długoterminowo',
        stats_disclaimer: 'Wyniki indywidualne mogą się różnić. Niektóre osoby mogą zaobserwować maksymalne efekty już po 4 tygodniach.',
        stats_photo_note: 'Zdjęcia zostały lekko poddane edycji, aby wyglądały bardziej estetycznie. Kliknij dowolne zdjęcie, aby zobaczyć oryginał.',
        view_original: 'Zobacz Oryginał',
        view_edited: 'Zobacz Edytowane',
        how_heading: 'Jak to działa',
        how_activation_heading: 'Mechanizm aktywacji',
        how_activation_p1: 'Reverse Five wymaga minimum 5-godzinnego okna aktywacji po aplikacji. W tym czasie zabieg oddziałuje z naturalnymi procesami Twojej skóry. Nie myj ani nie pocieraj obszarów poddanych zabiegowi w tym oknie aktywacji.',
        how_activation_p2: 'Po minimum 5 godzinach możesz kontynuować swoją normalną rutynę pielęgnacyjną. Formuła została zaprojektowana, aby działać stopniowo przy konsekwentnym, cotygodniowym stosowaniu.',
        how_ingredients_heading: 'System kluczowych składników',
        how_ingredient1_title: 'Peptydy',
        how_ingredient1_body: 'Wspierają procesy strukturalnego ulepszania skóry i pomagają poprawić widoczny wygląd jędrności.',
        how_ingredient2_title: 'Kwas Hialuronowy',
        how_ingredient2_body: 'Zapewnia wsparcie nawilżenia powierzchniowego i pomaga utrzymać równowagę wilgotności skóry podczas procesu korekcji.',
        how_ingredient3_title: 'Kompleks Komórek Macierzystych',
        how_ingredient3_body: 'Zaprojektowany, aby wspierać naturalną aktywność odnawiania skóry i widoczne ulepszenie z czasem.',
        protocol_heading: 'Protokół użycia',
        protocol_intro: 'Reverse Five podąża za ustrukturyzowanym protokołem korekcyjnym ze zdefiniowanymi parametrami częstotliwości, czasu i trwania. Konsekwencja jest podstawą widocznego ulepszenia.',
        protocol_step1_title: 'Aplikacja cotygodniowa',
        protocol_step1_body: 'Aplikuj raz w tygodniu na docelowe obszary. Nie przekraczaj zalecanej częstotliwości.',
        protocol_step2_title: 'Okno aktywacji',
        protocol_step2_body: 'Pozwól na minimum 5 godzin na aktywację. Brak mycia lub pocierania w tym czasie.',
        protocol_step3_title: 'Konsekwencja',
        protocol_step3_body: 'Jedna strzykawka zapewnia około 100 aplikacji, zaprojektowanych na dwa lata przy cotygodniowym stosowaniu.',
        protocol_step4_title: 'Faza utrzymania',
        protocol_step4_body: 'Po ukończeniu protokołu, widoczne wyniki mogą być utrzymane przez 6–18 miesięcy.',
        protocol_summary_heading: 'Podsumowanie Protokołu',
        protocol_row1_label: 'Częstotliwość',
        protocol_row1_value: 'Raz w tygodniu',
        protocol_row2_label: 'Aktywacja',
        protocol_row2_value: 'Minimum 5 godzin',
        protocol_row3_label: 'Aplikacje',
        protocol_row3_value: '~100 na strzykawkę',
        protocol_row4_label: 'Czas trwania',
        protocol_row4_value: '~2 lata użytkowania',
        protocol_row5_label: 'Utrzymanie',
        protocol_row5_value: '6–18 miesięcy',
        important_heading: 'Ważne wytyczne',
        important_intro: 'Postępuj zgodnie z tymi wytycznymi, aby zapewnić optymalne warunki dla protokołu zabiegowego.',
        important_do_title: 'Robić',
        important_do_item1: 'Aplikować na czystą, suchą skórę',
        important_do_item2: 'Pozwolić na minimum 5-godzinne okno aktywacji',
        important_do_item3: 'Aplikować tylko raz w tygodniu',
        important_do_item4: 'Używać precyzyjnej aplikacji na docelowe obszary',
        important_do_item5: 'Stosować się do konsekwentnego, cotygodniowego harmonogramu',
        important_avoid_title: 'Unikać',
        important_avoid_item1: 'Mycia twarzy podczas okna aktywacji',
        important_avoid_item2: 'Pocierania lub dotykania obszarów poddanych zabiegowi',
        important_avoid_item3: 'Przekraczania częstotliwości cotygodniowej',
        important_avoid_item4: 'Aplikowania na głębokie bruzdy nosowo-wargowe',
        important_avoid_item5: 'Stosowania wewnętrznego (tylko zewnętrzne)',
        important_card_title: 'Tylko do użytku zewnętrznego',
        important_card_body: 'Reverse Five został zaprojektowany wyłącznie do aplikacji zewnętrznej. Nie spożywać ani aplikować na błony śluzowe lub uszkodzoną skórę. W przypadku podrażnienia zaprzestać stosowania i skonsultować się z profesjonalistą medycznym.',
        why_heading: 'Dlaczego jest inny',
        why_intro: 'Reverse Five reprezentuje odrębne podejście do widocznej korekcji skóry, ustrukturyzowane jako protokół, a nie codzienny produkt do pielęgnacji skóry.',
        why_traditional_label: 'Tradycyjne kremy',
        why_traditional_heading: 'Podejście nawilżania powierzchniowego',
        why_traditional_item1: 'Głównie oparte na nawilżeniu',
        why_traditional_item2: 'Krótkotrwały efekt wypełnienia',
        why_traditional_item3: 'Wymaga codziennej aplikacji',
        why_traditional_item4: 'Tymczasowa, widoczna poprawa',
        why_traditional_item5: 'Wyniki szybko znikają po zaprzestaniu',
        why_botox_label: 'Zastrzyki Botox®',
        why_botox_heading: 'Kliniczne podejście z neurotoksyną',
        why_botox_item1: 'Wstrzykiwany bezpośrednio w mięśnie twarzy',
        why_botox_item2: 'Unieruchamia ruch, wygładzając zmarszczki',
        why_botox_item3: 'Wizyta w klinice wymagana co 3–4 miesiące',
        why_botox_item4: '€200–€400 za sesję zabiegową',
        why_botox_item5: 'Możliwe siniaki, obrzęk, czas rekonwalescencji',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Ustrukturyzowany protokół korekcyjny',
        why_reverse_item1: 'Zaprojektowany dla progresywnego ulepszenia',
        why_reverse_item2: 'System cotygodniowej aplikacji',
        why_reverse_item3: 'Zdefiniowane wymagania aktywacji',
        why_reverse_item4: 'Wspiera naturalną aktywność kolagenu',
        why_reverse_item5: 'Faza utrzymania po ukończeniu protokołu',
        why_reverse_item6: 'Nieinwazyjne, alternatywne podejście',
        faq_heading: 'Często zadawane pytania',
        faq_q1: 'Czy zastępuje moją rutynę pielęgnacyjną?',
        faq_a1: 'Nie. Reverse Five to komplementarny zabieg korekcyjny zaprojektowany do działania wraz z istniejącą rutyną pielęgnacyjną. Kontynuuj używanie zwykłych środków oczyszczających, kremów nawilżających i serum. Aplikuj Reverse Five raz w tygodniu zgodnie z wytycznymi protokołu.',
        faq_q2: 'Jak często go używać?',
        faq_a2: 'Tylko raz w tygodniu. Protokół został zaprojektowany do cotygodniowej aplikacji z minimum 5-godzinnym oknem aktywacji. Nie przekraczaj tej częstotliwości, ponieważ zabieg wymaga czasu na współpracę z naturalnymi procesami Twojej skóry między aplikacjami.',
        faq_q3: 'Kiedy mogę umyć twarz po nałożeniu?',
        faq_a3: 'Poczekaj minimum 5 godzin po aplikacji przed umyciem twarzy. W tym oknie aktywacji unikaj mycia lub pocierania obszarów poddanych zabiegowi. Po 5 godzinach możesz wznowić normalną rutynę pielęgnacyjną.',
        faq_q4: 'Gdzie nie powinienem aplikować?',
        faq_a4: 'Reverse Five nie jest przeznaczony do głębokich bruzd nosowo-wargowych. Skup aplikację na liniach mimicznych w docelowych obszarach: górna powieka, pod oczami, kurze łapki, linie czołowe, zmarszczki między brwiami (tzw. jedenastki) oraz linie górnej i dolnej wargi. Unikaj aplikacji na uszkodzoną skórę lub błony śluzowe.',
        faq_q5: 'Czy jest odpowiedni dla wrażliwej skóry?',
        faq_a5: 'Tak. Reverse Five jest sformułowany tak, aby być odpowiednim dla wrażliwej skóry z wyłącznie zewnętrznym zastosowaniem. Jeśli wystąpi podrażnienie, zaprzestań stosowania i skonsultuj się z profesjonalistą medycznym.',
        faq_q6: 'Jak długo wystarcza jedna strzykawka?',
        faq_a6: 'Jedna strzykawka zapewnia około 100 aplikacji. Przy zalecanej częstotliwości cotygodniowej jest zaprojektowana, aby wystarczyć na około dwa lata konsekwentnego stosowania zgodnie z protokołem.',
        faq_q7: 'Jakiego czasu oczekiwania na wyniki powinienem się spodziewać?',
        faq_a7: 'Reverse Five został zaprojektowany jako protokół progresywnego ulepszania, a nie natychmiastowe rozwiązanie. Widoczne wyniki rozwijają się stopniowo przy konsekwentnym, cotygodniowym stosowaniu. Po ukończeniu pełnego protokołu (około dwa lata), wyniki mogą być utrzymane przez 6–18 miesięcy.',
        faq_q8: 'Czy mogę łączyć z innymi produktami?',
        faq_a8: 'Tak, Reverse Five został zaprojektowany do działania wraz z istniejącą rutyną pielęgnacyjną. Jednak w trakcie 5-godzinnego okna aktywacji nie aplikuj innych produktów na obszary poddane zabiegowi. Po aktywacji wznów normalny schemat produktów.',
        cta_title: 'Doświadcz różnicy',
        cta_description: 'Rozpocznij swój ustrukturyzowany protokół korekcyjny już dziś. Jedna strzykawka. Dwa Lata. Widoczne ulepszenie.',
        cta_button: 'Dodaj do Koszyka — €300',
        footer_note1: 'Informacyjna strona produktu • Zero Lines',
        footer_note2: 'Opatra London • Reverse Five Wrinkle Eraser',
        cart_title: 'Twój Koszyk',
        cart_empty: 'Twój koszyk jest pusty',
        cart_total: 'Suma',
        checkout: 'Zamówienie',
        checkout_note: 'Bezpieczna płatność przez Stripe',
        reviews_heading: 'Co mówią nasi klienci',
        reviews_subtext: 'Prawdziwe doświadczenia od prawdziwych ludzi. Dołącz do ponad 3000 zadowolonych klientów, którzy sprawili, że Reverse Five stał się częścią ich codziennej rutyny.',
        reviews_write_btn: 'Napisz recenzję',
        reviews_modal_title: 'Podziel się swoim doświadczeniem',
        reviews_modal_desc: 'Twoja opinia pomoże innym odkryć Reverse Five.',
        reviews_label_name: 'Twoje imię',
        reviews_label_email: 'E-mail',
        reviews_label_rating: 'Twoja ocena',
        reviews_label_text: 'Twoja recenzja',
        reviews_submit_btn: 'Prześlij recenzję',
        contact_title: 'Skontaktuj się',
        contact_desc: 'Masz pytania dotyczące Reverse Fivea? Nasz zespół jest tutaj, aby Ci pomóc. Niezależnie od tego, czy potrzebujesz wskazówek dotyczących protokołu, informacji o wysyłce czy czegokolwiek innego — wyślij nam wiadomość.',
        contact_whatsapp: 'WhatsApp Us<br><small>+350 5400 5198</small>',
        contact_email: 'Wyślij do nas e-mail<br><small>info@zerolines.life</small>',
        contact_label_name: 'Nazwa',
        contact_label_email: 'E-mail',
        contact_label_subject: 'Temat',
        contact_subject_default: 'Wybierz temat',
        contact_subject_product: 'Pytanie dotyczące produktu',
        contact_subject_shipping: 'Wysyłka i dostawa',
        contact_subject_protocol: 'Protokół użytkowania',
        contact_subject_order: 'Zapytanie o zamówienie',
        contact_subject_other: 'Coś innego',
        contact_label_message: 'Wiadomość',
        contact_send_btn: 'Wyślij wiadomość',
        contact_response_note: 'Zwykle odpowiadamy w ciągu 24 godzin.',
        newsletter_title: 'Dołącz do społeczności Zero Lines',
        newsletter_desc: 'Uzyskaj ekskluzywne wskazówki, wcześniejszy dostęp do nowych produktów i 10% rabatu na pierwsze zamówienie.',
        newsletter_subscribe: 'Subskrybować',
        newsletter_note: 'Żadnego spamu. Zrezygnuj z subskrypcji w dowolnym momencie.',
        footer_desc: 'Zaawansowane zabiegi korygujące skórę zaprojektowane z myślą o widocznym i trwałym wygładzeniu.',
        footer_product: 'Produkt',
        footer_support: 'Wsparcie',
        footer_legal: 'Prawny',
        mobile_sticky_shipping: 'Darmowa wysyłka',
        guarantee_text: '30-dniowa gwarancja satysfakcji',
        trust_dermatologist: 'Testowany dermatologicznie',
        trust_cruelty_free: 'Bez okrucieństwa',
        trust_free_shipping: 'Bezpłatna wysyłka na cały świat',
        nav_where_to_apply: 'Strefy zastosowania',
        where_heading: 'Gdzie złożyć wniosek',
        where_intro: 'Reverse Five przeznaczony jest do precyzyjnego nakładania na wybrane obszary, na których widoczne są zmarszczki mimiczne i zmiany objętości.',
        zone_forehead: 'Linie na czole',
        zone_forehead_desc: 'Poziome zmarszczki mimiczne na czole.',
        zone_frown: 'Zmarszczki (11 s)',
        zone_frown_desc: 'Pionowe linie między brwiami.',
        zone_upper_eyelid: 'Górna powieka',
        zone_upper_eyelid_desc: 'Nad zmarszczkami oczu dla widocznego wsparcia jędrności.',
        zone_under_eye: 'Pod Okiem',
        zone_under_eye_desc: 'Poniżej dolnej linii rzęs, aby celować w obrzęki i linie.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'Zewnętrzne kąciki oczu.',
        zone_upper_lip: 'Górna warga',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Dolna warga',
        zone_lower_lip_desc: 'Poniżej linii dolnej wargi.',
        zone_not_intended: 'Nie jest przeznaczony do głębokich fałd nosowo-wargowych (linii biegnących od nosa do kącików ust).',

        label_philosophy: 'Filozofia',
        label_difference: 'Różnica',
        label_results: 'Wyniki Kliniczne',
        label_approach: 'Podejście',
        label_experts: 'Zaufane przez Profesjonalistów',
        label_targets: 'Na Co Działa',
        label_mechanism: 'Mechanizm',
        label_areas: 'Strefy Działania',
        label_protocol: 'Protokół',
        label_safety: 'Bezpieczeństwo Ponad Wszystko',
        label_questions: 'Częste Pytania',
        label_reviews: 'Prawdziwi Ludzie',
        philosophy_title: 'Aktywuj Swoje Ciało. Pozwól Naturze Zrobić Resztę.',
        philosophy_intro: 'Zero Lines powstało w oparciu o prostą prawdę: Twoje ciało już wie, jak się regenerować.',
        philosophy_card1_title: 'Nie Maskuj. Koryguj.',
        philosophy_card1_body: 'Tradycyjne kremy zalewają skórę zewnętrznym kolagenem i syntetycznymi wypełniaczami. Efekt znika w momencie zaprzestania stosowania. Reverse Five tworzy warunki, w których skóra koryguje się sama.',
        philosophy_card2_title: 'Sygnał, Nie Dopełnienie.',
        philosophy_card2_body: 'Nasz kompleks peptydowy wysyła sygnał do fibroblastów skóry, aby reaktywowały swój naturalny cykl produkcji kolagenu. Nie dostarczamy kolagenu. Uczymy Twojego ciała, aby wytwarzało go ponownie.',
        philosophy_card3_title: 'Wyniki, Które Trwają.',
        philosophy_card3_body: 'Ponieważ korekta pochodzi z wewnątrz, rezultaty utrzymują się od 6 do 18 miesięcy po zakończeniu protokołu. Bez codziennego uzależnienia. Bez kończących się cykli produktowych.',
        philosophy_card4_title: 'Dwa Lata. Jedna Strzykawka.',
        philosophy_card4_body: 'Jeden zabieg tygodniowo. Pięć minut aplikacji. 5-godzinne okno aktywacji. Sześćdziesiąt zabiegów na strzykawkę. Upstrukturyzowane, proste i zaprojektowane dla realnego życia.',
        experts_title: 'Co Mówią Eksperci',
        experts_intro: 'Wiodący dermatolodzy i kosmetolodzy o nauce stojącej za korektą skóry opartą na peptydach.',
        expert1_quote: 'Spośród wszystkich protokołów miejscowych, które oceniałam, koncentracja peptydów i mechanizm aktywacji Reverse Five dostarczają najbardziej spójnych widocznych rezultatów. 5-godzinne okno pozwala na prawdziwą interakcję komórkową, a nie powierzchniowe pokrycie.',
        expert1_stat_label: 'Zadowolenie Pacjentów',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Dermatolog z Certyfikatem<br>Harvard Medical School',
        expert2_quote: 'Podejście sygnalizacyjne peptydów jest naprawdę innowacyjne. Zamiast dodawać zewnętrzny kolagen, nakazuje skórze wznowienie własnej produkcji. Moi pacjenci widzą mierzalne poprawy jędrności i głębokości linii w ciągu 8 do 12 tygodni.',
        expert2_stat_label: 'Widoczna Poprawa',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Specjalista Medycyny Estetycznej<br>Johns Hopkins Dermatology',
        expert3_quote: 'Polecam Reverse Five klientom, którzy chcą prawdziwej korekty strukturalnej bez igieł. Kwas hialuronowy utrzymuje barierę nawilżającą, podczas gdy peptydy wykonują ciężką pracę. To najbliższe zabiegowi klinicznemu, jakie można zastosować w domu.',
        expert3_stat_label: 'Aktywacja Kolagenu',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Główna Kosmetolog Medyczna<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Kremy Drogeryjne',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Głównie nawilżenie powierzchniowe',
        checklist_creams_2: 'Krótkotrwały efekt wypełnienia',
        checklist_creams_3: 'Wymagana codzienna aplikacja',
        checklist_creams_4: 'Brak walidacji klinicznej',
        checklist_creams_5: 'Wyniki znikają po odstawieniu',
        checklist_creams_6: 'Brak mechanizmu aktywacji',
        checklist_reverse_1: 'Protokół aktywacji peptydowej',
        checklist_reverse_2: 'Progresywna korekta strukturalna',
        checklist_reverse_3: 'Raz w tygodniu — 5 min aplikacji',
        checklist_reverse_4: 'Produkcja certyfikowana GMP',
        checklist_reverse_5: 'Wyniki utrzymują się 6–18 miesięcy',
        checklist_reverse_6: '5-godzinne okno aktywacji komórkowej',
    },
    ru: {
        nav_overview: 'Обзор',
        nav_what_it_is: 'Что это',
        nav_results: 'Результаты',
        nav_how_it_works: 'Как это работает',
        nav_protocol: 'Протокол',
        nav_faq: 'Вопросы',
        nav_contact: 'Контакты',
        hero_eyebrow: 'Opatra London',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Стиратель Морщин',
        hero_description: 'Передовая процедура коррекции кожи. Неинвазивная альтернатива ботоксу.',
        hero_tag1: 'Применение раз в неделю',
        hero_tag2: 'Неинвазивно · Безболезненно',
        hero_tag3: '30 секунд на нанесение',
        hero_tag4: 'Протестировано дерматологами',
        hero_pill1: 'Неинвазивный',
        hero_pill2: 'Протестировано Дерматологами',
        hero_pill3: '100 Процедур',
        hero_pill4: 'Сертифицировано GMP',
        hero_cta_secondary: 'Посмотреть, как это работает →',
        hero_guarantee: '30-дневная Гарантия Возврата',
        hero_price_week: 'Менее €3 в неделю',
        hero_price_treatments: '100 процедур',
        hero_price_supply: 'Запас на 2 года',
        add_to_cart: 'Добавить в Корзину — €300',
        learn_more: 'Узнать Больше',
        overview_heading: 'Другая категория коррекции',
        overview_intro: 'Reverse Five — это не увлажняющий крем, маскирующий мелкие линии временным увлажнением. Это структурированный протокол коррекции, разработанный для поддержки видимого улучшения со временем.',
        overview_card1_title: 'Структурированный протокол',
        overview_card1_body: 'Определённая система применения с чёткими параметрами времени, частоты и длительности, разработанная для постоянного прогрессивного улучшения.',
        overview_card2_title: 'Коррекция без игл',
        overview_card2_body: 'Наружное применение без необходимости инъекций. Разработано для поддержки видимого разглаживания без нарушения кожного барьера.',
        overview_card3_title: 'Дополнение к уходу за кожей',
        overview_card3_body: 'Не замена вашей рутине, а дополнительная корректирующая процедура, работающая вместе с существующим режимом.',
        what_heading: 'Для чего разработан этот продукт',
        what_benefit1: 'Помогает улучшить вид мимических морщин, поддерживая более гладкий вид со временем',
        what_benefit2: 'Разработано для уменьшения видимости отёков, особенно в области под глазами',
        what_benefit3: 'Поддерживает улучшение видимой упругости и тона кожи',
        what_benefit4: 'Поддерживает естественную активность коллагена кожи, не содержа самого коллагена',
        what_benefit5: 'Сформулировано для точечного нанесения на целевые зоны видимых проблем',
        what_benefit6: 'Подходит для чувствительной кожи с наружным применением',
        stats_heading: 'Результаты & Статистика',
        stats_subtext: 'Визуальные улучшения и результаты при постоянном использовании',
        stats_wrinkle_headline: 'Уменьшение видимых морщин и мелких линий',
        stats_wrinkle_subtext: 'При постоянном еженедельном использовании',
        stats_eyelid_headline: 'Подтяжка века',
        stats_eyelid_subtext: 'Может помочь уменьшить видимость отёков и поддержать внешний вид верхнего века',
        stats_maintenance_headline: 'Результаты сохраняются',
        stats_maintenance_subtext: 'После завершения полного протокола результаты могут сохраняться в долгосрочной перспективе',
        stats_disclaimer: 'Индивидуальные результаты могут отличаться. Некоторые люди могут увидеть максимальные результаты уже через 4 недели.',
        stats_photo_note: 'Фотографии были слегка отредактированы для более эстетичного вида. Нажмите на любое фото, чтобы увидеть оригинал.',
        view_original: 'Посмотреть Оригинал',
        view_edited: 'Посмотреть Отредактированное',
        how_heading: 'Как это работает',
        how_activation_heading: 'Механизм активации',
        how_activation_p1: 'Reverse Five требует минимального окна активации в 5 часов после нанесения. В течение этого периода процедура взаимодействует с естественными процессами вашей кожи. Не мойте и не трите обработанные зоны в течение этого окна активации.',
        how_activation_p2: 'После минимума в 5 часов вы можете продолжить свою обычную рутину по уходу за кожей. Формула разработана для постепенной работы при постоянном еженедельном использовании.',
        how_ingredients_heading: 'Ключевая система ингредиентов',
        how_ingredient1_title: 'Пептиды',
        how_ingredient1_body: 'Поддерживают структурные процессы улучшения кожи и помогают улучшить видимый вид упругости.',
        how_ingredient2_title: 'Гиалуроновая Кислота',
        how_ingredient2_body: 'Обеспечивает поверхностное увлажнение и помогает поддерживать баланс влажности кожи во время процесса коррекции.',
        how_ingredient3_title: 'Комплекс Стволовых Клеток',
        how_ingredient3_body: 'Разработан для поддержки естественной активности обновления кожи и видимого улучшения со временем.',
        protocol_heading: 'Протокол использования',
        protocol_intro: 'Reverse Five следует структурированному протоколу коррекции с определёнными параметрами частоты, времени и длительности. Последовательность — основа видимого улучшения.',
        protocol_step1_title: 'Еженедельное нанесение',
        protocol_step1_body: 'Наносите раз в неделю на целевые зоны. Не превышайте рекомендуемую частоту.',
        protocol_step2_title: 'Окно активации',
        protocol_step2_body: 'Оставьте минимум 5 часов для активации. Не мыть и не тереть в этот период.',
        protocol_step3_title: 'Последовательность',
        protocol_step3_body: 'Один шприц обеспечивает примерно 100 нанесений, рассчитанных на два года при еженедельном использовании.',
        protocol_step4_title: 'Фаза поддержания',
        protocol_step4_body: 'После завершения протокола видимые результаты могут сохраняться в течение 6–18 месяцев.',
        protocol_summary_heading: 'Резюме Протокола',
        protocol_row1_label: 'Частота',
        protocol_row1_value: 'Раз в неделю',
        protocol_row2_label: 'Активация',
        protocol_row2_value: 'Минимум 5 часов',
        protocol_row3_label: 'Нанесения',
        protocol_row3_value: '~100 на шприц',
        protocol_row4_label: 'Длительность',
        protocol_row4_value: '~2 года использования',
        protocol_row5_label: 'Поддержание',
        protocol_row5_value: '6–18 месяцев',
        important_heading: 'Важные рекомендации',
        important_intro: 'Следуйте этим рекомендациям, чтобы обеспечить оптимальные условия для протокола лечения.',
        important_do_title: 'Делать',
        important_do_item1: 'Наносить на чистую, сухую кожу',
        important_do_item2: 'Оставлять минимальное окно активации в 5 часов',
        important_do_item3: 'Наносить только раз в неделю',
        important_do_item4: 'Использовать точечное нанесение на целевые зоны',
        important_do_item5: 'Следовать постоянному еженедельному графику',
        important_avoid_title: 'Избегать',
        important_avoid_item1: 'Мытья лица в течение окна активации',
        important_avoid_item2: 'Потирания или прикосновения к обработанным зонам',
        important_avoid_item3: 'Превышения еженедельной частоты',
        important_avoid_item4: 'Нанесения на глубокие носогубные складки',
        important_avoid_item5: 'Внутреннего применения (только наружное)',
        important_card_title: 'Только для наружного применения',
        important_card_body: 'Reverse Five разработан исключительно для наружного применения. Не принимать внутрь и не наносить на слизистые оболочки или повреждённую кожу. При раздражении прекратите использование и проконсультируйтесь со специалистом.',
        why_heading: 'Почему это другое',
        why_intro: 'Reverse Five представляет собой отдельный подход к видимой коррекции кожи, структурированный как протокол, а не ежедневное средство по уходу за кожей.',
        why_traditional_label: 'Традиционные кремы',
        why_traditional_heading: 'Подход поверхностного увлажнения',
        why_traditional_item1: 'В основном на основе увлажнения',
        why_traditional_item2: 'Кратковременный эффект упругости',
        why_traditional_item3: 'Требуется ежедневное нанесение',
        why_traditional_item4: 'Временное видимое улучшение',
        why_traditional_item5: 'Результаты быстро исчезают при прекращении',
        why_botox_label: 'Инъекции Botox®',
        why_botox_heading: 'Клинический подход с нейротоксином',
        why_botox_item1: 'Вводится непосредственно в мышцы лица',
        why_botox_item2: 'Блокирует движение для разглаживания морщин',
        why_botox_item3: 'Визит в клинику требуется каждые 3–4 месяца',
        why_botox_item4: '€200–€400 за сеанс лечения',
        why_botox_item5: 'Возможные синяки, отёк, время восстановления',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Структурированный протокол коррекции',
        why_reverse_item1: 'Разработано для прогрессивного улучшения',
        why_reverse_item2: 'Система еженедельного нанесения',
        why_reverse_item3: 'Определённые требования активации',
        why_reverse_item4: 'Поддерживает естественную активность коллагена',
        why_reverse_item5: 'Фаза поддержания после завершения протокола',
        why_reverse_item6: 'Неинвазивный альтернативный подход',
        faq_heading: 'Часто задаваемые вопросы',
        faq_q1: 'Заменяет ли он мою рутину по уходу за кожей?',
        faq_a1: 'Нет. Reverse Five — это дополнительная корректирующая процедура, разработанная для работы вместе с вашей существующей рутиной по уходу за кожей. Продолжайте использовать свои обычные средства для умывания, увлажняющие кремы и сыворотки. Наносите Reverse Five раз в неделю в соответствии с рекомендациями протокола.',
        faq_q2: 'Как часто я должен его использовать?',
        faq_a2: 'Только раз в неделю. Протокол разработан для еженедельного нанесения с минимальным окном активации в 5 часов. Не превышайте эту частоту, так как процедура требует времени для работы с естественными процессами вашей кожи между нанесениями.',
        faq_q3: 'Когда я могу умыть лицо после нанесения?',
        faq_a3: 'Подождите минимум 5 часов после нанесения, прежде чем умывать лицо. В течение этого окна активации избегайте мытья или потирания обработанных зон. Через 5 часов вы можете возобновить свою обычную рутину по уходу за кожей.',
        faq_q4: 'Куда не следует наносить?',
        faq_a4: 'Reverse Five не предназначен для глубоких носогубных складок. Сосредоточьте нанесение на мимических морщинах в целевых зонах: верхнее веко, под глазами, гусиные лапки, лбы морщины, межбровные морщины (11) и морщины верхней и нижней губы. Избегайте нанесения на повреждённую кожу или слизистые оболочки.',
        faq_q5: 'Подходит ли для чувствительной кожи?',
        faq_a5: 'Да. Reverse Five сформулирован так, чтобы подходить для чувствительной кожи с исключительно наружным применением. При возникновении раздражения прекратите использование и проконсультируйтесь со специалистом.',
        faq_q6: 'Как долго хватает одного шприца?',
        faq_a6: 'Один шприц обеспечивает примерно 100 нанесений. При рекомендуемой еженедельной частоте он рассчитан примерно на два года постоянного использования в соответствии с протоколом.',
        faq_q7: 'Какого графика результатов мне ожидать?',
        faq_a7: 'Reverse Five разработан как протокол прогрессивного улучшения, а не мгновенное решение. Видимые результаты развиваются постепенно при постоянном еженедельном использовании. После завершения полного протокола (примерно год) результаты могут сохраняться в течение 6–18 месяцев.',
        faq_q8: 'Могу ли я сочетать с другими продуктами?',
        faq_a8: 'Да, Reverse Five разработан для работы вместе с вашей существующей рутиной по уходу за кожей. Однако в течение 5-часового окна активации не наносите другие продукты на обработанные зоны. После активации возобновите свой обычный режим продуктов.',
        cta_title: 'Испытайте разницу',
        cta_description: 'Начните свой структурированный протокол коррекции сегодня. Один шприц. Два года. Видимое улучшение.',
        cta_button: 'Добавить в Корзину — €300',
        footer_note1: 'Информационная страница продукта • Zero Lines',
        footer_note2: 'Opatra London • Reverse Five Wrinkle Eraser',
        cart_title: 'Ваша Корзина',
        cart_empty: 'Ваша корзина пуста',
        cart_total: 'Итого',
        checkout: 'Оформить Заказ',
        checkout_note: 'Безопасная оплата через Stripe',
        reviews_heading: 'Что говорят наши клиенты',
        reviews_subtext: 'Реальный опыт реальных людей. Присоединяйтесь к более чем 3000 довольных клиентов, которые сделали Reverse Five частью своей повседневной жизни.',
        reviews_write_btn: 'Написать отзыв',
        reviews_modal_title: 'Поделитесь своим опытом',
        reviews_modal_desc: 'Ваш отзыв поможет другим узнать Reverse Five.',
        reviews_label_name: 'Ваше имя',
        reviews_label_email: 'Электронная почта',
        reviews_label_rating: 'Ваш рейтинг',
        reviews_label_text: 'Ваш отзыв',
        reviews_submit_btn: 'Отправить отзыв',
        contact_title: 'Свяжитесь с нами',
        contact_desc: 'Есть вопросы о Юбари Кинге? Наша команда здесь, чтобы помочь. Если вам нужны инструкции по протоколу, информации о доставке или что-то еще — отправьте нам сообщение.',
        contact_whatsapp: 'WhatsApp<br><small>+350 5400 5198</small>',
        contact_email: 'Напишите нам<br><small>info@zerolines.life</small>',
        contact_label_name: 'Имя',
        contact_label_email: 'Электронная почта',
        contact_label_subject: 'Предмет',
        contact_subject_default: 'Выберите тему',
        contact_subject_product: 'Вопрос о продукте',
        contact_subject_shipping: 'Доставка и доставка',
        contact_subject_protocol: 'Протокол использования',
        contact_subject_order: 'Заказать запрос',
        contact_subject_other: 'Что-то еще',
        contact_label_message: 'Сообщение',
        contact_send_btn: 'Отправить сообщение',
        contact_response_note: 'Обычно мы отвечаем в течение 24 часов.',
        newsletter_title: 'Присоединяйтесь к сообществу Zero Lines',
        newsletter_desc: 'Получите эксклюзивные советы, ранний доступ к новым продуктам и скидку 10 % на первый заказ.',
        newsletter_subscribe: 'Подписаться',
        newsletter_note: 'Никакого спама. Отпишитесь в любое время.',
        footer_desc: 'Передовые процедуры по коррекции кожи, предназначенные для видимого и длительного улучшения.',
        footer_product: 'Продукт',
        footer_support: 'Поддерживать',
        footer_legal: 'Юридический',
        mobile_sticky_shipping: 'Бесплатная доставка',
        guarantee_text: '30-дневная гарантия качества',
        trust_dermatologist: 'Протестировано дерматологами',
        trust_cruelty_free: 'Без жестокости',
        trust_free_shipping: 'Бесплатная доставка по всему миру',
        nav_where_to_apply: 'Зоны применения',
        where_heading: 'Где подать заявку',
        where_intro: 'Reverse Five предназначен для точного нанесения на целевые области с видимыми признаками мимических морщин и изменения объема.',
        zone_forehead: 'Линии лба',
        zone_forehead_desc: 'Горизонтальные мимические морщины на лбу.',
        zone_frown: 'Линии нахмуренного взгляда (11 с)',
        zone_frown_desc: 'Вертикальные линии между бровями.',
        zone_upper_eyelid: 'Верхнее веко',
        zone_upper_eyelid_desc: 'Над складкой вокруг глаз для видимой поддержки упругости.',
        zone_under_eye: 'Под глазом',
        zone_under_eye_desc: 'Под нижней линией ресниц, чтобы устранить отечность и морщины.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'Внешние уголки глаз.',
        zone_upper_lip: 'Верхняя губа',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Нижняя губа',
        zone_lower_lip_desc: 'Ниже линии нижней губы.',
        zone_not_intended: 'Не предназначен для глубоких носогубных складок (линий, идущих от уголков носа к уголкам рта).',

        label_philosophy: 'Философия',
        label_difference: 'Отличие',
        label_results: 'Клинические Результаты',
        label_approach: 'Подход',
        label_experts: 'Доверие Профессионалов',
        label_targets: 'На Что Оно Влияет',
        label_mechanism: 'Механизм',
        label_areas: 'Зоны Воздействия',
        label_protocol: 'Протокол',
        label_safety: 'Безопасность Превыше Всего',
        label_questions: 'Частые Вопросы',
        label_reviews: 'Реальные Люди',
        philosophy_title: 'Активируйте Свое Тело. Пусть Природа Сделает Остальное.',
        philosophy_intro: 'Zero Lines основана на простой истине: ваше тело уже знает, как исцелять себя.',
        philosophy_card1_title: 'Не Маскируйте. Корректируйте.',
        philosophy_card1_body: 'Традиционные кремы насыщают кожу внешним коллагеном и синтетическими наполнителями. Эффект исчезает, как только вы прекращаете использовать их. Reverse Five создает условия, при которых ваша кожа корректирует себя сама.',
        philosophy_card2_title: 'Сигнализируйте, Не Добавляйте.',
        philosophy_card2_body: 'Наш пептидный комплекс подает сигнал фибробластам вашей кожи, чтобы они реактивировали свой естественный цикл производства коллагена. Мы не даем вам коллаген. Мы учим ваше тело производить его снова.',
        philosophy_card3_title: 'Результаты, Которые Сохраняются.',
        philosophy_card3_body: 'Поскольку коррекция идет изнутри, результаты сохраняются от 6 до 18 месяцев после завершения протокола. Никакой ежедневной зависимости. Никаких бесконечных циклов продуктов.',
        philosophy_card4_title: 'Два Года. Один Шприц.',
        philosophy_card4_body: 'Одно еженедельное применение. Пять минут нанесения. 5-часовое окно активации. Шестьдесят процедур на шприц. Структурировано, просто и разработано для реальной жизни.',
        experts_title: 'Что Говорят Эксперты',
        experts_intro: 'Ведущие дерматологи и косметологи о науке, стоящей за пептидной коррекцией кожи.',
        expert1_quote: 'Из всех местных протоколов, которые я оценивала, концентрация пептидов и механизм активации Reverse Five обеспечивают наиболее стабильные видимые результаты. 5-часовое окно позволяет осуществлять подлинное клеточное взаимодействие, а не поверхностное покрытие.',
        expert1_stat_label: 'Удовлетворенность Пациентов',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Сертифицированный Дерматолог<br>Harvard Medical School',
        expert2_quote: 'Подход сигнализации пептидов является по-настоящему инновационным. Вместо добавления внешнего коллагена он указывает коже возобновить собственное производство. Мои пациенты видят измеримые улучшения упругости и глубины линий в течение 8–12 недель.',
        expert2_stat_label: 'Видимое Улучшение',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Специалист по Эстетической Медицине<br>Johns Hopkins Dermatology',
        expert3_quote: 'Я рекомендую Reverse Five клиентам, которые хотят настоящей структурной коррекции без игл. Гиалуроновая кислота поддерживает влажный барьер, в то время как пептиды выполняют основную работу. Это самое близкое к клинической процедуре, что можно использовать дома.',
        expert3_stat_label: 'Активация Коллагена',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Ведущий Медицинский Косметолог<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Массовые Кремы',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Преимущественно поверхностное увлажнение',
        checklist_creams_2: 'Кратковременный эффект наполнения',
        checklist_creams_3: 'Требуется ежедневное нанесение',
        checklist_creams_4: 'Отсутствие клинической валидации',
        checklist_creams_5: 'Результаты исчезают при отмене',
        checklist_creams_6: 'Отсутствие механизма активации',
        checklist_reverse_1: 'Протокол пептидной активации',
        checklist_reverse_2: 'Прогрессивная структурная коррекция',
        checklist_reverse_3: 'Раз в неделю — 5 мин нанесения',
        checklist_reverse_4: 'Производство сертифицировано по GMP',
        checklist_reverse_5: 'Результаты сохраняются 6–18 месяцев',
        checklist_reverse_6: '5-часовое окно клеточной активации',
    },
    it: {
        nav_overview: 'Panoramica',
        nav_what_it_is: 'Di cosa si tratta',
        nav_results: 'Risultati',
        nav_how_it_works: 'Come funziona',
        nav_protocol: 'Protocollo',
        nav_faq: 'Domande frequenti',
        nav_contact: 'Contatto',
        hero_eyebrow: 'Professionista dell\'Ermetismo',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Gomma antirughe',
        hero_description: 'Trattamento avanzato di correzione della pelle. Alternativa non iniettabile al Botox.',
        hero_tag1: 'Applicazione una volta alla settimana',
        hero_tag2: 'Non invasivo · Non doloroso',
        hero_tag3: '30 secondi per applicare',
        hero_tag4: 'Dermatologicamente testato',
        hero_pill1: 'Non Iniettabile',
        hero_pill2: 'Testato Dermatologicamente',
        hero_pill3: '100 Trattamenti',
        hero_pill4: 'Certificato GMP',
        hero_cta_secondary: 'Scopri come funziona →',
        hero_guarantee: 'Garanzia di Rimborso 30 Giorni',
        hero_price_week: 'Meno di €3 a settimana',
        hero_price_treatments: '100 trattamenti',
        hero_price_supply: 'Scorta di 2 anni',
        add_to_cart: 'Aggiungi al carrello: € 300',
        learn_more: 'Saperne di più',
        overview_heading: 'Una diversa categoria di correzione',
        overview_intro: 'Reverse Five non è una crema idratante che maschera le linee sottili con un\'idratazione temporanea. È un protocollo di correzione strutturato progettato per supportare un miglioramento visibile nel tempo.',
        overview_card1_title: 'Protocollo strutturato',
        overview_card1_body: 'Un sistema di applicazione definito con parametri chiari di tempistica, frequenza e durata, progettato per un affinamento progressivo e coerente.',
        overview_card2_title: 'Correzione senza ago',
        overview_card2_body: 'Applicazione esterna senza necessità di iniezione. Progettato per favorire una levigatura visibile senza rompere la barriera cutanea.',
        overview_card3_title: 'Oltre alla cura della pelle',
        overview_card3_body: 'Non un sostituto della tua routine, ma un trattamento correttivo complementare che funziona insieme al tuo regime esistente.',
        what_heading: 'Cosa è progettato per supportare questo prodotto',
        what_benefit1: 'Aiuta a migliorare l\'aspetto delle rughe d\'espressione, favorendo un aspetto più levigato nel tempo',
        what_benefit2: 'Progettato per ridurre la comparsa di gonfiori, in particolare nella zona sotto gli occhi',
        what_benefit3: 'Supporta il miglioramento della compattezza visibile e del tono della pelle',
        what_benefit4: 'Supporta l\'attività naturale del collagene della pelle senza contenere il collagene stesso',
        what_benefit5: 'Formulato per un\'applicazione di precisione su aree mirate di interesse visibile',
        what_benefit6: 'Adatto per l\'uso su pelli sensibili con applicazione solo esterna',
        stats_heading: 'Risultati e statistiche',
        stats_subtext: 'Miglioramenti visivi e risultati con un uso coerente',
        stats_wrinkle_headline: 'Riduzione delle rughe visibili e delle linee sottili',
        stats_wrinkle_subtext: 'Con un uso settimanale costante',
        stats_eyelid_headline: 'Lifting delle palpebre',
        stats_eyelid_subtext: 'Può aiutare a ridurre la comparsa di gonfiori e sostenere l\'aspetto della palpebra superiore',
        stats_maintenance_headline: 'Risultati mantenuti',
        stats_maintenance_subtext: 'Dopo aver completato il protocollo completo, i risultati possono essere mantenuti a lungo termine',
        stats_disclaimer: 'I risultati individuali possono variare. Alcuni individui possono vedere i massimi risultati già dopo 4 settimane.',
        stats_photo_note: 'Le foto sono state leggermente modificate per una presentazione più pulita. Fare clic su qualsiasi foto per vedere l\'originale.',
        view_original: 'Visualizza originale',
        view_edited: 'Visualizza modificato',
        how_heading: 'Come funziona',
        how_activation_heading: 'Meccanismo di attivazione',
        how_activation_p1: 'Reverse Five richiede un periodo di attivazione minimo di 5 ore dopo l\'applicazione. Durante questo periodo, il trattamento interagisce con i processi naturali della pelle. Non lavare o strofinare le aree trattate durante questa finestra di attivazione.',
        how_activation_p2: 'Dopo un minimo di 5 ore, puoi continuare con la normale routine di cura della pelle. La formulazione è progettata per funzionare progressivamente con un uso settimanale costante.',
        how_ingredients_heading: 'Sistema degli ingredienti chiave',
        how_ingredient1_title: 'Peptidi',
        how_ingredient1_body: 'Supporta i processi di affinamento strutturale della pelle e aiuta a migliorare l\'aspetto visibile della compattezza.',
        how_ingredient2_title: 'Acido ialuronico',
        how_ingredient2_body: 'Fornisce supporto all\'idratazione superficiale e aiuta a mantenere l\'equilibrio dell\'umidità della pelle durante il processo di correzione.',
        how_ingredient3_title: 'Complesso di cellule staminali',
        how_ingredient3_body: 'Progettato per supportare la naturale attività di rinnovamento della pelle e il visibile affinamento nel tempo.',
        protocol_heading: 'Protocollo d\'uso',
        protocol_intro: 'Reverse Five segue un protocollo di correzione strutturato con parametri definiti di frequenza, tempistica e durata. La coerenza è il fondamento della raffinatezza visibile.',
        protocol_step1_title: 'Applicazione settimanale',
        protocol_step1_body: 'Applicare una volta alla settimana sulle aree interessate. Non superare la frequenza consigliata.',
        protocol_step2_title: 'Finestra di attivazione',
        protocol_step2_body: 'Consentire almeno 5 ore per l\'attivazione. Nessun lavaggio o sfregamento durante questo periodo.',
        protocol_step3_title: 'Coerenza',
        protocol_step3_body: 'Una siringa fornisce circa 100 applicazioni, progettate per durare due anni con un uso settimanale.',
        protocol_step4_title: 'Fase di manutenzione',
        protocol_step4_body: 'Dopo aver completato il protocollo, i risultati visibili possono essere mantenuti per 6-18 mesi.',
        protocol_summary_heading: 'Riepilogo del protocollo',
        protocol_row1_label: 'Frequenza',
        protocol_row1_value: 'Una volta alla settimana',
        protocol_row2_label: 'Attivazione',
        protocol_row2_value: 'Minimo 5 ore',
        protocol_row3_label: 'Applicazioni',
        protocol_row3_value: '~100 per siringa',
        protocol_row4_label: 'Durata',
        protocol_row4_value: '~2 anni di utilizzo',
        protocol_row5_label: 'Manutenzione',
        protocol_row5_value: '6–18 mesi',
        important_heading: 'Linee guida importanti',
        important_intro: 'Seguire queste linee guida per garantire condizioni ottimali per il protocollo di trattamento.',
        important_do_title: 'Fare',
        important_do_item1: 'Applicare sulla pelle pulita e asciutta',
        important_do_item2: 'Consenti una finestra di attivazione minima di 5 ore',
        important_do_item3: 'Applicare solo una volta alla settimana',
        important_do_item4: 'Utilizzare l\'applicazione di precisione per individuare le aree',
        important_do_item5: 'Seguire un programma settimanale coerente',
        important_avoid_title: 'Evitare',
        important_avoid_item1: 'Lavarsi il viso durante la finestra di attivazione',
        important_avoid_item2: 'Sfregare o toccare le aree trattate',
        important_avoid_item3: 'Frequenza superiore a quella settimanale',
        important_avoid_item4: 'Applicazione sulle pieghe naso-labiali profonde',
        important_avoid_item5: 'Uso interno (solo esterno)',
        important_card_title: 'Solo uso esterno',
        important_card_body: 'Reverse Five è progettato esclusivamente per applicazioni esterne. Non ingerire né applicare su mucose o pelle lesa. Se si verifica irritazione, interrompere l\'uso e consultare un operatore sanitario.',
        why_heading: 'Perché è diverso',
        why_intro: 'Reverse Five rappresenta un approccio distinto alla correzione visibile della pelle, strutturato come un protocollo piuttosto che come un prodotto quotidiano per la cura della pelle.',
        why_traditional_label: 'Creme tradizionali',
        why_traditional_heading: 'Approccio all\'idratazione superficiale',
        why_traditional_item1: 'Principalmente a base di idratazione',
        why_traditional_item2: 'Effetto rimpolpante a breve termine',
        why_traditional_item3: 'È richiesta l\'applicazione quotidiana',
        why_traditional_item4: 'Miglioramento visibile temporaneo',
        why_traditional_item5: 'I risultati diminuiscono rapidamente quando vengono interrotti',
        why_botox_label: 'Iniezioni di Botox®',
        why_botox_heading: 'Approccio neurotossina clinico',
        why_botox_item1: 'Iniettato direttamente nei muscoli facciali',
        why_botox_item2: 'Blocca il movimento per levigare le rughe',
        why_botox_item3: 'Visita clinica richiesta ogni 3–4 mesi',
        why_botox_item4: '€200–€400 a sessione di trattamento',
        why_botox_item5: 'Possibili lividi, gonfiore, tempo di recupero',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Protocollo di correzione strutturata',
        why_reverse_item1: 'Progettato per un raffinamento progressivo',
        why_reverse_item2: 'Sistema di applicazione una volta alla settimana',
        why_reverse_item3: 'Requisiti di attivazione definiti',
        why_reverse_item4: 'Supporta l\'attività naturale del collagene',
        why_reverse_item5: 'Fase di manutenzione dopo il completamento del protocollo',
        why_reverse_item6: 'Approccio alternativo non iniettabile',
        faq_heading: 'Domande frequenti',
        faq_q1: 'Sostituisce la mia routine di cura della pelle?',
        faq_a1: 'No. Reverse Five è un trattamento correttivo complementare ideato per integrarsi con la tua attuale routine di cura della pelle. Continua a usare i normali detergenti, creme idratanti e sieri. Applicare Reverse Five una volta alla settimana secondo le linee guida del protocollo.',
        faq_q2: 'Quanto spesso lo uso?',
        faq_a2: 'Solo una volta alla settimana. Il protocollo è progettato per un\'applicazione settimanale con una finestra di attivazione minima di 5 ore. Non superare questa frequenza, poiché il trattamento richiede tempo per interagire con i processi naturali della pelle tra un\'applicazione e l\'altra.',
        faq_q3: 'Quando posso lavarmi il viso dopo l\'applicazione?',
        faq_a3: 'Attendere almeno 5 ore dopo l\'applicazione prima di lavare il viso. Durante questa finestra di attivazione evitare di lavare o strofinare le zone trattate. Dopo 5 ore, puoi riprendere la normale routine di cura della pelle.',
        faq_q4: 'Dove non dovrei applicarlo?',
        faq_a4: 'Reverse Five non è destinato alle pieghe naso-labiali profonde. Concentrare l\'applicazione sulle rughe di espressione nelle aree target: palpebra superiore, sotto gli occhi, zampe di gallina, rughe della fronte, rughe delle sopracciglia (11) e rughe del labbro superiore e inferiore. Evitare l\'applicazione su pelle lesa o mucose.',
        faq_q5: 'È adatto per la pelle sensibile?',
        faq_a5: 'SÌ. Reverse Five è formulato per essere adatto alla pelle sensibile con applicazione solo esterna. In caso di irritazione, interrompere l\'uso e consultare un operatore sanitario.',
        faq_q6: 'Quanto dura una siringa?',
        faq_a6: 'Una siringa fornisce circa 100 applicazioni. Con la frequenza settimanale consigliata, questo è progettato per durare circa due anni di utilizzo coerente seguendo il protocollo.',
        faq_q7: 'Quale tempistica dei risultati dovrei aspettarmi?',
        faq_a7: 'Reverse Five è concepito come un protocollo di perfezionamento progressivo, non come una soluzione istantanea. Risultati visibili si sviluppano gradualmente con l\'uso settimanale costante. Dopo aver completato il protocollo completo (circa due anni), i risultati possono essere mantenuti per 6-18 mesi.',
        faq_q8: 'Posso abbinarlo ad altri prodotti?',
        faq_a8: 'Sì, Reverse Five è progettato per funzionare insieme alla tua routine di cura della pelle esistente. Tuttavia, durante la finestra di attivazione di 5 ore, non applicare altri prodotti sulle aree trattate. Dopo l\'attivazione, riprendere il normale regime del prodotto.',
        cta_title: 'Sperimenta la differenza',
        cta_description: 'Inizia oggi il tuo protocollo di correzione strutturata. Una siringa. Due anni. Raffinatezza visibile.',
        cta_button: 'Aggiungi al carrello: € 300',
        footer_note1: 'Pagina informativa del prodotto • Zero Lines',
        footer_note2: 'Opatra London • Gomma da cancellare Reverse Five',
        cart_title: 'Il tuo carrello',
        cart_empty: 'Il tuo carrello è vuoto',
        cart_total: 'Totale',
        checkout: 'Guardare',
        checkout_note: 'Pagamento sicuro tramite Stripe',
        reviews_heading: 'Cosa dicono i nostri clienti',
        reviews_subtext: 'Esperienze vere da persone vere. Unisciti agli oltre 3.000 clienti soddisfatti che hanno reso Reverse Five parte della loro routine.',
        reviews_write_btn: 'Scrivi una recensione',
        reviews_modal_title: 'Condividi la tua esperienza',
        reviews_modal_desc: 'Il tuo feedback aiuta gli altri a scoprire Reverse Five.',
        reviews_label_name: 'Il tuo nome',
        reviews_label_email: 'E-mail',
        reviews_label_rating: 'La tua valutazione',
        reviews_label_text: 'La tua recensione',
        reviews_submit_btn: 'Invia recensione',
        contact_title: 'Mettiti in contatto',
        contact_desc: 'Hai domande su Reverse Five? Il nostro team è qui per aiutarti. Se hai bisogno di indicazioni sul protocollo, informazioni sulla spedizione o qualsiasi altra cosa, inviaci un messaggio.',
        contact_whatsapp: 'Scrivici su WhatsApp<br><small>+350 5400 5198</small>',
        contact_email: 'Inviaci un\'e-mail<br><small>info@zerolines.life</small>',
        contact_label_name: 'Nome',
        contact_label_email: 'E-mail',
        contact_label_subject: 'Soggetto',
        contact_subject_default: 'Seleziona un argomento',
        contact_subject_product: 'Domanda sul prodotto',
        contact_subject_shipping: 'Spedizione e consegna',
        contact_subject_protocol: 'Protocollo d\'uso',
        contact_subject_order: 'Richiesta di ordine',
        contact_subject_other: 'Qualcos\'altro',
        contact_label_message: 'Messaggio',
        contact_send_btn: 'Invia messaggio',
        contact_response_note: 'Normalmente rispondiamo entro 24 ore.',
        newsletter_title: 'Unisciti alla community di Linee Zero',
        newsletter_desc: 'Ottieni suggerimenti esclusivi, accesso anticipato a nuovi prodotti e uno sconto del 10% sul tuo primo ordine.',
        newsletter_subscribe: 'Iscriviti',
        newsletter_note: 'Niente spam. Annulla l\'iscrizione in qualsiasi momento.',
        footer_desc: 'Trattamenti avanzati di correzione della pelle progettati per un miglioramento visibile e duraturo.',
        footer_product: 'Prodotto',
        footer_support: 'Supporto',
        footer_legal: 'Legale',
        mobile_sticky_shipping: 'Spedizione gratuita',
        guarantee_text: 'Garanzia di soddisfazione di 30 giorni',
        trust_dermatologist: 'Dermatologicamente testato',
        trust_cruelty_free: 'Crudeltà libera',
        trust_free_shipping: 'Spedizione gratuita in tutto il mondo',
        nav_where_to_apply: 'Zone di applicazione',
        where_heading: 'Dove presentare domanda',
        where_intro: 'Reverse Five è progettato per un\'applicazione di precisione su aree mirate che mostrano segni visibili di rughe di espressione e cambiamenti di volume.',
        zone_forehead: 'Linee della fronte',
        zone_forehead_desc: 'Rughe di espressione orizzontali sulla fronte.',
        zone_frown: 'Rughe accigliate (11s)',
        zone_frown_desc: 'Linee verticali tra le sopracciglia.',
        zone_upper_eyelid: 'Palpebra superiore',
        zone_upper_eyelid_desc: 'Sopra la piega dell\'occhio per un sostegno visibile della fermezza.',
        zone_under_eye: 'Sotto gli occhi',
        zone_under_eye_desc: 'Sotto la linea delle ciglia inferiori per contrastare gonfiori e rughe.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'Gli angoli esterni degli occhi.',
        zone_upper_lip: 'Labbro superiore',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Labbro inferiore',
        zone_lower_lip_desc: 'Sotto la linea del labbro inferiore.',
        zone_not_intended: 'Non destinato alle pieghe naso-labiali profonde (le linee che vanno dal naso agli angoli della bocca).',

        label_philosophy: 'La Filosofia',
        label_difference: 'La Differenza',
        label_results: 'Risultati Clinici',
        label_approach: 'L\'Approccio',
        label_experts: 'Scelto dai Professionisti',
        label_targets: 'A Cosa Agisce',
        label_mechanism: 'Il Meccanismo',
        label_areas: 'Aree di Azione',
        label_protocol: 'Il Protocollo',
        label_safety: 'La Sicurezza Prima di Tutto',
        label_questions: 'Domande Frequenti',
        label_reviews: 'Persone Reali',
        philosophy_title: 'Attiva il Tuo Corpo. Lascia che la Natura faccia il Resto.',
        philosophy_intro: 'Zero Lines è fondata su una verità semplice: il tuo corpo sa già come curarsi da sé.',
        philosophy_card1_title: 'Non Mascherare. Correggi.',
        philosophy_card1_body: 'Le creme tradizionali inondano la pelle di collagene esterno e riempitivi sintetici. L\'effetto svanisce nel momento in cui smetti. Reverse Five crea le condizioni affinché la tua pelle si corregga da sé.',
        philosophy_card2_title: 'Segnala, Non Aggiungere.',
        philosophy_card2_body: 'Il nostro complesso peptidico segnala ai fibroblasti della tua pelle di riattivare il loro ciclo naturale di produzione di collagene. Non ti diamo collagene. Insegniamo al tuo corpo a produrlo di nuovo.',
        philosophy_card3_title: 'Risultati che Durano.',
        philosophy_card3_body: 'Poiché la correzione viene dall\'interno, i risultati si mantengono da 6 a 18 mesi dopo il completamento del protocollo. Nessuna dipendenza giornaliera. Nessun ciclo infinito di prodotti.',
        philosophy_card4_title: 'Due Anni. Una Siringa.',
        philosophy_card4_body: 'Un trattamento settimanale. Cinque minuti di applicazione. Una finestra di attivazione di 5 ore. Sessanta trattamenti per siringa. Strutturato, semplice e progettato per la vita reale.',
        experts_title: 'Cosa Dicono gli Esperti',
        experts_intro: 'Dermatologi ed estetiste di spicco sulla scienza alla base della correzione della pelle a base di peptidi.',
        expert1_quote: 'Tra tutti i protocolli topici che ho valutato, la concentrazione di peptidi e il meccanismo di attivazione di Reverse Five offrono i risultati visivi più consistenti. La finestra di 5 ore consente un\'interazione cellulare genuina anziché un semplice rivestimento superficiale.',
        expert1_stat_label: 'Soddisfazione del Paziente',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Dermatologa Certificata<br>Harvard Medical School',
        expert2_quote: 'L\'approccio di segnalazione peptidica è genuinamente innovativo. Invece di aggiungere collagene esterno, istruisce la pelle a riprendere la propria produzione. I miei pazienti vedono miglioramenti misurabili in compattezza e profondità delle linee entro 8-12 settimane.',
        expert2_stat_label: 'Miglioramento Visibile',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Specialista in Medicina Estetica<br>Johns Hopkins Dermatology',
        expert3_quote: 'Raccomando Reverse Five a clienti che desiderano una vera correzione strutturale senza aghi. L\'acido ialuronico mantiene la barriera idratante mentre i peptidi fanno il lavoro pesante. È la cosa più simile a un trattamento clinico che si possa usare a casa.',
        expert3_stat_label: 'Attivazione del Collagene',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Estetista Medica Capo<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Creme da Consumo',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Principalmente idratazione superficiale',
        checklist_creams_2: 'Effetto rimpolpante a breve termine',
        checklist_creams_3: 'Applicazione quotidiana richiesta',
        checklist_creams_4: 'Nessuna validazione clinica',
        checklist_creams_5: 'I risultati scompaiono se interrotti',
        checklist_creams_6: 'Nessun meccanismo di attivazione',
        checklist_reverse_1: 'Protocollo di attivazione peptidica',
        checklist_reverse_2: 'Correzione strutturale progressiva',
        checklist_reverse_3: 'Una volta a settimana — 5 min di applicazione',
        checklist_reverse_4: 'Produzione certificata GMP',
        checklist_reverse_5: 'Risultati mantenuti 6–18 mesi',
        checklist_reverse_6: 'Finestra di attivazione cellulare di 5 ore',
    },
    nl: {
        nav_overview: 'Overzicht',
        nav_what_it_is: 'Wat het is',
        nav_results: 'Resultaten',
        nav_how_it_works: 'Hoe het werkt',
        nav_protocol: 'Protocol',
        nav_faq: 'Veelgestelde vragen',
        nav_contact: 'Contact',
        hero_eyebrow: 'Opatra Professioneel',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Rimpel gum',
        hero_description: 'Geavanceerde huidcorrectiebehandeling. Niet-injecteerbaar alternatief voor Botox.',
        hero_tag1: 'Een keer per week aanbrengen',
        hero_tag2: 'Niet-invasief · Niet pijnlijk',
        hero_tag3: '30 seconden om aan te vragen',
        hero_tag4: 'Dermatologisch getest',
        hero_pill1: 'Niet-Injiceerbaar',
        hero_pill2: 'Dermatologisch Getest',
        hero_pill3: '100 Behandelingen',
        hero_pill4: 'GMP-Gecertificeerd',
        hero_cta_secondary: 'Zie hoe het werkt →',
        hero_guarantee: '30-Dagen Geld-Terug-Garantie',
        hero_price_week: 'Minder dan €3 per week',
        hero_price_treatments: '100 behandelingen',
        hero_price_supply: '2-jaars voorraad',
        add_to_cart: 'Voeg toe aan winkelwagen — € 300',
        learn_more: 'Meer informatie',
        overview_heading: 'Een andere categorie correctie',
        overview_intro: 'Reverse Five is geen vochtinbrengende crème die fijne lijntjes maskeert met tijdelijke hydratatie. Het is een gestructureerd correctieprotocol dat is ontworpen om zichtbare verfijning in de loop van de tijd te ondersteunen.',
        overview_card1_title: 'Gestructureerd protocol',
        overview_card1_body: 'Een gedefinieerd applicatiesysteem met duidelijke timing-, frequentie- en duurparameters ontworpen voor consistente progressieve verfijning.',
        overview_card2_title: 'Naaldvrije correctie',
        overview_card2_body: 'Externe toepassing zonder injectie. Ontworpen om zichtbare gladheid te ondersteunen zonder de huidbarrière te doorbreken.',
        overview_card3_title: 'Naast huidverzorging',
        overview_card3_body: 'Geen vervanging van uw routine, maar een aanvullende correctiebehandeling die naast uw bestaande regime werkt.',
        what_heading: 'Waar dit product voor is ontworpen',
        what_benefit1: 'Helpt het uiterlijk van expressielijnen te verbeteren en zorgt voor een vloeiender uiterlijk in de loop van de tijd',
        what_benefit2: 'Ontworpen om wallen te verminderen, vooral onder de ogen',
        what_benefit3: 'Ondersteunt de verbetering van de zichtbare stevigheid en huidtint',
        what_benefit4: 'Ondersteunt de natuurlijke collageenactiviteit van de huid zonder collageen zelf te bevatten',
        what_benefit5: 'Geformuleerd voor nauwkeurige toepassing op specifieke zichtbare gebieden',
        what_benefit6: 'Geschikt voor gebruik op een gevoelige huid met uitsluitend uitwendige toepassing',
        stats_heading: 'Resultaten en statistieken',
        stats_subtext: 'Visuele verbeteringen en resultaten bij consistent gebruik',
        stats_wrinkle_headline: 'Vermindering van zichtbare rimpels en fijne lijntjes',
        stats_wrinkle_subtext: 'Bij consistent wekelijks gebruik',
        stats_eyelid_headline: 'Ooglidlift',
        stats_eyelid_subtext: 'Kan wallen helpen verminderen en het uiterlijk van het bovenste ooglid ondersteunen',
        stats_maintenance_headline: 'Resultaten behouden',
        stats_maintenance_subtext: 'Na voltooiing van het volledige protocol kunnen de resultaten langdurig behouden blijven',
        stats_disclaimer: 'Individuele resultaten kunnen variëren. Sommige personen kunnen al na 4 weken maximale resultaten zien.',
        stats_photo_note: 'Foto\'s zijn licht bewerkt voor een strakkere presentatie. Klik op een foto om het origineel te zien.',
        view_original: 'Origineel bekijken',
        view_edited: 'Bekijk bewerkt',
        how_heading: 'Hoe het werkt',
        how_activation_heading: 'Activeringsmechanisme',
        how_activation_p1: 'Reverse Five vereist een activeringsperiode van minimaal 5 uur na aanmelding. Tijdens deze periode werkt de behandeling samen met de natuurlijke processen van uw huid. Was of wrijf de behandelde gebieden niet tijdens deze activeringsperiode.',
        how_activation_p2: 'Na het minimum van 5 uur kunt u doorgaan met uw normale huidverzorgingsroutine. De formulering is ontworpen om geleidelijk te werken bij consistent wekelijks gebruik.',
        how_ingredients_heading: 'Systeem met belangrijke ingrediënten',
        how_ingredient1_title: 'Peptiden',
        how_ingredient1_body: 'Ondersteun de structurele verfijningsprocessen van de huid en help het zichtbare uiterlijk van stevigheid te verbeteren.',
        how_ingredient2_title: 'Hyaluronzuur',
        how_ingredient2_body: 'Biedt ondersteuning bij hydratatie van het oppervlak en helpt de vochtbalans van de huid tijdens het correctieproces op peil te houden.',
        how_ingredient3_title: 'Stamcelcomplex',
        how_ingredient3_body: 'Ontworpen om de natuurlijke vernieuwingsactiviteit van de huid en zichtbare verfijning in de loop van de tijd te ondersteunen.',
        protocol_heading: 'Gebruiksprotocol',
        protocol_intro: 'Reverse Five volgt een gestructureerd correctieprotocol met gedefinieerde frequentie-, timing- en duurparameters. Consistentie is de basis van zichtbare verfijning.',
        protocol_step1_title: 'Wekelijkse toepassing',
        protocol_step1_body: 'Eén keer per week aanbrengen op de doelgebieden. Overschrijd de aanbevolen frequentie niet.',
        protocol_step2_title: 'Activeringsvenster',
        protocol_step2_body: 'Wacht minimaal 5 uur voor activering. Tijdens deze periode niet wassen of wrijven.',
        protocol_step3_title: 'Samenhang',
        protocol_step3_body: 'Eén spuit biedt ongeveer 100 toepassingen, ontworpen om een ​​jaar mee te gaan bij wekelijks gebruik.',
        protocol_step4_title: 'Onderhoudsfase',
        protocol_step4_body: 'Na voltooiing van het protocol kunnen zichtbare resultaten 6 tot 18 maanden aanhouden.',
        protocol_summary_heading: 'Protocolsamenvatting',
        protocol_row1_label: 'Frequentie',
        protocol_row1_value: 'Eén keer per week',
        protocol_row2_label: 'Activering',
        protocol_row2_value: 'Minimaal 5 uur',
        protocol_row3_label: 'Toepassingen',
        protocol_row3_value: '~100 per spuit',
        protocol_row4_label: 'Duur',
        protocol_row4_value: '~2 jaar gebruik',
        protocol_row5_label: 'Onderhoud',
        protocol_row5_value: '6–18 maanden',
        important_heading: 'Belangrijke richtlijnen',
        important_intro: 'Volg deze richtlijnen om optimale omstandigheden voor het behandelprotocol te garanderen.',
        important_do_title: 'Doen',
        important_do_item1: 'Aanbrengen op een schone, droge huid',
        important_do_item2: 'Sta een activeringsperiode van minimaal 5 uur toe',
        important_do_item3: 'Slechts één keer per week toepassen',
        important_do_item4: 'Gebruik precisietoepassing om gebieden te targeten',
        important_do_item5: 'Volg een consistent weekschema',
        important_avoid_title: 'Voorkomen',
        important_avoid_item1: 'Gezicht wassen tijdens activeringsperiode',
        important_avoid_item2: 'Behandelde gebieden wrijven of aanraken',
        important_avoid_item3: 'Overschrijding van de wekelijkse frequentie',
        important_avoid_item4: 'Aanbrengen op diepe nasolabiale plooien',
        important_avoid_item5: 'Intern gebruik (alleen extern)',
        important_card_title: 'Alleen extern gebruik',
        important_card_body: 'Reverse Five is exclusief ontworpen voor externe toepassing. Niet inslikken of aanbrengen op slijmvliezen of beschadigde huid. Als er irritatie optreedt, stop dan met het gebruik en raadpleeg een beroepsbeoefenaar in de gezondheidszorg.',
        why_heading: 'Waarom het anders is',
        why_intro: 'Reverse Five vertegenwoordigt een aparte benadering van zichtbare huidcorrectie, gestructureerd als een protocol in plaats van als een dagelijks huidverzorgingsproduct.',
        why_traditional_label: 'Traditionele crèmes',
        why_traditional_heading: 'Oppervlaktehydratatiebenadering',
        why_traditional_item1: 'Hoofdzakelijk op basis van hydratatie',
        why_traditional_item2: 'Opvuleffect op korte termijn',
        why_traditional_item3: 'Dagelijkse toepassing vereist',
        why_traditional_item4: 'Tijdelijke zichtbare verbetering',
        why_traditional_item5: 'De resultaten nemen snel af wanneer gestopt wordt',
        why_botox_label: 'Botox®-injecties',
        why_botox_heading: 'Klinische neurotoxine-benadering',
        why_botox_item1: 'Rechtstreeks geïnjecteerd in de gezichtsspieren',
        why_botox_item2: 'Bevriest beweging om lijnen te verzachten',
        why_botox_item3: 'Kliniekbezoek vereist elke 3–4 maanden',
        why_botox_item4: '€200–€400 per behandelingssessie',
        why_botox_item5: 'Mogelijk blauwe plekken, zwelling, hersteltijd',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Gestructureerd correctieprotocol',
        why_reverse_item1: 'Ontworpen voor progressieve verfijning',
        why_reverse_item2: 'Een wekelijks applicatiesysteem',
        why_reverse_item3: 'Gedefinieerde activeringsvereisten',
        why_reverse_item4: 'Ondersteunt de natuurlijke collageenactiviteit',
        why_reverse_item5: 'Onderhoudsfase na voltooiing van het protocol',
        why_reverse_item6: 'Niet-injecteerbare alternatieve aanpak',
        faq_heading: 'Veelgestelde vragen',
        faq_q1: 'Vervangt het mijn huidverzorgingsroutine?',
        faq_a1: 'Nee. Reverse Five is een aanvullende correctiebehandeling die is ontworpen om naast uw bestaande huidverzorgingsroutine te werken. Blijf uw gewone reinigingsmiddelen, vochtinbrengende crèmes en serums gebruiken. Breng Reverse Five eenmaal per week aan volgens de protocolrichtlijnen.',
        faq_q2: 'Hoe vaak gebruik ik het?',
        faq_a2: 'Slechts één keer per week. Het protocol is ontworpen voor wekelijkse toepassing met een activeringsvenster van minimaal 5 uur. Overschrijd deze frequentie niet, omdat de behandeling tijd nodig heeft om tussen de toepassingen in te werken met de natuurlijke processen van uw huid.',
        faq_q3: 'Wanneer kan ik mijn gezicht wassen na het aanbrengen?',
        faq_a3: 'Wacht minimaal 5 uur na het aanbrengen voordat u uw gezicht wast. Vermijd tijdens deze activeringsperiode het wassen of wrijven van de behandelde gebieden. Na 5 uur kunt u uw normale huidverzorgingsroutine hervatten.',
        faq_q4: 'Waar moet ik het niet toepassen?',
        faq_a4: 'Reverse Five is niet bedoeld voor diepe nasolabiale plooien. Focus de toepassing op expressielijnen in de doelgebieden: bovenste ooglid, onder de ogen, kraaienpootjes, voorhoofdslijnen, fronslijnen (11s) en boven- en onderliplijnen. Vermijd toepassing op beschadigde huid of slijmvliezen.',
        faq_q5: 'Is het geschikt voor de gevoelige huid?',
        faq_a5: 'Ja. Reverse Five is zo samengesteld dat het geschikt is voor de gevoelige huid bij uitsluitend uitwendige toepassing. Als u enige irritatie ervaart, stop dan met het gebruik en raadpleeg een arts.',
        faq_q6: 'Hoe lang gaat één spuit mee?',
        faq_a6: 'Eén spuit biedt ongeveer 100 toepassingen. Met de aanbevolen frequentie van één keer per week is dit ontworpen voor een gebruiksduur van ongeveer twee jaar bij consistent gebruik volgens het protocol.',
        faq_q7: 'Welke resultatentijdlijn moet ik verwachten?',
        faq_a7: 'Reverse Five is ontworpen als een progressief verfijningsprotocol, niet als een kant-en-klare oplossing. Zichtbare resultaten ontwikkelen zich geleidelijk bij consistent wekelijks gebruik. Na voltooiing van het volledige protocol (ongeveer twee jaar) kunnen de resultaten 6 tot 18 maanden behouden blijven.',
        faq_q8: 'Kan ik combineren met andere producten?',
        faq_a8: 'Ja, Reverse Five is ontworpen om naast uw bestaande huidverzorgingsroutine te werken. Breng tijdens de activeringsperiode van 5 uur echter geen andere producten aan op de behandelde gebieden. Na activering hervat u uw normale productregime.',
        cta_title: 'Ervaar het verschil',
        cta_description: 'Start vandaag nog met uw gestructureerde correctieprotocol. Eén spuit. Twee jaar. Zichtbare verfijning.',
        cta_button: 'Voeg toe aan winkelwagen — € 300',
        footer_note1: 'Informatieve productpagina • Zero Lines',
        footer_note2: 'Opatra London • Reverse Five Rimpelgum',
        cart_title: 'Uw winkelwagen',
        cart_empty: 'Uw winkelwagen is leeg',
        cart_total: 'Totaal',
        checkout: 'Afrekenen',
        checkout_note: 'Veilig betalen via Stripe',
        reviews_heading: 'Wat onze klanten zeggen',
        reviews_subtext: 'Echte ervaringen van echte mensen. Sluit u aan bij de ruim 3.000 tevreden klanten die Reverse Five tot onderdeel van hun routine hebben gemaakt.',
        reviews_write_btn: 'Schrijf een recensie',
        reviews_modal_title: 'Deel uw ervaring',
        reviews_modal_desc: 'Jouw feedback helpt anderen Reverse Five te ontdekken.',
        reviews_label_name: 'Uw naam',
        reviews_label_email: 'E-mail',
        reviews_label_rating: 'Uw beoordeling',
        reviews_label_text: 'Uw recensie',
        reviews_submit_btn: 'Beoordeling indienen',
        contact_title: 'Neem contact op',
        contact_desc: 'Heeft u vragen over Reverse Five? Ons team is hier om te helpen. Of u nu advies nodig heeft over het protocol, verzendinformatie of iets anders: stuur ons een bericht.',
        contact_whatsapp: 'WhatsApp ons<br><small>+350 5400 5198</small>',
        contact_email: 'E-mail ons<br><small>info@zerolines.life</small>',
        contact_label_name: 'Naam',
        contact_label_email: 'E-mail',
        contact_label_subject: 'Onderwerp',
        contact_subject_default: 'Selecteer een onderwerp',
        contact_subject_product: 'Productvraag',
        contact_subject_shipping: 'Verzending en levering',
        contact_subject_protocol: 'Gebruiksprotocol',
        contact_subject_order: 'Bestelaanvraag',
        contact_subject_other: 'Iets anders',
        contact_label_message: 'Bericht',
        contact_send_btn: 'Bericht verzenden',
        contact_response_note: 'Wij reageren doorgaans binnen 24 uur.',
        newsletter_title: 'Sluit u aan bij de Zero Lines-community',
        newsletter_desc: 'Ontvang exclusieve tips, vroege toegang tot nieuwe producten en 10% korting op uw eerste bestelling.',
        newsletter_subscribe: 'Abonneer je op',
        newsletter_note: 'Geen spam. U kunt zich op elk gewenst moment afmelden.',
        footer_desc: 'Geavanceerde huidcorrectiebehandelingen ontworpen voor zichtbare, langdurige verfijning.',
        footer_product: 'Artikel',
        footer_support: 'Ondersteuning',
        footer_legal: 'Juridisch',
        mobile_sticky_shipping: 'Gratis verzending',
        guarantee_text: '30 dagen tevredenheidsgarantie',
        trust_dermatologist: 'Dermatologisch getest',
        trust_cruelty_free: 'Wreedheidsvrij',
        trust_free_shipping: 'Gratis wereldwijde verzending',
        nav_where_to_apply: 'Toepassingsgebieden',
        where_heading: 'Waar solliciteren',
        where_intro: 'Reverse Five is ontworpen voor nauwkeurige toepassing op specifieke gebieden die zichtbare tekenen van expressielijnen en volumeveranderingen vertonen.',
        zone_forehead: 'Voorhoofd lijnen',
        zone_forehead_desc: 'Horizontale expressielijnen over het voorhoofd.',
        zone_frown: 'Fronslijnen (11s)',
        zone_frown_desc: 'Verticale lijnen tussen de wenkbrauwen.',
        zone_upper_eyelid: 'Bovenste ooglid',
        zone_upper_eyelid_desc: 'Boven de oogplooi voor zichtbare stevigheidsondersteuning.',
        zone_under_eye: 'Onder oog',
        zone_under_eye_desc: 'Onder de onderste wimperlijn om wallen en lijntjes aan te pakken.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'De buitenste hoeken van de ogen.',
        zone_upper_lip: 'Bovenlip',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Onderlip',
        zone_lower_lip_desc: 'Onder de onderliplijn.',
        zone_not_intended: 'Niet bedoeld voor diepe nasolabiale plooien (de lijnen die van neus- tot mondhoeken lopen).',

        label_philosophy: 'De Filosofie',
        label_difference: 'Het Verschil',
        label_results: 'Klinische Resultaten',
        label_approach: 'De Aanpak',
        label_experts: 'Vertrouwd door Professionals',
        label_targets: 'Waar Het op Richt',
        label_mechanism: 'Het Mechanisme',
        label_areas: 'Doelgebieden',
        label_protocol: 'Het Protocol',
        label_safety: 'Veiligheid Voorop',
        label_questions: 'Veelgestelde Vragen',
        label_reviews: 'Echte Mensen',
        philosophy_title: 'Activeer je Lichaam. Laat de Natuur de Rest Doen.',
        philosophy_intro: 'Zero Lines is gebaseerd op een simpele waarheid: je lichaam weet al hoe het zichzelf moet helen.',
        philosophy_card1_title: 'Niet Maskeren. Corrigeren.',
        philosophy_card1_body: 'Traditionele crèmes overspoelen je huid met extern collageen en synthetische vullers. Het effect verdwijnt zodra je stopt. Reverse Five creëert de omstandigheden waarin je huid zichzelf corrigeert.',
        philosophy_card2_title: 'Signaleer, Voeg Niet Toe.',
        philosophy_card2_body: 'Ons peptidecomplex signaleert aan de fibroblasten van je huid om hun natuurlijke collageenproductiecyclus te heractiveren. We geven je geen collageen. We leren je lichaam om het opnieuw te maken.',
        philosophy_card3_title: 'Resultaten die Blijven.',
        philosophy_card3_body: 'Omdat de correctie van binnenuit komt, blijven de resultaten 6 tot 18 maanden behouden na afronding van het protocol. Geen dagelijkse afhankelijkheid. Geen eindeloze productcycli.',
        philosophy_card4_title: 'Twee Jaar. Één Spuit.',
        philosophy_card4_body: 'Één wekelijkse behandeling. Vijf minuten aanbrengen. Een 5-uurs activeringsvenster. Zestig behandelingen per spuit. Gestroomlijnd, eenvoudig en ontworpen voor het echte leven.',
        experts_title: 'Wat de Experts Zeggen',
        experts_intro: 'Toonaangevende dermatologen en esthetici over de wetenschap achter peptide-gebaseerde huidcorrectie.',
        expert1_quote: 'Van alle topische protocollen die ik heb geëvalueerd, leveren de peptideconcentratie en het activeringsmechanisme van Reverse Five de meest consistente zichtbare resultaten. Het 5-uurs venster maakt echte cellulaire interactie mogelijk in plaats van een oppervlakkige coating.',
        expert1_stat_label: 'Patiënttevredenheid',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Gecertificeerd Dermatoloog<br>Harvard Medical School',
        expert2_quote: 'De peptide-signaleringsaanpak is genuin innovatief. In plaats van extern collageen toe te voegen, instrueert het de huid om de eigen productie te hervatten. Mijn patiënten zien meetbare verbeteringen in stevigheid en lijndiepte binnen 8 tot 12 weken.',
        expert2_stat_label: 'Zichtbare Verbetering',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Specialist Esthetische Geneeskunde<br>Johns Hopkins Dermatology',
        expert3_quote: 'Ik beveel Reverse Five aan bij cliënten die echte structurele correctie zonder naalden willen. Het hyaluronzuur behoudt de vochtbarrière terwijl de peptiden het zware werk doen. Het is het dichtst bij een klinische behandeling die u thuis kunt gebruiken.',
        expert3_stat_label: 'Collageenactivering',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Hoofd Medisch Esthetisch<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Consumentencrèmes',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Voornamelijk oppervlaktehydratatie',
        checklist_creams_2: 'Kortetermijnvolumeeffect',
        checklist_creams_3: 'Dagelijkse applicatie vereist',
        checklist_creams_4: 'Geen klinische validatie',
        checklist_creams_5: 'Resultaten verdwijnen bij stoppen',
        checklist_creams_6: 'Geen activeringsmechanisme',
        checklist_reverse_1: 'Peptide-activeringsprotocol',
        checklist_reverse_2: 'Progressieve structurele correctie',
        checklist_reverse_3: 'Eenmaal per week — 5 min applicatie',
        checklist_reverse_4: 'GMP-gecertificeerde productie',
        checklist_reverse_5: 'Resultaten behouden 6–18 maanden',
        checklist_reverse_6: '5-uurs cellulair activeringsvenster',
    },
    sv: {
        nav_overview: 'Översikt',
        nav_what_it_is: 'Vad det är',
        nav_results: 'Resultat',
        nav_how_it_works: 'Hur det fungerar',
        nav_protocol: 'Protokoll',
        nav_faq: 'FAQ',
        nav_contact: 'Kontakta',
        hero_eyebrow: 'Opatra London',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Wrinkle Eraser',
        hero_description: 'Avancerad hudkorrigeringsbehandling. Icke-injicerbart alternativ till Botox.',
        hero_tag1: 'Ansökan en gång i veckan',
        hero_tag2: 'Icke-invasiv · Ej smärtsam',
        hero_tag3: '30 sekunder att ansöka',
        hero_tag4: 'Hudläkare testad',
        hero_pill1: 'Icke-Injicerbar',
        hero_pill2: 'Dermatologiskt Testad',
        hero_pill3: '100 Behandlingar',
        hero_pill4: 'GMP-Certifierad',
        hero_cta_secondary: 'Se hur det fungerar →',
        hero_guarantee: '30-Dagars Pengarna-Tillbaka-Garanti',
        hero_price_week: 'Mindre än €3 per vecka',
        hero_price_treatments: '100 behandlingar',
        hero_price_supply: '2-årsförbrukning',
        add_to_cart: 'Lägg i varukorgen — €300',
        learn_more: 'Läs mer',
        overview_heading: 'En annan kategori av korrigering',
        overview_intro: 'Reverse Five är inte en fuktkräm som maskerar fina linjer med tillfällig återfuktning. Det är ett strukturerat korrigeringsprotokoll utformat för att stödja synlig förfining över tid.',
        overview_card1_title: 'Strukturerat protokoll',
        overview_card1_body: 'Ett definierat applikationssystem med tydliga timing-, frekvens- och varaktighetsparametrar designat för konsekvent progressiv förfining.',
        overview_card2_title: 'Nålfri korrigering',
        overview_card2_body: 'Extern applicering utan injektion krävs. Designad för att stödja synlig utjämning utan att bryta hudbarriären.',
        overview_card3_title: 'Förutom hudvård',
        overview_card3_body: 'Inte en ersättning för din rutin, utan en kompletterande korrigeringsbehandling som fungerar tillsammans med din befintliga regim.',
        what_heading: 'Vad den här produkten är designad för att stödja',
        what_benefit1: 'Hjälper till att förbättra utseendet på uttryckslinjerna och stödjer ett jämnare utseende över tid',
        what_benefit2: 'Utformad för att minska uppkomsten av svullnader, särskilt i området under ögonen',
        what_benefit3: 'Stöder förbättring av synlig fasthet och hudton',
        what_benefit4: 'Stödjer hudens naturliga kollagenaktivitet utan att innehålla själva kollagenet',
        what_benefit5: 'Formulerad för precisionsapplicering på riktade områden av synligt problem',
        what_benefit6: 'Lämplig för användning på känslig hud med endast extern applicering',
        stats_heading: 'Resultat & statistik',
        stats_subtext: 'Visuella förbättringar och resultat med konsekvent användning',
        stats_wrinkle_headline: 'Minskning av synliga rynkor och fina linjer',
        stats_wrinkle_subtext: 'Med konsekvent veckovis användning',
        stats_eyelid_headline: 'Ögonlockslyft',
        stats_eyelid_subtext: 'Kan hjälpa till att minska uppkomsten av svullnader och stödja det övre ögonlockets utseende',
        stats_maintenance_headline: 'Resultat bibehålls',
        stats_maintenance_subtext: 'Efter att ha slutfört hela protokollet kan resultaten bibehållas på lång sikt',
        stats_disclaimer: 'Individuella resultat kan variera. Vissa individer kan se maximala resultat så tidigt som efter 4 veckor.',
        stats_photo_note: 'Foton har redigerats lätt för en renare presentation. Klicka på valfri bild för att se originalet.',
        view_original: 'Visa original',
        view_edited: 'Visa redigerad',
        how_heading: 'Hur det fungerar',
        how_activation_heading: 'Aktiveringsmekanism',
        how_activation_p1: 'Reverse Five kräver ett aktiveringsfönster på minst 5 timmar efter applicering. Under denna period interagerar behandlingen med din huds naturliga processer. Tvätta eller gnugga inte de behandlade områdena under detta aktiveringsfönster.',
        how_activation_p2: 'Efter minst 5 timmar kan du fortsätta med din vanliga hudvårdsrutin. Formuleringen är designad för att fungera progressivt med konsekvent veckovis användning.',
        how_ingredients_heading: 'Nyckelingredienssystem',
        how_ingredient1_title: 'Peptider',
        how_ingredient1_body: 'Stöd hudens strukturella förfiningsprocesser och hjälp till att förbättra det synliga utseendet av fasthet.',
        how_ingredient2_title: 'Hyaluronsyra',
        how_ingredient2_body: 'Ger ytfuktningsstöd och hjälper till att upprätthålla hudens fuktbalans under korrigeringsprocessen.',
        how_ingredient3_title: 'Stamcellskomplex',
        how_ingredient3_body: 'Designad för att stödja hudens naturliga förnyelseaktivitet och synliga förfining över tid.',
        protocol_heading: 'Användningsprotokoll',
        protocol_intro: 'Reverse Five följer ett strukturerat korrigeringsprotokoll med definierade parametrar för frekvens, timing och varaktighet. Konsistens är grunden för synlig förfining.',
        protocol_step1_title: 'Ansökan varje vecka',
        protocol_step1_body: 'Applicera en gång i veckan på målområdena. Överskrid inte rekommenderad frekvens.',
        protocol_step2_title: 'Aktiveringsfönster',
        protocol_step2_body: 'Tillåt minst 5 timmar för aktivering. Ingen tvätt eller gnuggning under denna period.',
        protocol_step3_title: 'Konsistens',
        protocol_step3_body: 'En spruta ger cirka 100 applikationer, designade för att hålla två år med veckovis användning.',
        protocol_step4_title: 'Underhållsfas',
        protocol_step4_body: 'Efter att ha slutfört protokollet kan synliga resultat bibehållas i 6–18 månader.',
        protocol_summary_heading: 'Protokollsammanfattning',
        protocol_row1_label: 'Frekvens',
        protocol_row1_value: 'En gång i veckan',
        protocol_row2_label: 'Aktivering',
        protocol_row2_value: 'Minst 5 timmar',
        protocol_row3_label: 'Applikationer',
        protocol_row3_value: '~100 per spruta',
        protocol_row4_label: 'Varaktighet',
        protocol_row4_value: '~2 års användning',
        protocol_row5_label: 'Underhåll',
        protocol_row5_value: '6–18 månader',
        important_heading: 'Viktiga riktlinjer',
        important_intro: 'Följ dessa riktlinjer för att säkerställa optimala förhållanden för behandlingsprotokollet.',
        important_do_title: 'Gör',
        important_do_item1: 'Applicera på ren, torr hud',
        important_do_item2: 'Tillåt minst 5 timmars aktiveringsfönster',
        important_do_item3: 'Ansök endast en gång i veckan',
        important_do_item4: 'Använd precisionsapplikation för att rikta in områden',
        important_do_item5: 'Följ konsekvent veckoschema',
        important_avoid_title: 'Undvik',
        important_avoid_item1: 'Tvätta ansiktet under aktiveringsfönstret',
        important_avoid_item2: 'Gnugga eller vidröra behandlade områden',
        important_avoid_item3: 'Överskrider frekvensen en gång i veckan',
        important_avoid_item4: 'Applicering på djupa nasolabialveck',
        important_avoid_item5: 'Internt bruk (endast externt)',
        important_card_title: 'Endast extern användning',
        important_card_body: 'Reverse Five är designad exklusivt för extern applikation. Förtär inte eller applicera på slemhinnor eller trasig hud. Om irritation uppstår, avbryt användningen och kontakta en sjukvårdspersonal.',
        why_heading: 'Varför det är annorlunda',
        why_intro: 'Reverse Five representerar en distinkt strategi för synlig hudkorrigering, strukturerad som ett protokoll snarare än en daglig hudvårdsprodukt.',
        why_traditional_label: 'Traditionella krämer',
        why_traditional_heading: 'Ythydreringsmetod',
        why_traditional_item1: 'Främst hydreringsbaserad',
        why_traditional_item2: 'Kortsiktig plumpande effekt',
        why_traditional_item3: 'Daglig ansökan krävs',
        why_traditional_item4: 'Tillfällig synlig förbättring',
        why_traditional_item5: 'Resultaten minskar snabbt när de stoppas',
        why_botox_label: 'Botox®-injektioner',
        why_botox_heading: 'Klinisk neurotoxin-strategi',
        why_botox_item1: 'Injiceras direkt i ansiktsmusklerna',
        why_botox_item2: 'Fryser rörelse för att släta ut linjer',
        why_botox_item3: 'Klinikbesök krävs var 3–4:e månad',
        why_botox_item4: '€200–€400 per behandlingstillfälle',
        why_botox_item5: 'Eventuella blåmärken, svullnad, återhämtningstid',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Strukturerat korrigeringsprotokoll',
        why_reverse_item1: 'Designad för progressiv förfining',
        why_reverse_item2: 'Ansökningssystem en gång i veckan',
        why_reverse_item3: 'Definierade aktiveringskrav',
        why_reverse_item4: 'Stöder naturlig kollagenaktivitet',
        why_reverse_item5: 'Underhållsfas efter protokollslutförande',
        why_reverse_item6: 'Icke-injicerbar alternativ metod',
        faq_heading: 'Vanliga frågor',
        faq_q1: 'Ersätter det min hudvårdsrutin?',
        faq_a1: 'Nej. Reverse Five är en kompletterande korrigeringsbehandling utformad för att fungera tillsammans med din befintliga hudvårdsrutin. Fortsätt använda dina vanliga rengöringsmedel, fuktighetskrämer och serum. Applicera Reverse Five en gång i veckan enligt protokollets riktlinjer.',
        faq_q2: 'Hur ofta använder jag det?',
        faq_a2: 'Endast en gång i veckan. Protokollet är utformat för veckoapplikationer med ett aktiveringsfönster på minst 5 timmar. Överskrid inte denna frekvens, eftersom behandlingen kräver tid för att arbeta med din huds naturliga processer mellan appliceringarna.',
        faq_q3: 'När kan jag tvätta ansiktet efter applicering?',
        faq_a3: 'Vänta minst 5 timmar efter applicering innan du tvättar ansiktet. Undvik att tvätta eller gnugga de behandlade områdena under detta aktiveringsfönster. Efter 5 timmar kan du återuppta din normala hudvårdsrutin.',
        faq_q4: 'Var ska jag inte tillämpa det?',
        faq_a4: 'Reverse Five är inte avsedd för djupa nasolabialveck. Fokusera appliceringen på uttryckslinjer i målområdena: övre ögonlocket, under ögonen, kråkfötter, pannlinjer, rynkor (11s) och över- och underläppslinjer. Undvik applicering på trasig hud eller slemhinnor.',
        faq_q5: 'Är den lämplig för känslig hud?',
        faq_a5: 'Ja. Reverse Five är formulerad för att vara lämplig för känslig hud med endast extern applicering. Om du upplever någon irritation, sluta använda och rådfråga en sjukvårdspersonal.',
        faq_q6: 'Hur länge håller en spruta?',
        faq_a6: 'En spruta ger cirka 100 applikationer. Med den rekommenderade frekvensen en gång i veckan är detta utformat för att hålla i ungefär två års konsekvent användning enligt protokollet.',
        faq_q7: 'Vilken tidslinje för resultat bör jag förvänta mig?',
        faq_a7: 'Reverse Five är designad som ett progressivt förfiningsprotokoll, inte en omedelbar lösning. Synliga resultat utvecklas gradvis över konsekvent veckovis användning. Efter att ha slutfört det fullständiga protokollet (ungefär två år) kan resultaten bibehållas i 6–18 månader.',
        faq_q8: 'Kan jag kombinera med andra produkter?',
        faq_a8: 'Ja, Reverse Five är designad för att fungera tillsammans med din befintliga hudvårdsrutin. Under aktiveringsfönstret på 5 timmar, applicera dock inte andra produkter på behandlade områden. Efter aktivering, återuppta din normala produktregim.',
        cta_title: 'Upplev skillnaden',
        cta_description: 'Starta ditt strukturerade korrigeringsprotokoll idag. En spruta. Två år. Synlig förfining.',
        cta_button: 'Lägg i varukorgen — €300',
        footer_note1: 'Informationssida för produktinformation • Zero Lines',
        footer_note2: 'Opatra London • Reverse Five Wrinkle Eraser',
        cart_title: 'Din varukorg',
        cart_empty: 'Din varukorg är tom',
        cart_total: 'Totalt',
        checkout: 'Kassa',
        checkout_note: 'Säker betalning via Stripe',
        reviews_heading: 'Vad våra kunder säger',
        reviews_subtext: 'Riktiga upplevelser från riktiga människor. Gå med över 3 000 nöjda kunder som har gjort Reverse Five till en del av sin rutin.',
        reviews_write_btn: 'Skriv en recension',
        reviews_modal_title: 'Dela din erfarenhet',
        reviews_modal_desc: 'Din feedback hjälper andra att upptäcka Reverse Five.',
        reviews_label_name: 'Ditt namn',
        reviews_label_email: 'E-post',
        reviews_label_rating: 'Ditt betyg',
        reviews_label_text: 'Din recension',
        reviews_submit_btn: 'Skicka recension',
        contact_title: 'Hör av dig',
        contact_desc: 'Har du frågor om Reverse Five? Vårt team är här för att hjälpa till. Oavsett om du behöver vägledning om protokollet, leveransinformation eller något annat – skicka ett meddelande till oss.',
        contact_whatsapp: 'WhatsApp oss<br><small>+350 5400 5198</small>',
        contact_email: 'Skicka e-post till oss<br><small>info@zerolines.life</small>',
        contact_label_name: 'Namn',
        contact_label_email: 'E-post',
        contact_label_subject: 'Ämne',
        contact_subject_default: 'Välj ett ämne',
        contact_subject_product: 'Produktfråga',
        contact_subject_shipping: 'Frakt & leverans',
        contact_subject_protocol: 'Användningsprotokoll',
        contact_subject_order: 'Beställningsförfrågan',
        contact_subject_other: 'Något annat',
        contact_label_message: 'Meddelande',
        contact_send_btn: 'Skicka meddelande',
        contact_response_note: 'Vi svarar vanligtvis inom 24 timmar.',
        newsletter_title: 'Gå med i Zero Lines Community',
        newsletter_desc: 'Få exklusiva tips, tidig tillgång till nya produkter och 10 % rabatt på din första beställning.',
        newsletter_subscribe: 'Prenumerera',
        newsletter_note: 'Ingen spam. Avsluta prenumerationen när som helst.',
        footer_desc: 'Avancerade hudkorrigeringsbehandlingar designade för synlig, varaktig förfining.',
        footer_product: 'Produkt',
        footer_support: 'Support',
        footer_legal: 'Lagligt',
        mobile_sticky_shipping: 'Gratis frakt',
        guarantee_text: '30-dagars nöjdhetsgaranti',
        trust_dermatologist: 'Hudläkare testad',
        trust_cruelty_free: 'Cruelty Free',
        trust_free_shipping: 'Gratis frakt över hela världen',
        nav_where_to_apply: 'Appliceringsområden',
        where_heading: 'Var man ansöker',
        where_intro: 'Reverse Five är designad för precisionsapplicering på riktade områden som visar synliga tecken på uttryckslinjer och volymförändringar.',
        zone_forehead: 'Pannlinjer',
        zone_forehead_desc: 'Horisontella uttryckslinjer över pannan.',
        zone_frown: 'Frown linjer (11s)',
        zone_frown_desc: 'Vertikala linjer mellan ögonbrynen.',
        zone_upper_eyelid: 'Övre ögonlocket',
        zone_upper_eyelid_desc: 'Ovanför ögonvecket för synligt stöd för fasthet.',
        zone_under_eye: 'Under Eye',
        zone_under_eye_desc: 'Under den nedre fransraden för att sikta på svullnader och linjer.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'Ögonens yttre hörn.',
        zone_upper_lip: 'Övre läpp',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Underläpp',
        zone_lower_lip_desc: 'Under underläppens linje.',
        zone_not_intended: 'Ej avsedd för djupa nasolabialveck (linjerna som går från näsa till munhörn).',

        label_philosophy: 'Filosofin',
        label_difference: 'Skillnaden',
        label_results: 'Kliniska Resultat',
        label_approach: 'Tillvägagångssättet',
        label_experts: 'Rekommenderat av Experter',
        label_targets: 'Vad det Riktar Sig Mot',
        label_mechanism: 'Mekanismen',
        label_areas: 'Målområden',
        label_protocol: 'Protokollet',
        label_safety: 'Säkerhet Först',
        label_questions: 'Vanliga Frågor',
        label_reviews: 'Riktiga Människor',
        philosophy_title: 'Aktivera din Kropp. Låt Naturen Göra Resten.',
        philosophy_intro: 'Zero Lines grundas på en enkel sanning: din kropp vet redan hur den ska läka sig själv.',
        philosophy_card1_title: 'Dölj Inte. Korrigera.',
        philosophy_card1_body: 'Traditionella krämer översvämmar din hud med externt kollagen och syntetiska fyllmedel. Effekten försvinner i samma stund du slutar. Reverse Five skapar förutsättningarna för att din hud ska korrigera sig själv.',
        philosophy_card2_title: 'Signala, Tillsätt Inte.',
        philosophy_card2_body: 'Vårt peptidkomplex signalerar till din huds fibroblaster att återaktivera sin naturliga kollagenproduktionscykel. Vi ger dig inte kollagen. Vi lär din kropp att producera det igen.',
        philosophy_card3_title: 'Resultat som Består.',
        philosophy_card3_body: 'Eftersom korrigeringen kommer inifrån, bibehålls resultaten 6 till 18 månader efter protokollets slutförande. Inget dagligt beroende. Inga oändliga produktcykler.',
        philosophy_card4_title: 'Två År. En Spruta.',
        philosophy_card4_body: 'En veckovis behandling. Fem minuters applicering. Ett 5-timmars aktiveringsfönster. Sextio behandlingar per spruta. Strukturerat, enkelt och utformat för verkliga livet.',
        experts_title: 'Vad Experterna Säger',
        experts_intro: 'Ledande dermatologer och estetiker om vetenskapen bakom peptidbaserad hudkorrigering.',
        expert1_quote: 'Bland alla topiska protokoll jag har utvärderat levererar Reverse Fives peptidkoncentration och aktiveringsmekanism de mest konsekventa synliga resultaten. Det 5-timmars fönstret möjliggör genuin cellulär interaktion snarare än ytlig överdragning.',
        expert1_stat_label: 'Patients tillfredsställelse',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Dermatolog med Board-Certifiering<br>Harvard Medical School',
        expert2_quote: 'Peptid-signaleringstillvägagångssättet är genuint innovativt. Istället för att tillföra externt kollagen instruerar det huden att återuppta sin egen produktion. Mina patienter ser mätbara förbättringar av fasthet och linjedjup inom 8 till 12 veckor.',
        expert2_stat_label: 'Synlig Förbättring',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Specialist inom Estetisk Medicin<br>Johns Hopkins Dermatology',
        expert3_quote: 'Jag rekommenderar Reverse Five till klienter som vill ha verklig strukturell korrigering utan nålar. Hyaluronsyran upprätthåller fuktbarriären medan peptiderna gör det tunga arbetet. Det är det närmaste en klinisk behandling du kan använda hemma.',
        expert3_stat_label: 'Kollagenaktivering',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Ledande Medicinsk Estetiker<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Konsumentkrämer',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Främst ytlig återfuktning',
        checklist_creams_2: 'Kortsiktig fyllande effekt',
        checklist_creams_3: 'Daglig applicering krävs',
        checklist_creams_4: 'Ingen klinisk validering',
        checklist_creams_5: 'Resultat försvinner vid avbrott',
        checklist_creams_6: 'Ingen aktiveringsmekanism',
        checklist_reverse_1: 'Peptidaktiveringsprotokoll',
        checklist_reverse_2: 'Progressiv strukturell korrigering',
        checklist_reverse_3: 'En gång i veckan — 5 min applicering',
        checklist_reverse_4: 'GMP-certifierad tillverkning',
        checklist_reverse_5: 'Resultat bibehålls 6–18 månader',
        checklist_reverse_6: '5-timmars cellulärt aktiveringsfönster',
    },
    ja: {
        nav_overview: '概要',
        nav_what_it_is: 'それは何ですか',
        nav_results: '結果',
        nav_how_it_works: '仕組み',
        nav_protocol: 'プロトコル',
        nav_faq: 'よくある質問',
        nav_contact: '接触',
        hero_eyebrow: 'エルメティスプロフェッショナル',
        hero_title: 'Reverse Five',
        hero_subtitle: 'しわ消しゴム',
        hero_description: '高度な皮膚矯正治療。ボトックスの非注射代替品。',
        hero_tag1: '週1回のお申し込み',
        hero_tag2: '非侵襲的・無痛',
        hero_tag3: '適用まで30秒',
        hero_tag4: '皮膚科医によるテスト済み',
        hero_pill1: '非注射型',
        hero_pill2: '皮膚科医によるテスト済み',
        hero_pill3: '100回分',
        hero_pill4: 'GMP認証',
        hero_cta_secondary: '使い方を見る →',
        hero_guarantee: '30日間返金保証',
        hero_price_week: '1週間あたり€3以下',
        hero_price_treatments: '100回分',
        hero_price_supply: '2年分',
        add_to_cart: 'カートに追加 — €300',
        learn_more: 'もっと詳しく知る',
        overview_heading: '別のカテゴリの修正',
        overview_intro: 'Reverse Fiveは、一時的な水分補給で小じわを隠す保湿剤ではありません。これは、時間の経過とともに目に見える改善をサポートするように設計された構造化された補正プロトコルです。',
        overview_card1_title: '構造化されたプロトコル',
        overview_card1_body: '明確なタイミング、周波数、持続時間パラメータを備えた定義されたアプリケーション システムは、一貫した漸進的な改良を実現するように設計されています。',
        overview_card2_title: '針を使わない矯正',
        overview_card2_body: '注射不要の外用剤です。皮膚バリアを壊すことなく、目に見える滑らかさをサポートするように設計されています。',
        overview_card3_title: 'スキンケアに加えて',
        overview_card3_body: 'ルーチンの代わりとなるものではなく、既存のレジメンと並行して機能する補完的な矯正治療です。',
        what_heading: 'この製品がサポートするように設計されているもの',
        what_benefit1: '表情線の外観を改善し、時間の経過とともにより滑らかな外観をサポートします',
        what_benefit2: '特に目の下のむくみを軽減するように設計されています。',
        what_benefit3: '目に見えるハリと肌トーンの改善をサポートします',
        what_benefit4: 'コラーゲンそのものを含まずに、肌本来のコラーゲン活動をサポートします。',
        what_benefit5: '目に見える懸念のある対象領域に正確に塗布できるように配合されています',
        what_benefit6: '外用のみで敏感肌にも使用可能',
        stats_heading: '結果と統計',
        stats_subtext: '一貫した使用による視覚的な改善と結果',
        stats_wrinkle_headline: '目に見えるシワや小じわの減少',
        stats_wrinkle_subtext: '毎週継続的に使用することで',
        stats_eyelid_headline: 'まぶたリフト',
        stats_eyelid_subtext: 'むくみを軽減し、上まぶたの外観をサポートします。',
        stats_maintenance_headline: '結果が維持される',
        stats_maintenance_subtext: '完全なプロトコルを完了した後、結果は長期間維持される可能性があります',
        stats_disclaimer: '個々の結果は異なる場合があります。人によっては、早ければ 4 週間で最大の効果が得られる場合もあります。',
        stats_photo_note: '写真は、よりわかりやすく表示するために軽く編集されています。写真をクリックするとオリジナルが表示されます。',
        view_original: 'オリジナルを見る',
        view_edited: '編集済みを表示',
        how_heading: '仕組み',
        how_activation_heading: '活性化メカニズム',
        how_activation_p1: 'ゆうばりキングは、お申込み後最低5時間のアクティベーションウィンドウが必要です。この期間中、トリートメントは肌の自然なプロセスと相互作用します。この活性化期間中は、治療部位を洗ったりこすったりしないでください。',
        how_activation_p2: '最低5時間経過後は、通常のスキンケアを続けてください。この配合は、毎週一貫して使用することで徐々に効果が現れるように設計されています。',
        how_ingredients_heading: '主要成分システム',
        how_ingredient1_title: 'ペプチド',
        how_ingredient1_body: '皮膚の構造的改善プロセスをサポートし、目に見えるハリ感を改善します。',
        how_ingredient2_title: 'ヒアルロン酸',
        how_ingredient2_body: '表面の水分補給をサポートし、補正プロセス中に肌の水分バランスを維持するのに役立ちます。',
        how_ingredient3_title: '幹細胞複合体',
        how_ingredient3_body: '皮膚の自然な再生活動と、時間の経過とともに目に見える改善をサポートするように設計されています。',
        protocol_heading: '使用プロトコル',
        protocol_intro: 'Reverse Five は、定義された頻度、タイミング、持続時間のパラメーターを使用した構造化された補正プロトコルに従います。一貫性は目に見える洗練の基礎です。',
        protocol_step1_title: '毎週の申請',
        protocol_step1_body: '週に1回、対象部位に塗布してください。推奨周波数を超えないようにしてください。',
        protocol_step2_title: 'アクティベーションウィンドウ',
        protocol_step2_body: 'アクティベーションには最低 5 時間かかります。この間、洗濯や摩擦は禁止です。',
        protocol_step3_title: '一貫性',
        protocol_step3_body: '1 本のシリンジで約 100 回の塗布が可能で、毎週の使用で 2 年間持続するように設計されています。',
        protocol_step4_title: 'メンテナンスフェーズ',
        protocol_step4_body: 'プロトコール完了後、目に見える結果は 6 ～ 18 か月間維持されます。',
        protocol_summary_heading: 'プロトコルの概要',
        protocol_row1_label: '頻度',
        protocol_row1_value: '週に1回',
        protocol_row2_label: 'アクティベーション',
        protocol_row2_value: '最低5時間',
        protocol_row3_label: 'アプリケーション',
        protocol_row3_value: 'シリンジあたり約 100',
        protocol_row4_label: '間隔',
        protocol_row4_value: '～2年間の使用',
        protocol_row5_label: 'メンテナンス',
        protocol_row5_value: '6～18か月',
        important_heading: '重要なガイドライン',
        important_intro: '治療プロトコルに最適な条件を確保するには、次のガイドラインに従ってください。',
        important_do_title: 'する',
        important_do_item1: '清潔で乾燥した肌に塗布します',
        important_do_item2: '最小 5 時間のアクティベーション期間を許可する',
        important_do_item3: '週に1回のみお申し込みください',
        important_do_item4: 'ターゲット領域に正確に塗布してください',
        important_do_item5: '一貫した毎週のスケジュールに従ってください',
        important_avoid_title: '避ける',
        important_avoid_item1: 'アクティベーションウィンドウ中の洗顔',
        important_avoid_item2: '治療部位をこすったり触れたりする',
        important_avoid_item3: '週に 1 回を超える頻度',
        important_avoid_item4: '深いほうれい線に塗る',
        important_avoid_item5: '内部使用（外部のみ）',
        important_card_title: '外用のみ',
        important_card_body: 'Reverse Fiveは外部塗布専用に設計されています。摂取したり、粘膜や傷口に塗布したりしないでください。刺激が生じた場合は、使用を中止し、医療専門家にご相談ください。',
        why_heading: 'なぜ違うのか',
        why_intro: 'Reverse Fiveは、目に見える肌補正への独特のアプローチを表しており、毎日のスキンケア製品ではなくプロトコルとして構成されています。',
        why_traditional_label: '伝統的なクリーム',
        why_traditional_heading: '表面水和アプローチ',
        why_traditional_item1: '主に水分補給ベース',
        why_traditional_item2: '短期的なプランピング効果',
        why_traditional_item3: '毎日の申請が必要です',
        why_traditional_item4: '一時的な目に見える改善',
        why_traditional_item5: '停止すると結果は急速に低下します',
        why_botox_label: 'ボトックス®注射',
        why_botox_heading: '臨床神経毒素アプローチ',
        why_botox_item1: '顔の筋肉に直接注射',
        why_botox_item2: '動きを止めてしわを滑らかに',
        why_botox_item3: '3～4か月ごとにクリニック受診が必要',
        why_botox_item4: '1回の治療セッション€200～€400',
        why_botox_item5: '内出血、腫れ、ダウンタイムの可能性',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: '構造化された修正プロトコル',
        why_reverse_item1: '進歩的な洗練を目指した設計',
        why_reverse_item2: '週1回の応募制',
        why_reverse_item3: '定義されたアクティベーション要件',
        why_reverse_item4: '自然なコラーゲンの活性をサポート',
        why_reverse_item5: 'プロトコル完了後のメンテナンスフェーズ',
        why_reverse_item6: '非注射可能な代替アプローチ',
        faq_heading: 'よくある質問',
        faq_q1: '私のスキンケアルーチンの代わりになりますか？',
        faq_a1: 'いいえ、Reverse Fiveは、既存のスキンケア ルーチンと並行して機能するように設計された補完的な矯正トリートメントです。通常のクレンザー、モイスチャライザー、セラムを引き続き使用してください。プロトコールのガイドラインに従って、Reverse Fiveを週に 1 回塗布してください。',
        faq_q2: 'どのくらいの頻度で使用しますか?',
        faq_a2: '週に1回のみ。このプロトコルは、最小 5 時間の有効化ウィンドウで毎週適用するように設計されています。トリートメントでは次の塗布までに皮膚の自然なプロセスに取り組む時間が必要となるため、この頻度を超えないようにしてください。',
        faq_q3: '塗った後はいつ顔を洗ってもいいですか？',
        faq_a3: '塗布後、少なくとも5時間待ってから顔を洗ってください。この活性化期間中は、治療部位を洗ったりこすったりしないでください。 5時間後、通常のスキンケアを再開してください。',
        faq_q4: 'どこに塗ってはいけないのでしょうか？',
        faq_a4: 'Reverse Fiveは深いほうれい線を対象としたものではありません。上まぶた、目の下、目尻のしわ、額のライン、眉間のライン（11秒）、上下の唇のラインなど、ターゲット領域の表情ラインに重点的に塗布します。傷ついた皮膚や粘膜への塗布は避けてください。',
        faq_q5: '敏感肌にも適していますか？',
        faq_a5: 'はい。Reverse Fiveは、外用のみで敏感肌にも使えるように配合されています。刺激を感じた場合は、使用を中止し、医療専門家にご相談ください。',
        faq_q6: '1本の注射器はどれくらい持続しますか？',
        faq_a6: '1 本のシリンジで約 100 回の塗布が可能です。推奨頻度は週に 1 回で、プロトコルに従って継続的に使用すると約 2 年間持続するように設計されています。',
        faq_q7: 'どのような結果のタイムラインを期待すればよいですか?',
        faq_a7: 'Reverse Five は、即時のソリューションではなく、漸進的な改良プロトコルとして設計されています。毎週継続的に使用することで、目に見える効果が徐々に現れます。完全なプロトコル (約 1 年) を完了した後、結果は 6 ～ 18 か月間維持されます。',
        faq_q8: '他の商品と組み合わせることはできますか？',
        faq_a8: 'はい、Reverse Fiveは、既存のスキンケア ルーチンと併用できるように設計されています。ただし、5 時間の活性化期間中は、治療部位に他の製品を塗布しないでください。アクティベーション後は、通常の製品レジメンを再開してください。',
        cta_title: '違いを体験してください',
        cta_description: '構造化された矯正プロトコルを今すぐ始めてください。注射器1本。 2年。目に見える洗練。',
        cta_button: 'カートに追加 — €300',
        footer_note1: '情報製品ページ • ゼロライン',
        footer_note2: 'エルメティス プロフェッショナル Reverse Five リンクル消しゴム',
        cart_title: 'あなたのカート',
        cart_empty: 'カートは空です',
        cart_total: '合計',
        checkout: 'チェックアウト',
        checkout_note: 'Stripe による安全な支払い',
        reviews_heading: 'お客様の声',
        reviews_subtext: '実際の人々からのリアルな体験。Reverse Fiveを日常の一部として取り入れている 3,000 人を超える満足した顧客の一員になりましょう。',
        reviews_write_btn: 'レビューを書く',
        reviews_modal_title: 'あなたの経験を共有してください',
        reviews_modal_desc: 'あなたのフィードバックは、他の人がReverse Fiveを知るのに役立ちます。',
        reviews_label_name: 'あなたの名前',
        reviews_label_email: '電子メール',
        reviews_label_rating: 'あなたの評価',
        reviews_label_text: 'あなたのレビュー',
        reviews_submit_btn: 'レビューを送信する',
        contact_title: '連絡する',
        contact_desc: 'Reverse Fiveについて質問がありますか？私たちのチームがお手伝いいたします。プロトコル、配送情報、またはその他に関するガイダンスが必要な場合は、メッセージをお送りください。',
        contact_whatsapp: 'WhatsApp 私たち<br><small>+350 5400 5198</small>',
        contact_email: 'メールでお問い合わせください<br><small>info@zerolines.life</small>',
        contact_label_name: '名前',
        contact_label_email: '電子メール',
        contact_label_subject: '主題',
        contact_subject_default: 'トピックを選択してください',
        contact_subject_product: '製品に関する質問',
        contact_subject_shipping: '配送と配達',
        contact_subject_protocol: '使用プロトコル',
        contact_subject_order: '注文に関するお問い合わせ',
        contact_subject_other: '何か他のもの',
        contact_label_message: 'メッセージ',
        contact_send_btn: 'メッセージを送信する',
        contact_response_note: '通常、24 時間以内に返信させていただきます。',
        newsletter_title: 'ゼロ ラインズ コミュニティに参加する',
        newsletter_desc: '特別なヒント、新製品への早期アクセス、初回注文の 10% オフを入手してください。',
        newsletter_subscribe: '購読する',
        newsletter_note: 'スパムはありません。いつでも購読を解除してください。',
        footer_desc: '目に見えて持続する洗練を目指して設計された高度な肌補正トリートメント。',
        footer_product: '製品',
        footer_support: 'サポート',
        footer_legal: '法律上の',
        mobile_sticky_shipping: '送料無料',
        guarantee_text: '30日間の満足保証',
        trust_dermatologist: '皮膚科医によるテスト済み',
        trust_cruelty_free: 'クルエルティフリー',
        trust_free_shipping: '全世界送料無料',
        nav_where_to_apply: '適用部位',
        where_heading: '申請先',
        where_intro: 'Reverse Fiveは、表情じわやボリューム変化の目に見える兆候が見られるターゲット領域に正確に塗布できるように設計されています。',
        zone_forehead: '額の線',
        zone_forehead_desc: '額を横切る水平の表情線。',
        zone_frown: '眉間のしわ (11 秒)',
        zone_frown_desc: '眉間の縦じわ。',
        zone_upper_eyelid: '上まぶた',
        zone_upper_eyelid_desc: '目元のシワの上で目に見えるハリをサポートします。',
        zone_under_eye: '目の下',
        zone_under_eye_desc: '下まつ毛の生え際の下で、むくみやシワをケアします。',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: '目尻。',
        zone_upper_lip: '上唇',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: '下唇',
        zone_lower_lip_desc: '下唇のラインより下。',
        zone_not_intended: '深いほうれい線（鼻から口角にかけての線）には適していません。',

        label_philosophy: 'フィロソフィー',
        label_difference: '違い',
        label_results: '臨床結果',
        label_approach: 'アプローチ',
        label_experts: '専門家が信頼する',
        label_targets: 'ターゲット',
        label_mechanism: 'メカニズム',
        label_areas: '対象部位',
        label_protocol: 'プロトコール',
        label_safety: '安全性を最優先',
        label_questions: 'よくある質問',
        label_reviews: '実際のお客様',
        philosophy_title: '身体を活性化させる。残りは自然に任せる。',
        philosophy_intro: 'Zero Linesは、一つのシンプルな真実に基づいて設立されました。あなたの身体は、すでに自己修復する方法を知っています。',
        philosophy_card1_title: '隠さない。正す。',
        philosophy_card1_body: '従来のクリームは、外部からのコラーゲンや合成フィラーで肌を満たします。使用をやめた瞬間、効果は消えてしまいます。Reverse Fiveは、肌が自ら正す条件を作り出します。',
        philosophy_card2_title: '与えるのではなく、信号を送る。',
        philosophy_card2_body: '当社のペプチド複合体は、肌の線維芽細胞に自然なコラーゲン生成サイクルの再活性化を促す信号を送ります。コラーゲンを与えるのではなく、身体に再び作る方法を教えます。',
        philosophy_card3_title: '持続する結果。',
        philosophy_card3_body: '矯正は内側から行われるため、プロトコール完了後も6〜18か月間結果が維持されます。毎日の依存も、終わりのない製品サイクルもありません。',
        philosophy_card4_title: '2年。1本の注射器。',
        philosophy_card4_body: '週に1回のトリートメント。5分間の塗布。5時間のアクティベーションウィンドウ。1本の注射器で60回分。構造化され、シンプルで、現実の生活のために設計されています。',
        experts_title: '専門家の声',
        experts_intro: 'ペプチドベースの肌矯正の科学について、皮膚科医とエステティシャンの第一人者が語ります。',
        expert1_quote: '私が評価してきたすべての外用プロトコルの中で、Reverse Fiveのペプチド濃度と活性化メカニズムが最も一貫した目に見える結果をもたらします。5時間のウィンドウにより、表層コーティングではなく、本物の細胞間相互作用が可能になります。',
        expert1_stat_label: '患者満足度',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: '皮膚科専門医<br>Harvard Medical School',
        expert2_quote: 'ペプチドシグナリングアプローチは本当に革新的です。外部コラーゲンを添加するのではなく、肌に自らの生成を再開するよう指示します。私の患者は、8〜12週間でハリとシワの深さに改善が見られます。',
        expert2_stat_label: '目に見える改善',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: '美容医療スペシャリスト<br>Johns Hopkins Dermatology',
        expert3_quote: '針を使わず本物の構造矯正を望むクライアントにReverse Fiveをお勧めしています。ヒアルロン酸が水分バリアを維持し、ペプチドが主要な働きをします。自宅でできるクリニカルトリートメントの最も近いものです。',
        expert3_stat_label: 'コラーゲン活性化',
        expert3_name: 'Elena Rodriguez',
        expert3_title: '首席医療エステティシャン<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: '一般向けクリーム',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: '主に表面保湿',
        checklist_creams_2: '短期的なハリ効果',
        checklist_creams_3: '毎日の使用が必要',
        checklist_creams_4: '臨床検証なし',
        checklist_creams_5: '中止すると効果が消える',
        checklist_creams_6: '活性化メカニズムなし',
        checklist_reverse_1: 'ペプチド活性化プロトコール',
        checklist_reverse_2: '進行的構造矯正',
        checklist_reverse_3: '週1回 — 塗布5分',
        checklist_reverse_4: 'GMP認証製造',
        checklist_reverse_5: '結果は6〜18か月維持',
        checklist_reverse_6: '5時間の細胞活性化ウィンドウ',
    },
    ko: {
        nav_overview: '개요',
        nav_what_it_is: '그것은 무엇입니까',
        nav_results: '결과',
        nav_how_it_works: '작동 원리',
        nav_protocol: '규약',
        nav_faq: 'FAQ',
        nav_contact: '연락하다',
        hero_eyebrow: '허메티즈 프로페셔널',
        hero_title: 'Reverse Five',
        hero_subtitle: '주름 지우개',
        hero_description: '고급 피부 교정 트리트먼트. 주사할 수 없는 보톡스 대체품.',
        hero_tag1: '일주일에 한번 신청',
        hero_tag2: '비침습적 · 비통증적',
        hero_tag3: '적용하는데 30초',
        hero_tag4: '피부과 전문의 테스트 완료',
        hero_pill1: '비주사형',
        hero_pill2: '피부과 전문의 테스트 완료',
        hero_pill3: '100회 트리트먼트',
        hero_pill4: 'GMP 인증',
        hero_cta_secondary: '사용 방법 보기 →',
        hero_guarantee: '30일 환불 보장',
        hero_price_week: '주당 €3 미만',
        hero_price_treatments: '100회 트리트먼트',
        hero_price_supply: '2년분',
        add_to_cart: '장바구니에 담기 - €300',
        learn_more: '자세히 알아보기',
        overview_heading: '교정의 다른 범주',
        overview_intro: 'Reverse Five는 일시적인 수분 공급으로 잔주름을 가리는 보습제가 아닙니다. 이는 시간이 지남에 따라 눈에 띄는 개선을 지원하도록 설계된 구조화된 수정 프로토콜입니다.',
        overview_card1_title: '구조화된 프로토콜',
        overview_card1_body: '일관된 점진적 개선을 위해 설계된 명확한 타이밍, 빈도 및 기간 매개변수를 갖춘 정의된 애플리케이션 시스템입니다.',
        overview_card2_title: '바늘없는 교정',
        overview_card2_body: '주입이 필요없는 외부 적용. 피부 장벽을 무너뜨리지 않으면서 눈에 띄는 매끈함을 지원하도록 설계되었습니다.',
        overview_card3_title: '스킨케어 외에도',
        overview_card3_body: '귀하의 루틴을 대체하는 것이 아니라 기존 요법과 함께 작동하는 보완적인 교정 치료법입니다.',
        what_heading: '이 제품이 지원하도록 설계된 것',
        what_benefit1: '표정 라인의 모양을 개선하고 시간이 지남에 따라 더욱 부드러운 모양을 지원합니다.',
        what_benefit2: '특히 눈 밑 부분의 붓기를 줄이도록 설계되었습니다.',
        what_benefit3: '눈에 보이는 탄력과 피부톤 개선을 지원합니다.',
        what_benefit4: '콜라겐 자체를 함유하지 않고 피부의 천연 콜라겐 활동을 지원합니다.',
        what_benefit5: '눈에 보이는 관심 영역에 정밀하게 적용할 수 있도록 제조됨',
        what_benefit6: '외용으로만 사용하면 민감한 피부에도 사용 가능',
        stats_heading: '결과 및 통계',
        stats_subtext: '일관된 사용으로 인한 시각적 개선 및 결과',
        stats_wrinkle_headline: '눈에 보이는 주름과 잔주름 감소',
        stats_wrinkle_subtext: '매주 꾸준히 사용하면',
        stats_eyelid_headline: '눈꺼풀 리프트',
        stats_eyelid_subtext: '붓기의 모양을 줄이고 위쪽 눈꺼풀 모양을 지원하는 데 도움이 될 수 있습니다.',
        stats_maintenance_headline: '결과 유지',
        stats_maintenance_subtext: '전체 프로토콜을 완료한 후에도 결과가 장기간 유지될 수 있습니다.',
        stats_disclaimer: '개별 결과는 다를 수 있습니다. 일부 개인은 빠르면 4주 만에 최대 결과를 볼 수 있습니다.',
        stats_photo_note: '보다 깔끔한 표현을 위해 사진을 가볍게 편집했습니다. 모든 사진을 클릭하시면 원본을 보실 수 있습니다.',
        view_original: '원본 보기',
        view_edited: '수정된 내용 보기',
        how_heading: '작동 원리',
        how_activation_heading: '활성화 메커니즘',
        how_activation_p1: 'Reverse Five는 신청 후 최소 5시간의 활성화 기간이 필요합니다. 이 기간 동안 치료는 피부의 자연적인 과정과 상호 작용합니다. 이 활성화 기간 동안 치료 부위를 씻거나 문지르지 마십시오.',
        how_activation_p2: '최소 5시간 이후에는 일반적인 스킨케어 루틴을 계속할 수 있습니다. 이 제형은 매주 일관된 사용으로 점진적으로 작동하도록 설계되었습니다.',
        how_ingredients_heading: '핵심성분 시스템',
        how_ingredient1_title: '펩티드',
        how_ingredient1_body: '피부의 구조적 개선 과정을 지원하고 눈에 보이는 탄력을 개선하는 데 도움을 줍니다.',
        how_ingredient2_title: '히알루론산',
        how_ingredient2_body: '표면 수분 공급을 지원하고 교정 과정에서 피부 수분 밸런스를 유지하는 데 도움을 줍니다.',
        how_ingredient3_title: '줄기세포복합체',
        how_ingredient3_body: '시간이 지남에 따라 피부의 자연스러운 재생 활동과 눈에 띄는 개선을 지원하도록 설계되었습니다.',
        protocol_heading: '사용 프로토콜',
        protocol_intro: 'Reverse Five은 정의된 빈도, 타이밍 및 기간 매개변수를 사용하여 구조화된 수정 프로토콜을 따릅니다. 일관성은 눈에 보이는 개선의 기초입니다.',
        protocol_step1_title: '주간 신청',
        protocol_step1_body: '주 1회 대상 부위에 발라주세요. 권장 빈도를 초과하지 마십시오.',
        protocol_step2_title: '활성화 창',
        protocol_step2_body: '활성화하는 데 최소 5시간이 소요됩니다. 이 기간 동안 세탁하거나 문지르지 마세요.',
        protocol_step3_title: '일관성',
        protocol_step3_body: '하나의 주사기는 약 100회 사용이 가능하며 매주 사용 시 2년 동안 사용할 수 있도록 설계되었습니다.',
        protocol_step4_title: '유지보수 단계',
        protocol_step4_body: '프로토콜 완료 후 눈에 띄는 결과는 6~18개월 동안 유지될 수 있습니다.',
        protocol_summary_heading: '프로토콜 요약',
        protocol_row1_label: '빈도',
        protocol_row1_value: '일주일에 한 번',
        protocol_row2_label: '활성화',
        protocol_row2_value: '최소 5시간',
        protocol_row3_label: '응용',
        protocol_row3_value: '주사기당 ~100개',
        protocol_row4_label: '지속',
        protocol_row4_value: '~2년 사용',
        protocol_row5_label: '유지',
        protocol_row5_value: '6~18개월',
        important_heading: '중요한 지침',
        important_intro: '치료 프로토콜에 대한 최적의 조건을 보장하려면 다음 지침을 따르십시오.',
        important_do_title: '하다',
        important_do_item1: '깨끗하고 건조한 피부에 바르세요',
        important_do_item2: '최소 5시간의 활성화 기간을 허용합니다.',
        important_do_item3: '일주일에 한 번만 신청하세요.',
        important_do_item4: '대상 부위에 정밀 도포 사용',
        important_do_item5: '일관된 주간 일정을 따르세요.',
        important_avoid_title: '피하다',
        important_avoid_item1: '활성화 기간 중 세수',
        important_avoid_item2: '치료 부위를 문지르거나 만지는 행위',
        important_avoid_item3: '주 1회 빈도 초과',
        important_avoid_item4: '깊은 팔자주름에 적용',
        important_avoid_item5: '내부용(외부 전용)',
        important_card_title: '외부 전용',
        important_card_body: 'Reverse Five은 외부 응용 프로그램 전용으로 설계되었습니다. 점막이나 상처난 피부에는 섭취하거나 바르지 마세요. 자극이 발생하면 사용을 중단하고 의료 전문가와 상담하십시오.',
        why_heading: '왜 다른가요?',
        why_intro: 'Reverse Five는 일상적인 스킨케어 제품이 아닌 프로토콜로 구성된 눈에 보이는 피부 교정에 대한 독특한 접근 방식을 나타냅니다.',
        why_traditional_label: '전통 크림',
        why_traditional_heading: '표면 수화 접근법',
        why_traditional_item1: '주로 수분 베이스',
        why_traditional_item2: '단기적인 플럼핑 효과',
        why_traditional_item3: '매일 신청 필요',
        why_traditional_item4: '일시적으로 눈에 띄는 개선',
        why_traditional_item5: '중지하면 결과가 빠르게 감소합니다.',
        why_botox_label: '보톡스® 주사',
        why_botox_heading: '임상 신경독소 접근법',
        why_botox_item1: '얼굴 근육에 직접 주입',
        why_botox_item2: '움직임을 얼려 주름을 펴줌',
        why_botox_item3: '3~4개월마다 병원 방문 필요',
        why_botox_item4: '1회 치료 세션 €200~€400',
        why_botox_item5: '멍, 부기, 회복 기간 가능',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: '구조화된 수정 프로토콜',
        why_reverse_item1: '점진적인 개선을 위해 설계됨',
        why_reverse_item2: '주 1회 신청 시스템',
        why_reverse_item3: '정의된 활성화 요구 사항',
        why_reverse_item4: '천연 콜라겐 활동을 지원합니다.',
        why_reverse_item5: '프로토콜 완료 후 유지 관리 단계',
        why_reverse_item6: '주사 불가능한 대체 접근법',
        faq_heading: '자주 묻는 질문',
        faq_q1: '내 스킨케어 루틴을 대체하나요?',
        faq_a1: '아니요. Reverse Five는 기존 스킨케어 루틴과 함께 작용하도록 고안된 보완적인 교정 트리트먼트입니다. 일반 클렌저, 보습제, 세럼을 계속 사용하세요. 프로토콜 지침에 따라 일주일에 한 번 Reverse Five을 바르십시오.',
        faq_q2: '얼마나 자주 사용합니까?',
        faq_a2: '일주일에 한 번만. 이 프로토콜은 최소 5시간의 활성화 기간을 갖는 주간 적용을 위해 설계되었습니다. 치료가 적용 사이에 피부의 자연적인 과정에 작용하는 데 시간이 필요하므로 이 빈도를 초과하지 마십시오.',
        faq_q3: '바르고 난 후 언제 세안을 할 수 있나요?',
        faq_a3: '얼굴을 씻기 전에 도포 후 최소 5시간을 기다리십시오. 이 활성화 기간 동안에는 치료 부위를 씻거나 문지르지 마십시오. 5시간 후에는 정상적인 스킨케어 루틴을 재개하실 수 있습니다.',
        faq_q4: '어디에 적용하면 안되나요?',
        faq_a4: 'Reverse Five는 깊은 팔자 주름을 위한 제품이 아닙니다. 윗 눈꺼풀, 눈 밑, 눈꼬리, 이마 주름, 미간 주름(11s), 윗 입술 라인, 아랫 입술 라인 등 원하는 부위의 표정 라인에 집중적으로 발라줍니다. 상처난 피부나 점막에는 사용을 피하세요.',
        faq_q5: '민감한 피부에도 적합한가요?',
        faq_a5: '예. Reverse Five는 외용으로만 사용하면 민감한 피부에 적합하도록 제조되었습니다. 자극이 느껴지면 사용을 중단하고 의료 전문가와 상담하십시오.',
        faq_q6: '하나의 주사기는 얼마나 오래 지속됩니까?',
        faq_a6: '하나의 주사기로 약 100회 도포가 가능합니다. 권장 빈도는 주 1회이며, 프로토콜에 따라 약 2년간 지속적으로 사용하도록 설계되었습니다.',
        faq_q7: '어떤 결과 일정을 예상해야 합니까?',
        faq_a7: 'Reverse Five는 즉각적인 솔루션이 아닌 점진적인 개선 프로토콜로 설계되었습니다. 매주 꾸준히 사용하면 눈에 보이는 결과가 점차적으로 나타납니다. 전체 프로토콜(약 2년)을 완료한 후 결과는 6~18개월 동안 유지될 수 있습니다.',
        faq_q8: '다른 제품과 결합할 수 있나요?',
        faq_a8: '네, Reverse Five는 기존 스킨케어 루틴과 함께 사용할 수 있도록 설계되었습니다. 그러나 5시간의 활성화 기간 동안에는 치료 부위에 다른 제품을 바르지 마십시오. 활성화 후 정상적인 제품 요법을 재개하십시오.',
        cta_title: '차이를 경험해 보세요',
        cta_description: '지금 구조화된 교정 프로토콜을 시작하세요. 주사기 하나. 2년. 눈에 보이는 개선.',
        cta_button: '장바구니에 담기 - €300',
        footer_note1: '정보 제공용 제품 페이지 • 제로 라인(Zero Lines)',
        footer_note2: '헤르메타즈 프로페셔널 • Reverse Five 주름지우개',
        cart_title: '장바구니',
        cart_empty: '장바구니가 비어 있습니다.',
        cart_total: '총',
        checkout: '점검',
        checkout_note: 'Stripe를 통한 안전한 결제',
        reviews_heading: '고객의 의견',
        reviews_subtext: '실제 사람들의 실제 경험. Reverse Five을 일상의 일부로 만든 만족스러운 3,000명 이상의 고객과 함께 하세요.',
        reviews_write_btn: '리뷰 작성',
        reviews_modal_title: '당신의 경험을 공유하세요',
        reviews_modal_desc: '귀하의 피드백은 다른 사람들이 Reverse Five을 찾는 데 도움이 됩니다.',
        reviews_label_name: '당신의 이름',
        reviews_label_email: '이메일',
        reviews_label_rating: '귀하의 평가',
        reviews_label_text: '귀하의 리뷰',
        reviews_submit_btn: '리뷰 제출',
        contact_title: '연락하세요',
        contact_desc: 'Reverse Five에 대해 궁금한 점이 있나요? 우리 팀이 도와드리겠습니다. 프로토콜, 배송 정보 또는 기타 사항에 대한 지침이 필요한 경우 메시지를 보내주세요.',
        contact_whatsapp: 'WhatsApp 회사<br><small>+350 5400 5198</small>',
        contact_email: '이메일<br><small>info@zerolines.life</small>',
        contact_label_name: '이름',
        contact_label_email: '이메일',
        contact_label_subject: '주제',
        contact_subject_default: '주제를 선택하세요',
        contact_subject_product: '제품문의',
        contact_subject_shipping: '배송 및 배달',
        contact_subject_protocol: '사용 프로토콜',
        contact_subject_order: '주문문의',
        contact_subject_other: '다른 것',
        contact_label_message: '메시지',
        contact_send_btn: '메시지 보내기',
        contact_response_note: '우리는 일반적으로 24시간 이내에 응답합니다.',
        newsletter_title: 'Zero Lines 커뮤니티에 가입하세요',
        newsletter_desc: '독점 팁, 신제품에 대한 조기 액세스 및 첫 주문 10% 할인을 받으세요.',
        newsletter_subscribe: '구독하다',
        newsletter_note: '스팸이 없습니다. 언제든지 구독을 취소하세요.',
        footer_desc: '눈에 띄고 지속적인 개선을 위해 고안된 고급 피부 교정 트리트먼트입니다.',
        footer_product: '제품',
        footer_support: '지원하다',
        footer_legal: '합법적인',
        mobile_sticky_shipping: '무료 배송',
        guarantee_text: '30일 만족 보장',
        trust_dermatologist: '피부과 전문의 테스트 완료',
        trust_cruelty_free: '잔인함 없음',
        trust_free_shipping: '전세계 무료 배송',
        nav_where_to_apply: '적용 부위',
        where_heading: '신청 장소',
        where_intro: 'Reverse Five는 표정 라인과 볼륨 변화가 눈에 보이는 부위에 정밀하게 도포되도록 설계되었습니다.',
        zone_forehead: '이마 라인',
        zone_forehead_desc: '이마를 가로지르는 수평 표정선.',
        zone_frown: '미간주름(11초)',
        zone_frown_desc: '눈썹 사이의 수직선.',
        zone_upper_eyelid: '윗눈꺼풀',
        zone_upper_eyelid_desc: '눈가 주름 위 부분에 눈에 띄는 탄력을 선사합니다.',
        zone_under_eye: '눈 밑',
        zone_under_eye_desc: '아래쪽 속눈썹 라인 아래로 붓기와 주름을 잡아줍니다.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: '눈의 바깥쪽 모서리입니다.',
        zone_upper_lip: '윗입술',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: '아랫입술',
        zone_lower_lip_desc: '아랫입술 라인 아래.',
        zone_not_intended: '깊은 팔자주름(코에서 입가까지 이어지는 선)에는 적합하지 않습니다.',

        label_philosophy: '철학',
        label_difference: '차이점',
        label_results: '임상 결과',
        label_approach: '접근법',
        label_experts: '전문가들의 신뢰',
        label_targets: '작용 대상',
        label_mechanism: '메커니즘',
        label_areas: '타겟 부위',
        label_protocol: '프로토콜',
        label_safety: '안전성 우선',
        label_questions: '자주 묻는 질문',
        label_reviews: '실제 사용자',
        philosophy_title: '당신의 몸을 활성화하세요. 나머지는 자연이 할 것입니다.',
        philosophy_intro: 'Zero Lines은 단순한 진실에 기반을 두고 있습니다. 당신의 몸은 이미 스스로 치유하는 방법을 알고 있습니다.',
        philosophy_card1_title: '가리지 마세요. 교정하세요.',
        philosophy_card1_body: '기존 크림은 외부 콜라겐과 합성 필러로 피부를 가득 채웁니다. 사용을 멈추는 순간 효과는 사라집니다. Reverse Five은 피부가 스스로 교정될 수 있는 조건을 만듭니다.',
        philosophy_card2_title: '보충하지 말고, 신호를 보내세요.',
        philosophy_card2_body: '저희 펩타이드 복합체는 피부의 섬유아세포에 자연 콜라겐 생성 주기를 재활성화하라는 신호를 보냅니다. 콜라겐을 직접 제공하지 않습니다. 몸이 다시 만들도록 가르칩니다.',
        philosophy_card3_title: '지속되는 결과.',
        philosophy_card3_body: '교정이 내부에서 일어나기 때문에, 프로토콜 완료 후에도 6~18개월간 결과가 유지됩니다. 매일 의존할 필요도, 끝없는 제품 사이클도 없습니다.',
        philosophy_card4_title: '2년. 1개의 주사기.',
        philosophy_card4_body: '주 1회 트리트먼트. 5분간 도포. 5시간 활성화 윈도우. 주사기 1개당 100회 분량. 구조적이고 단순하며 실제 삶을 위해 설계되었습니다.',
        experts_title: '전문가들의 평가',
        experts_intro: '펩타이드 기반 피부 교정의 과학에 대해 선두 피부과 전문의와 에스테티션이 말합니다.',
        expert1_quote: '제가 평가한 모든 국소 프로토콜 중에서 Reverse Five의 펩타이드 농도와 활성화 메커니즘이 가장 일관된 가시적 결과를 제공합니다. 5시간의 윈도우는 표면 코팅이 아닌 진정한 세포 상호작용을 가능하게 합니다.',
        expert1_stat_label: '환자 만족도',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: '인증 피부과 전문의<br>Harvard Medical School',
        expert2_quote: '펩타이드 시그널링 접근법은 정말로 혁신적입니다. 외부 콜라겐을 추가하는 대신 피부에 자체 생산을 재개하라고 지시합니다. 제 환자들은 8~12주 내에 탄력과 주름 깊이에서 측정 가능한 개선을 보입니다.',
        expert2_stat_label: '가시적 개선',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: '미용 의학 전문의<br>Johns Hopkins Dermatology',
        expert3_quote: '저는 바늘 없이 진정한 구조적 교정을 원하는 고객에게 Reverse Five을 추천합니다. 히알루론산이 수분 장벽을 유지하는 동안 펩타이드가 중추적인 역할을 합니다. 집에서 사용할 수 있는 임상 치료에 가장 가까운 제품입니다.',
        expert3_stat_label: '콜라겐 활성화',
        expert3_name: 'Elena Rodriguez',
        expert3_title: '수석 의료 에스테티션<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: '일반 소비자 크림',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: '주로 표면 수분 공급',
        checklist_creams_2: '단기적 볼륨 효과',
        checklist_creams_3: '매일 도포 필요',
        checklist_creams_4: '임상 검증 없음',
        checklist_creams_5: '중단 시 효과 소멸',
        checklist_creams_6: '활성화 메커니즘 없음',
        checklist_reverse_1: '펩타이드 활성화 프로토콜',
        checklist_reverse_2: '점진적 구조 교정',
        checklist_reverse_3: '주 1회 — 5분 도포',
        checklist_reverse_4: 'GMP 인증 제조',
        checklist_reverse_5: '결과가 6~18개월 유지',
        checklist_reverse_6: '5시간 세포 활성화 윈도우',
    },
    zh: {
        nav_overview: '概述',
        nav_what_it_is: '它是什么',
        nav_results: '结果',
        nav_how_it_works: '它是如何运作的',
        nav_protocol: '协议',
        nav_faq: '常问问题',
        nav_contact: '接触',
        hero_eyebrow: '赫密斯专业',
        hero_title: 'Reverse Five',
        hero_subtitle: '皱纹橡皮擦',
        hero_description: '高级皮肤矫正治疗。肉毒杆菌毒素的非注射替代品。',
        hero_tag1: '每周一次申请',
        hero_tag2: '无创·无痛',
        hero_tag3: '30秒申请',
        hero_tag4: '皮肤科医生测试',
        hero_pill1: '非注射型',
        hero_pill2: '皮肤科医生测试',
        hero_pill3: '100次护理',
        hero_pill4: 'GMP认证',
        hero_cta_secondary: '查看使用方法 →',
        hero_guarantee: '30天退款保证',
        hero_price_week: '每周不到€3',
        hero_price_treatments: '100次护理',
        hero_price_supply: '2年用量',
        add_to_cart: '添加到购物车 — €300',
        learn_more: '了解更多',
        overview_heading: '不同类别的纠正',
        overview_intro: 'Reverse Five 不是一款通过暂时补水来掩盖细纹的保湿霜。它是一种结构化校正协议，旨在支持随着时间的推移进行可见的细化。',
        overview_card1_title: '结构化协议',
        overview_card1_body: '一个明确的应用系统，具有明确的时间、频率和持续时间参数，旨在实现一致的渐进式细化。',
        overview_card2_title: '无针矫正',
        overview_card2_body: '外用，无需注射。旨在支持明显的平滑效果，而不破坏皮肤屏障。',
        overview_card3_title: '除了护肤之外',
        overview_card3_body: '不是替代您的日常治疗，而是与您现有的治疗方案配合使用的补充矫正治疗。',
        what_heading: '该产品旨在支持什么',
        what_benefit1: '帮助改善表情纹，随着时间的推移让外观变得更加光滑',
        what_benefit2: '旨在减少浮肿，尤其是眼下区域',
        what_benefit3: '支持改善明显的紧致度和肤色',
        what_benefit4: '支持皮肤的天然胶原蛋白活性，但本身不含胶原蛋白',
        what_benefit5: '专为精确涂抹到明显关注的目标区域而配制',
        what_benefit6: '适合敏感肌肤，仅外用',
        stats_heading: '结果与统计',
        stats_subtext: '一致使用带来的视觉改善和效果',
        stats_wrinkle_headline: '减少可见皱纹和细纹',
        stats_wrinkle_subtext: '每周坚持使用',
        stats_eyelid_headline: '眼睑提升术',
        stats_eyelid_subtext: '可能有助于减少浮肿并支撑上眼睑的外观',
        stats_maintenance_headline: '结果维持',
        stats_maintenance_subtext: '完成完整方案后，结果可以长期维持',
        stats_disclaimer: '个别结果可能会有所不同。有些人最早 4 周就可以看到最大效果。',
        stats_photo_note: '照片经过轻微编辑，呈现更清晰。单击任何照片即可查看原件。',
        view_original: '查看原件',
        view_edited: '查看已编辑',
        how_heading: '它是如何运作的',
        how_activation_heading: '激活机制',
        how_activation_p1: 'Reverse Five 申请后需要至少 5 小时的激活时间。在此期间，治疗会与皮肤的自然过程相互作用。在此激活窗口期间，请勿清洗或摩擦治疗区域。',
        how_activation_p2: '至少 5 小时后，您可以继续正常的护肤程序。该配方旨在每周坚持使用，逐步发挥作用。',
        how_ingredients_heading: '关键成分体系',
        how_ingredient1_title: '肽',
        how_ingredient1_body: '支持皮肤的结构细化过程，并有助于改善皮肤的紧致度。',
        how_ingredient2_title: '透明质酸',
        how_ingredient2_body: '提供表面水合作用支持，并有助于在矫正过程中保持皮肤水分平衡。',
        how_ingredient3_title: '干细胞复合物',
        how_ingredient3_body: '旨在支持皮肤的自然更新活动和随着时间的推移而明显的细化。',
        protocol_heading: '使用协议',
        protocol_intro: 'Reverse Five 遵循结构化校正协议，具有定义的频率、定时和持续时间参数。一致性是可见细化的基础。',
        protocol_step1_title: '每周申请',
        protocol_step1_body: '每周在目标区域涂抹一次。不要超过建议的频率。',
        protocol_step2_title: '激活窗口',
        protocol_step2_body: '激活至少需要 5 小时。在此期间不宜洗涤或揉搓。',
        protocol_step3_title: '一致性',
        protocol_step3_body: '一支注射器可提供大约 100 次使用，每周使用一次可持续两年。',
        protocol_step4_title: '维护阶段',
        protocol_step4_body: '完成方案后，可见结果可能会维持 6-18 个月。',
        protocol_summary_heading: '协议摘要',
        protocol_row1_label: '频率',
        protocol_row1_value: '每周一次',
        protocol_row2_label: '激活',
        protocol_row2_value: '最少5小时',
        protocol_row3_label: '应用领域',
        protocol_row3_value: '每个注射器约 100 个',
        protocol_row4_label: '期间',
        protocol_row4_value: '使用约 2 年',
        protocol_row5_label: '维护',
        protocol_row5_value: '6–18 个月',
        important_heading: '重要指南',
        important_intro: '遵循这些指南以确保治疗方案的最佳条件。',
        important_do_title: '做',
        important_do_item1: '适用于清洁、干燥的皮肤',
        important_do_item2: '允许至少 5 小时的激活窗口',
        important_do_item3: '每周仅申请一次',
        important_do_item4: '对目标区域进行精准涂抹',
        important_do_item5: '遵循一致的每周时间表',
        important_avoid_title: '避免',
        important_avoid_item1: '在激活窗口期间洗脸',
        important_avoid_item2: '摩擦或触摸治疗区域',
        important_avoid_item3: '超过每周一次的频率',
        important_avoid_item4: '适用于较深的法令纹',
        important_avoid_item5: '内部使用（仅限外部）',
        important_card_title: '仅供外部使用',
        important_card_body: 'Reverse Five 专为外用而设计。不要摄入或涂抹在粘膜或破损的皮肤上。如果出现刺激，请停止使用并咨询医疗保健专业人员。',
        why_heading: '为什么不一样',
        why_intro: 'Reverse Five 代表了一种独特的可见皮肤矫正方法，其结构是一种协议而不是日常护肤产品。',
        why_traditional_label: '传统面霜',
        why_traditional_heading: '表面水化方法',
        why_traditional_item1: '主要以补水为主',
        why_traditional_item2: '短期丰盈效果',
        why_traditional_item3: '需要每日申请',
        why_traditional_item4: '暂时可见改善',
        why_traditional_item5: '停止时效果会迅速减弱',
        why_botox_label: '肉毒杆菌®注射',
        why_botox_heading: '临床神经毒素方法',
        why_botox_item1: '直接注射到面部肌肉',
        why_botox_item2: '冻结运动以抚平皱纹',
        why_botox_item3: '每3-4个月需要到诊所就诊',
        why_botox_item4: '每次治疗€200-€400',
        why_botox_item5: '可能有瘀伤、肿胀、恢复期',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: '结构化校正协议',
        why_reverse_item1: '专为渐进式改进而设计',
        why_reverse_item2: '每周一次的申请系统',
        why_reverse_item3: '定义的激活要求',
        why_reverse_item4: '支持天然胶原蛋白活性',
        why_reverse_item5: '协议完成后的维护阶段',
        why_reverse_item6: '非注射替代方法',
        faq_heading: '常见问题',
        faq_q1: '它会取代我的日常护肤吗？',
        faq_a1: '不会。Reverse Five 是一种补充性矫正护理，旨在与您现有的护肤程序配合使用。继续使用常用的洁面乳、保湿霜和精华液。根据方案指南每周使用Reverse Five一次。',
        faq_q2: '我多久使用一次？',
        faq_a2: '每周一次。该协议专为每周应用而设计，激活窗口至少为 5 小时。请勿超过此频率，因为治疗需要时间来适应皮肤的自然过程。',
        faq_q3: '涂抹后什么时候可以洗脸？',
        faq_a3: '涂抹后至少等待 5 小时再洗脸。在此激活窗口期间，避免清洗或摩擦治疗区域。 5小时后，您可以恢复正常的护肤程序。',
        faq_q4: '我不应该在哪些地方应用它？',
        faq_a4: 'Reverse Five 不适用于深法令纹。重点涂抹目标区域的表情纹：上眼睑、眼睛下方、鱼尾纹、额头纹、眉间纹（11s）以及上下唇纹。避免涂抹在破​​损的皮肤或粘膜上。',
        faq_q5: '适合敏感肌肤吗？',
        faq_a5: '是的。 Reverse Five 的配方适合敏感肌肤，仅供外用。如果您感到任何刺激，请停止使用并咨询医疗保健专业人员。',
        faq_q6: '一支注射器可以使用多长时间？',
        faq_a6: '一支注射器可提供大约 100 次使用。按照建议的每周一次的频率，按照协议持续使用可持续大约两年。',
        faq_q7: '我应该期待什么结果时间表？',
        faq_a7: 'Reverse Five 被设计为渐进式细化协议，而不是即时解决方案。每周坚持使用，效果逐渐显现。完成完整方案（大约一年）后，结果可能会保留 6-18 个月。',
        faq_q8: '我可以与其他产品结合使用吗？',
        faq_a8: '是的，Reverse Five 旨在与您现有的护肤程序配合使用。但是，在 5 小时激活窗口期间，请勿在治疗区域涂抹其他产品。激活后，恢复正常的产品使用方案。',
        cta_title: '体验差异',
        cta_description: '立即开始您的结构化校正协议。一支注射器。两年。看得见的精致。',
        cta_button: '添加到购物车 — €300',
        footer_note1: '信息产品页面 • 零线',
        footer_note2: 'Opatra London • Reverse Five 皱纹橡皮擦',
        cart_title: '您的购物车',
        cart_empty: '您的购物车是空的',
        cart_total: '全部的',
        checkout: '查看',
        checkout_note: '通过 Stripe 进行安全支付',
        reviews_heading: '我们的客户怎么说',
        reviews_subtext: '来自真人的真实经历。加入 3,000 多名满意的客户行列，让Reverse Five成为他们日常生活的一部分。',
        reviews_write_btn: '写评论',
        reviews_modal_title: '分享您的经验',
        reviews_modal_desc: '您的反馈可以帮助其他人发现Reverse Five。',
        reviews_label_name: '你的名字',
        reviews_label_email: '电子邮件',
        reviews_label_rating: '您的评价',
        reviews_label_text: '您的评论',
        reviews_submit_btn: '提交评论',
        contact_title: '联系我们',
        contact_desc: '对Reverse Five还有疑问吗？我们的团队随时为您提供帮助。无论您需要协议、运输信息还是其他任何内容的指导，请给我们发送消息。',
        contact_whatsapp: 'WhatsApp 我们<br><small>+350 5400 5198</small>',
        contact_email: '给我们发电子邮件<br><small>info@zerolines.life</small>',
        contact_label_name: '姓名',
        contact_label_email: '电子邮件',
        contact_label_subject: '主题',
        contact_subject_default: '选择一个主题',
        contact_subject_product: '产品问题',
        contact_subject_shipping: '运输与交付',
        contact_subject_protocol: '使用协议',
        contact_subject_order: '订单查询',
        contact_subject_other: '其他的东西',
        contact_label_message: '信息',
        contact_send_btn: '发送消息',
        contact_response_note: '我们通常会在 24 小时内回复。',
        newsletter_title: '加入零线社区',
        newsletter_desc: '获得独家提示、抢先体验新产品以及首单 10% 折扣。',
        newsletter_subscribe: '订阅',
        newsletter_note: '没有垃圾邮件。随时取消订阅。',
        footer_desc: '先进的皮肤矫正治疗旨在实现明显、持久的细化。',
        footer_product: '产品',
        footer_support: '支持',
        footer_legal: '合法的',
        mobile_sticky_shipping: '免运费',
        guarantee_text: '30 天满意保证',
        trust_dermatologist: '皮肤科医生测试',
        trust_cruelty_free: '无残忍',
        trust_free_shipping: '全球免费送货',
        nav_where_to_apply: '适用部位',
        where_heading: '去哪里申请',
        where_intro: 'Reverse Five 专为精确涂抹于有明显表情纹和体积变化迹象的目标区域而设计。',
        zone_forehead: '额头纹',
        zone_forehead_desc: '横过额头的水平表情纹。',
        zone_frown: '皱眉纹 (11s)',
        zone_frown_desc: '眉毛之间有垂直线。',
        zone_upper_eyelid: '上眼睑',
        zone_upper_eyelid_desc: '位于眼部皱纹上方，提供明显的紧致支撑。',
        zone_under_eye: '眼睛下方',
        zone_under_eye_desc: '位于下眼线下方，消除浮肿和细纹。',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: '外眼角。',
        zone_upper_lip: '上唇',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: '下唇',
        zone_lower_lip_desc: '下唇线下方。',
        zone_not_intended: '不适用于深鼻唇沟（从鼻子到嘴角的线条）。',

        label_philosophy: '品牌理念',
        label_difference: '核心差异',
        label_results: '临床结果',
        label_approach: '技术方案',
        label_experts: '专家信赖',
        label_targets: '针对问题',
        label_mechanism: '作用机制',
        label_areas: '适用部位',
        label_protocol: '使用方案',
        label_safety: '安全至上',
        label_questions: '常见问题',
        label_reviews: '真实用户',
        philosophy_title: '激活身体本能。让自然完成余下的事。',
        philosophy_intro: 'Zero Lines 建立在一个简单的真理之上：你的身体天生就知道如何自我修复。',
        philosophy_card1_title: '不掩盖。真正修正。',
        philosophy_card1_body: '传统面霜用外部胶原蛋白和合成填充剂充斥肌肤。一旦停用，效果即刻消失。Reverse Five 为您的肌肤创造自我修正的条件。',
        philosophy_card2_title: '传递信号，而非直接添加。',
        philosophy_card2_body: '我们的胜肽复合物向肌肤成纤维细胞传递信号，重新激活其天然的胶原蛋白生产周期。我们不直接提供胶原蛋白，而是教会您的身体自行制造。',
        philosophy_card3_title: '持久的效果。',
        philosophy_card3_body: '因为修正是由内而外的，完成疗程后效果可持续维持 6 至 18 个月。无需每日依赖，没有无尽的产品循环。',
        philosophy_card4_title: '两年。一支。',
        philosophy_card4_body: '每周一次护理。涂抹仅需五分钟。五小时激活窗口期。每支约一百次用量。结构清晰、操作简便、为真实生活而设计。',
        experts_title: '专家评价',
        experts_intro: '顶尖皮肤科医生与美容专家解读胜肽护肤的科学原理。',
        expert1_quote: '在我评估过的所有外用方案中，Reverse Five 的胜肽浓度和激活机制带来了最稳定、最显著的可见效果。五小时的窗口期实现了真正的细胞级交互，而非简单的表层覆盖。',
        expert1_stat_label: '患者满意度',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: '认证皮肤科医生<br>Harvard Medical School',
        expert2_quote: '胜肽信号传导方法真正具有创新性。它不是添加外部胶原蛋白，而是指示皮肤恢复自身生产。我的患者在 8 至 12 周内即可观察到紧致度和纹路深度的显著改善。',
        expert2_stat_label: '可见改善率',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: '医美专科医师<br>Johns Hopkins Dermatology',
        expert3_quote: '我向希望在不使用针剂的情况下获得真正结构性改善的客户推荐 Reverse Five。玻尿酸维持肌肤屏障，胜肽承担核心作用。这是您能在家中使用的最接近临床级护理的方案。',
        expert3_stat_label: '胶原蛋白激活',
        expert3_name: 'Elena Rodriguez',
        expert3_title: '首席医疗美容师<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: '普通护肤霜',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: '主要为表层保湿',
        checklist_creams_2: '短期丰盈效果',
        checklist_creams_3: '需要每日使用',
        checklist_creams_4: '无临床验证',
        checklist_creams_5: '停用后效果消失',
        checklist_creams_6: '无激活机制',
        checklist_reverse_1: '胜肽激活方案',
        checklist_reverse_2: '渐进式结构修正',
        checklist_reverse_3: '每周一次 — 涂抹5分钟',
        checklist_reverse_4: 'GMP 认证生产',
        checklist_reverse_5: '效果维持 6–18 个月',
        checklist_reverse_6: '5小时细胞激活窗口',
    },
    ar: {
        nav_overview: 'ملخص',
        nav_what_it_is: 'ما هو عليه',
        nav_results: 'نتائج',
        nav_how_it_works: 'كيف يعمل',
        nav_protocol: 'بروتوكول',
        nav_faq: 'التعليمات',
        nav_contact: 'اتصال',
        hero_eyebrow: 'هيرميس المهنية',
        hero_title: 'Reverse Five',
        hero_subtitle: 'ممحاة التجاعيد',
        hero_description: 'علاج تصحيح الجلد المتقدم. بديل غير قابل للحقن للبوتوكس.',
        hero_tag1: 'تطبيق مرة واحدة في الأسبوع',
        hero_tag2: 'غير الغازية · غير مؤلمة',
        hero_tag3: '30 ثانية للتقديم',
        hero_tag4: 'تم اختباره من قبل أطباء الجلدية',
        hero_pill1: 'غير قابل للحقن',
        hero_pill2: 'تم اختباره من قبل أطباء الجلدية',
        hero_pill3: '100 علاج',
        hero_pill4: 'معتمد GMP',
        hero_cta_secondary: 'شاهد كيف يعمل →',
        hero_guarantee: 'ضمان استرداد الأموال لمدة 30 يومًا',
        hero_price_week: 'أقل من €3 في الأسبوع',
        hero_price_treatments: '100 علاج',
        hero_price_supply: 'توريد لمدة عامين',
        add_to_cart: 'أضف إلى عربة التسوق - 300 جنيه إسترليني',
        learn_more: 'يتعلم أكثر',
        overview_heading: 'فئة مختلفة من التصحيح',
        overview_intro: 'Reverse Five كينج ليس مرطبًا يخفي الخطوط الدقيقة مع ترطيب مؤقت. إنه بروتوكول تصحيح منظم مصمم لدعم التحسين المرئي مع مرور الوقت.',
        overview_card1_title: 'بروتوكول منظم',
        overview_card1_body: 'نظام تطبيق محدد بمعلمات توقيت وتكرار ومدة واضحة مصممة لتحسين تدريجي متسق.',
        overview_card2_title: 'تصحيح بدون إبرة',
        overview_card2_body: 'تطبيق خارجي دون الحاجة إلى الحقن. مصمم لدعم التنعيم المرئي دون كسر حاجز الجلد.',
        overview_card3_title: 'بالإضافة إلى العناية بالبشرة',
        overview_card3_body: 'ليس بديلاً عن روتينك، ولكنه علاج تصحيحي تكميلي يعمل جنبًا إلى جنب مع نظامك الحالي.',
        what_heading: 'ما تم تصميم هذا المنتج لدعمه',
        what_benefit1: 'يساعد على تحسين مظهر الخطوط التعبيرية، ويدعم مظهرًا أكثر نعومة مع مرور الوقت',
        what_benefit2: 'مصمم لتقليل ظهور الانتفاخات، خاصة في منطقة تحت العين',
        what_benefit3: 'يدعم تحسين صلابة البشرة ولون البشرة',
        what_benefit4: 'يدعم نشاط الكولاجين الطبيعي للبشرة دون أن يحتوي على الكولاجين نفسه',
        what_benefit5: 'تم تركيبه للاستخدام الدقيق على المناطق المستهدفة ذات الاهتمام الواضح',
        what_benefit6: 'مناسب للاستخدام على البشرة الحساسة مع تطبيق خارجي فقط',
        stats_heading: 'النتائج والإحصائيات',
        stats_subtext: 'تحسينات ونتائج بصرية مع الاستخدام المتسق',
        stats_wrinkle_headline: 'تقليل التجاعيد المرئية والخطوط الدقيقة',
        stats_wrinkle_subtext: 'مع الاستخدام الأسبوعي المستمر',
        stats_eyelid_headline: 'رفع الجفن',
        stats_eyelid_subtext: 'قد يساعد في تقليل ظهور الانتفاخ ودعم مظهر الجفن العلوي',
        stats_maintenance_headline: 'تم الحفاظ على النتائج',
        stats_maintenance_subtext: 'بعد الانتهاء من البروتوكول الكامل، يمكن الحفاظ على النتائج على المدى الطويل',
        stats_disclaimer: 'قد تختلف النتائج الفردية. قد يرى بعض الأفراد أقصى النتائج في وقت مبكر يصل إلى 4 أسابيع.',
        stats_photo_note: 'تم تعديل الصور بشكل طفيف للحصول على عرض تقديمي أكثر نظافة. انقر على أي صورة لرؤية النسخة الأصلية.',
        view_original: 'عرض الأصل',
        view_edited: 'عرض تم تحريره',
        how_heading: 'كيف يعمل',
        how_activation_heading: 'آلية التنشيط',
        how_activation_p1: 'يتطلب Reverse Five فترة تفعيل لا تقل عن 5 ساعات بعد التطبيق. خلال هذه الفترة، يتفاعل العلاج مع العمليات الطبيعية لبشرتك. لا تغسل أو تفرك المناطق المعالجة أثناء نافذة التنشيط هذه.',
        how_activation_p2: 'بعد مرور 5 ساعات كحد أدنى، يمكنك الاستمرار في روتين العناية بالبشرة الطبيعي. تم تصميم التركيبة للعمل بشكل تدريجي مع الاستخدام الأسبوعي المستمر.',
        how_ingredients_heading: 'نظام المكونات الرئيسية',
        how_ingredient1_title: 'الببتيدات',
        how_ingredient1_body: 'يدعم عمليات التحسين الهيكلي للبشرة ويساعد على تحسين المظهر المرئي للصلابة.',
        how_ingredient2_title: 'حمض الهيالورونيك',
        how_ingredient2_body: 'يوفر دعمًا لترطيب السطح ويساعد في الحفاظ على توازن رطوبة البشرة أثناء عملية التصحيح.',
        how_ingredient3_title: 'مجمع الخلايا الجذعية',
        how_ingredient3_body: 'مصمم لدعم نشاط التجديد الطبيعي للبشرة وتحسين مظهرها مع مرور الوقت.',
        protocol_heading: 'بروتوكول الاستخدام',
        protocol_intro: 'يتبع Reverse Five بروتوكول تصحيح منظم مع معلمات التردد والتوقيت والمدة المحددة. الاتساق هو أساس الصقل المرئي.',
        protocol_step1_title: 'تطبيق أسبوعي',
        protocol_step1_body: 'تنطبق مرة واحدة في الأسبوع على المناطق المستهدفة. لا تتجاوز التردد الموصى به.',
        protocol_step2_title: 'نافذة التنشيط',
        protocol_step2_body: 'السماح بحد أدنى 5 ساعات للتنشيط. عدم غسل أو فرك خلال هذه الفترة.',
        protocol_step3_title: 'تناسق',
        protocol_step3_body: 'توفر المحقنة الواحدة ما يقرب من 100 استخدامًا، وهي مصممة لتدوم لمدة عامان مع الاستخدام الأسبوعي.',
        protocol_step4_title: 'مرحلة الصيانة',
        protocol_step4_body: 'بعد الانتهاء من البروتوكول، يمكن الحفاظ على النتائج المرئية لمدة 6-18 شهرًا.',
        protocol_summary_heading: 'ملخص البروتوكول',
        protocol_row1_label: 'تكرار',
        protocol_row1_value: 'مرة واحدة في الأسبوع',
        protocol_row2_label: 'التنشيط',
        protocol_row2_value: 'الحد الأدنى 5 ساعات',
        protocol_row3_label: 'التطبيقات',
        protocol_row3_value: '~100 لكل حقنة',
        protocol_row4_label: 'مدة',
        protocol_row4_value: '~2 سنة من الاستخدام',
        protocol_row5_label: 'صيانة',
        protocol_row5_value: '6-18 شهرا',
        important_heading: 'إرشادات هامة',
        important_intro: 'اتبع هذه الإرشادات لضمان الظروف المثلى لبروتوكول العلاج.',
        important_do_title: 'يفعل',
        important_do_item1: 'ضعيه على بشرة نظيفة وجافة',
        important_do_item2: 'السماح بفترة التنشيط لمدة 5 ساعات كحد أدنى',
        important_do_item3: 'تطبق مرة واحدة في الأسبوع فقط',
        important_do_item4: 'استخدم التطبيق الدقيق لاستهداف المناطق',
        important_do_item5: 'اتبع جدولًا أسبوعيًا ثابتًا',
        important_avoid_title: 'يتجنب',
        important_avoid_item1: 'غسل الوجه أثناء نافذة التنشيط',
        important_avoid_item2: 'فرك أو لمس المناطق المعالجة',
        important_avoid_item3: 'تجاوز التردد مرة واحدة في الأسبوع',
        important_avoid_item4: 'تنطبق على الطيات الأنفية الشفوية العميقة',
        important_avoid_item5: 'الاستخدام الداخلي (خارجي فقط)',
        important_card_title: 'الاستخدام الخارجي فقط',
        important_card_body: 'تم تصميم Reverse Five حصريًا للتطبيقات الخارجية. لا تبتلع أو تنطبق على الأغشية المخاطية أو الجلد المكسور. في حالة حدوث تهيج، توقف عن الاستخدام واستشر أخصائي الرعاية الصحية.',
        why_heading: 'لماذا الأمر مختلف',
        why_intro: 'يمثل Reverse Five كينج نهجًا متميزًا لتصحيح البشرة المرئية، وقد تم تصميمه كبروتوكول وليس كمنتج يومي للعناية بالبشرة.',
        why_traditional_label: 'الكريمات التقليدية',
        why_traditional_heading: 'نهج الترطيب السطحي',
        why_traditional_item1: 'يعتمد بشكل أساسي على الترطيب',
        why_traditional_item2: 'تأثير نفخ قصير المدى',
        why_traditional_item3: 'مطلوب تطبيق يومي',
        why_traditional_item4: 'تحسن واضح مؤقت',
        why_traditional_item5: 'النتائج تتضاءل بسرعة عند التوقف',
        why_botox_label: 'حقن البوتوكس®',
        why_botox_heading: 'منهج السموم العصبية السريري',
        why_botox_item1: 'يُحقن مباشرة في عضلات الوجه',
        why_botox_item2: 'يجمد الحركة لتنعيم الخطوط',
        why_botox_item3: 'مطلوب زيارة العيادة كل 3–4 أشهر',
        why_botox_item4: '€200–€400 لكل جلسة علاج',
        why_botox_item5: 'كدمات محتملة، تورم، فترة تعافٍ',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'بروتوكول التصحيح المنظم',
        why_reverse_item1: 'مصممة للتحسين التدريجي',
        why_reverse_item2: 'نظام التقديم مرة واحدة في الأسبوع',
        why_reverse_item3: 'متطلبات التنشيط المحددة',
        why_reverse_item4: 'يدعم نشاط الكولاجين الطبيعي',
        why_reverse_item5: 'مرحلة الصيانة بعد الانتهاء من البروتوكول',
        why_reverse_item6: 'نهج بديل غير قابل للحقن',
        faq_heading: 'الأسئلة المتداولة',
        faq_q1: 'هل يحل محل روتين العناية بالبشرة الخاص بي؟',
        faq_a1: 'لا، Reverse Five كينج هو علاج تصحيحي تكميلي مصمم للعمل جنبًا إلى جنب مع روتين العناية بالبشرة الحالي لديك. استمري في استخدام المنظفات والمرطبات والأمصال المعتادة. قم بتطبيق Reverse Five مرة واحدة في الأسبوع وفقًا لإرشادات البروتوكول.',
        faq_q2: 'كم مرة أستخدمه؟',
        faq_a2: 'مرة واحدة في الأسبوع فقط. تم تصميم البروتوكول للتطبيق الأسبوعي مع نافذة تنشيط مدتها 5 ساعات على الأقل. لا تتجاوز هذا التكرار، لأن العلاج يتطلب وقتًا للعمل مع العمليات الطبيعية لبشرتك بين التطبيقات.',
        faq_q3: 'متى يمكنني غسل وجهي بعد التقديم؟',
        faq_a3: 'انتظري ما لا يقل عن 5 ساعات بعد التطبيق قبل غسل وجهك. خلال نافذة التنشيط هذه، تجنب غسل أو فرك المناطق المعالجة. بعد 5 ساعات، يمكنك استئناف روتين العناية بالبشرة الطبيعي.',
        faq_q4: 'أين لا يجب أن أطبقه؟',
        faq_a4: 'Reverse Five كينج ليس مخصصًا للطيات الأنفية الشفوية العميقة. ركزي التطبيق على خطوط التعبير في المناطق المستهدفة: الجفن العلوي، تحت العينين، خطوط قدم الغراب، خطوط الجبهة، خطوط العبوس (11 ثانية)، وخطوط الشفاه العلوية والسفلية. تجنب وضعه على الجلد المكسور أو الأغشية المخاطية.',
        faq_q5: 'هل هو مناسب للبشرة الحساسة؟',
        faq_a5: 'نعم. تم تصميم Reverse Five ليكون مناسبًا للبشرة الحساسة مع تطبيق خارجي فقط. إذا شعرت بأي تهيج، توقف عن الاستخدام واستشر أخصائي الرعاية الصحية.',
        faq_q6: 'كم من الوقت تستمر حقنة واحدة؟',
        faq_a6: 'توفر المحقنة الواحدة حوالي 100 طلبًا. مع التكرار الموصى به مرة واحدة أسبوعيًا، تم تصميم هذا ليدوم حوالي عامين من الاستخدام المستمر بعد البروتوكول.',
        faq_q7: 'ما هو الجدول الزمني للنتائج التي يجب أن أتوقعها؟',
        faq_a7: 'تم تصميم Reverse Five كبروتوكول تحسين تدريجي، وليس كحل فوري. تظهر النتائج المرئية تدريجيًا مع الاستخدام الأسبوعي المستمر. بعد الانتهاء من البروتوكول الكامل (حوالي عامين)، يمكن الحفاظ على النتائج لمدة 6-18 شهرًا.',
        faq_q8: 'هل يمكنني الدمج مع منتجات أخرى؟',
        faq_a8: 'نعم، تم تصميم Reverse Five للعمل جنبًا إلى جنب مع روتين العناية بالبشرة الموجود لديك. ومع ذلك، خلال فترة التنشيط البالغة 5 ساعات، لا تقم بتطبيق منتجات أخرى على المناطق المعالجة. بعد التنشيط، استأنف نظام المنتج العادي الخاص بك.',
        cta_title: 'تجربة الفرق',
        cta_description: 'ابدأ بروتوكول التصحيح المنظم الخاص بك اليوم. حقنة واحدة. سنتان. صقل واضح.',
        cta_button: 'أضف إلى عربة التسوق - 300 جنيه إسترليني',
        footer_note1: 'صفحة المنتج الإعلامية • خطوط الصفر',
        footer_note2: 'Opatra London • ممحاة التجاعيد الملك Reverse Five',
        cart_title: 'سلة التسوق الخاصة بك',
        cart_empty: 'سلة التسوق الخاصة بك فارغة',
        cart_total: 'المجموع',
        checkout: 'الدفع',
        checkout_note: 'الدفع الآمن عبر Stripe',
        reviews_heading: 'ماذا يقول عملاؤنا',
        reviews_subtext: 'تجارب حقيقية من أناس حقيقيين. انضم إلى أكثر من 3000 عميل راضٍ جعلوا Reverse Five جزءًا من روتينهم.',
        reviews_write_btn: 'اكتب مراجعة',
        reviews_modal_title: 'شارك تجربتك',
        reviews_modal_desc: 'تساعد تعليقاتك الآخرين على اكتشاف Reverse Five.',
        reviews_label_name: 'اسمك',
        reviews_label_email: 'بريد إلكتروني',
        reviews_label_rating: 'تقييمك',
        reviews_label_text: 'مراجعتك',
        reviews_submit_btn: 'إرسال المراجعة',
        contact_title: 'تواصل معنا',
        contact_desc: 'هل لديك أسئلة حول Reverse Five كينج؟ فريقنا هنا للمساعدة. سواء كنت بحاجة إلى إرشادات بشأن البروتوكول أو معلومات الشحن أو أي شيء آخر - أرسل لنا رسالة.',
        contact_whatsapp: 'راسلنا عبر الواتس اب<br><small>+350 5400 5198</small>',
        contact_email: 'راسلنا عبر البريد الإلكتروني<br><small>info@zerolines.life</small>',
        contact_label_name: 'اسم',
        contact_label_email: 'بريد إلكتروني',
        contact_label_subject: 'موضوع',
        contact_subject_default: 'اختر موضوعا',
        contact_subject_product: 'سؤال المنتج',
        contact_subject_shipping: 'الشحن والتسليم',
        contact_subject_protocol: 'بروتوكول الاستخدام',
        contact_subject_order: 'الاستعلام عن الطلب',
        contact_subject_other: 'شيء آخر',
        contact_label_message: 'رسالة',
        contact_send_btn: 'أرسل رسالة',
        contact_response_note: 'نرد عادةً خلال 24 ساعة.',
        newsletter_title: 'انضم إلى مجتمع Zero Lines',
        newsletter_desc: 'احصل على نصائح حصرية، والوصول المبكر إلى المنتجات الجديدة، وخصم 10% على طلبك الأول.',
        newsletter_subscribe: 'يشترك',
        newsletter_note: 'لا البريد المزعج. إلغاء الاشتراك في أي وقت.',
        footer_desc: 'علاجات تصحيح الجلد المتقدمة المصممة لتنقية واضحة ودائمة.',
        footer_product: 'منتج',
        footer_support: 'يدعم',
        footer_legal: 'قانوني',
        mobile_sticky_shipping: 'ًالشحن مجانا',
        guarantee_text: 'ضمان الرضا لمدة 30 يومًا',
        trust_dermatologist: 'تم اختباره من قبل أطباء الجلدية',
        trust_cruelty_free: 'القسوة الحرة',
        trust_free_shipping: 'شحن مجاني لجميع أنحاء العالم',
        nav_where_to_apply: 'مناطق الاستخدام',
        where_heading: 'مكان التقديم',
        where_intro: 'تم تصميم Reverse Five للتطبيق الدقيق على المناطق المستهدفة التي تظهر علامات واضحة لخطوط التعبير وتغيرات الحجم.',
        zone_forehead: 'خطوط الجبين',
        zone_forehead_desc: 'خطوط التعبير الأفقية على الجبهة.',
        zone_frown: 'خطوط العبوس (11 ثانية)',
        zone_frown_desc: 'الخطوط العمودية بين الحاجبين.',
        zone_upper_eyelid: 'الجفن العلوي',
        zone_upper_eyelid_desc: 'تجاعيد فوق العين لدعم ثبات واضح.',
        zone_under_eye: 'تحت العين',
        zone_under_eye_desc: 'أسفل خط الرموش السفلي لاستهداف الانتفاخ والخطوط.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'الزوايا الخارجية للعينين.',
        zone_upper_lip: 'الشفة العليا',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'الشفة السفلى',
        zone_lower_lip_desc: 'تحت خط الشفة السفلى.',
        zone_not_intended: 'غير مخصص للطيات الأنفية الشفوية العميقة (الخطوط الممتدة من زوايا الأنف إلى الفم).',

        label_philosophy: 'الفلسفة',
        label_difference: 'الفرق',
        label_results: 'النتائج السريرية',
        label_approach: 'النهج',
        label_experts: 'موثوق به من المحترفين',
        label_targets: 'ما يستهدفه',
        label_mechanism: 'الآلية',
        label_areas: 'مناطق الاستهداف',
        label_protocol: 'البروتوكول',
        label_safety: 'السلامة أولاً',
        label_questions: 'الأسئلة الشائعة',
        label_reviews: 'أناس حقيقيون',
        philosophy_title: 'فعل جسمك. دع الطبيعة تفعل الباقي.',
        philosophy_intro: 'تأسست Zero Lines على حقيقة بسيطة: جسمك يعرف بالفعل كيف يشفي نفسه.',
        philosophy_card1_title: 'لا تُخفِ. صحّح.',
        philosophy_card1_body: 'الكريمات التقليدية تغرق بشرتك بالكولاجين الخارجي والحشوات الاصطناعية. يختفي التأثير في اللحظة التي تتوقف فيها. Reverse Five يخلق الظروف لكي تصحح بشرتك نفسها.',
        philosophy_card2_title: 'أرسل إشارة، لا تُضِف.',
        philosophy_card2_body: 'يُرسل مجمع الببتيدات لدينا إشارة إلى الخلايا الليفية في بشرتك لإعادة تنشيط دورتها الطبيعية لإنتاج الكولاجين. نحن لا نعطيك الكولاجين. نحن نُعلّم جسمك كيف يصنعه مرة أخرى.',
        philosophy_card3_title: 'نتائج تدوم.',
        philosophy_card3_body: 'بما أن التصحيح يأتي من الداخل، تستمر النتائج من 6 إلى 18 شهرًا بعد إكمال البروتوكول. لا اعتماد يومي. لا دورات منتجات لا نهاية لها.',
        philosophy_card4_title: 'سنتان. محقنة واحدة.',
        philosophy_card4_body: 'علاج واحد أسبوعيًا. خمس دقائق للتطبيق. نافذة تنشيط مدتها 5 ساعات. مائة علاج لكل محقنة. منظّم، بسيط، ومُصمم للحياة الواقعية.',
        experts_title: 'ما يقوله الخبراء',
        experts_intro: 'أبرز أطباء الجلدية وأخصائيي التجميل حول علم تصحيح البشرة المستند إلى الببتيدات.',
        expert1_quote: 'من بين جميع البروتوكولات الموضعية التي قيّمتها، يقدّم تركيز الببتيدات في Reverse Five وآلية التنشيط الأكثر ثباتًا من حيث النتائج المرئية. تسمح نافذة الـ 5 ساعات بتفاعل خلوي حقيقي بدلًا من الطلاء السطحي.',
        expert1_stat_label: 'رضا المرضى',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'طبيبة جلدية معتمدة<br>Harvard Medical School',
        expert2_quote: 'نهج إرسال الإشارات بالببتيدات مبتكر حقًا. بدلًا من إضافة كولاجين خارجي، يوجّه البشرة لاستئناف إنتاجها الخاص. يرى مرضاي تحسينات ملموسة في الثبات وعمق الخطوط خلال 8 إلى 12 أسبوعًا.',
        expert2_stat_label: 'تحسن ملحوظ',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'أخصائي طب التجميل<br>Johns Hopkins Dermatology',
        expert3_quote: 'أوصي بـ Reverse Five للعملاء الذين يريدون تصحيحًا هيكليًا حقيقيًا بدون إبر. يحافظ حمض الهيالورونيك على حاجز الرطوبة بينما تقوم الببتيدات بالعمل الشاق. إنه الأقرب إلى علاج سريري يمكنك استخدامه في المنزل.',
        expert3_stat_label: 'تنشيط الكولاجين',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'أخصائية تجميل طبية رئيسية<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'كريمات المستهلك',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'ترطيب سطحي في المقام الأول',
        checklist_creams_2: 'تأثير مؤقت لملء البشرة',
        checklist_creams_3: 'يتطلب التطبيق اليومي',
        checklist_creams_4: 'لا توجد مصداقية سريرية',
        checklist_creams_5: 'تتلاشى النتائج عند التوقف',
        checklist_creams_6: 'لا توجد آلية تنشيط',
        checklist_reverse_1: 'بروتوكول تنشيط الببتيدات',
        checklist_reverse_2: 'تصحيح هيكلي تدريجي',
        checklist_reverse_3: 'مرة أسبوعيًا — 5 دقائق تطبيق',
        checklist_reverse_4: 'تصنيع معتمد GMP',
        checklist_reverse_5: 'تستمر النتائج 6–18 شهرًا',
        checklist_reverse_6: 'نافذة تنشيط خلوي مدتها 5 ساعات',
    },
    el: {
        nav_overview: 'Επισκόπηση',
        nav_what_it_is: 'Τι είναι',
        nav_results: 'Αποτελέσματα',
        nav_how_it_works: 'Πώς λειτουργεί',
        nav_protocol: 'Πρωτόκολλο',
        nav_faq: 'FAQ',
        nav_contact: 'Επαφή',
        hero_eyebrow: 'Opatra London',
        hero_title: 'Reverse Five',
        hero_subtitle: 'Γόμα ρυτίδων',
        hero_description: 'Προηγμένη Θεραπεία Διόρθωσης Δέρματος. Μη ενέσιμη εναλλακτική λύση στο μπότοξ.',
        hero_tag1: 'Εφαρμογή μία φορά την εβδομάδα',
        hero_tag2: 'Μη επεμβατική · Μη επώδυνη',
        hero_tag3: '30 δευτερόλεπτα για την εφαρμογή',
        hero_tag4: 'Δερματολόγος ελεγμένο',
        hero_pill1: 'Μη Ενέσιμο',
        hero_pill2: 'Ελεγμένο από Δερματολόγους',
        hero_pill3: '100 Θεραπείες',
        hero_pill4: 'Πιστοποιημένο GMP',
        hero_cta_secondary: 'Δείτε πώς λειτουργεί →',
        hero_guarantee: 'Εγγύηση Επιστροφής Χρημάτων 30 Ημερών',
        hero_price_week: 'Λιγότερο από €3 την εβδομάδα',
        hero_price_treatments: '100 θεραπείες',
        hero_price_supply: 'Προμήθεια 2 ετών',
        add_to_cart: 'Προσθήκη στο καλάθι — 300 €',
        learn_more: 'Μάθετε περισσότερα',
        overview_heading: 'Μια διαφορετική κατηγορία διόρθωσης',
        overview_intro: 'Το Reverse Five δεν είναι μια ενυδατική κρέμα που καλύπτει τις λεπτές γραμμές με προσωρινή ενυδάτωση. Είναι ένα δομημένο πρωτόκολλο διόρθωσης που έχει σχεδιαστεί για να υποστηρίζει ορατή βελτίωση με την πάροδο του χρόνου.',
        overview_card1_title: 'Δομημένο πρωτόκολλο',
        overview_card1_body: 'Ένα καθορισμένο σύστημα εφαρμογών με σαφείς παραμέτρους χρονισμού, συχνότητας και διάρκειας σχεδιασμένο για σταθερή προοδευτική βελτίωση.',
        overview_card2_title: 'Διόρθωση χωρίς βελόνα',
        overview_card2_body: 'Εξωτερική εφαρμογή χωρίς ένεση. Σχεδιασμένο για να υποστηρίζει την ορατή λείανση χωρίς να σπάει το φράγμα του δέρματος.',
        overview_card3_title: 'Εκτός από την περιποίηση του δέρματος',
        overview_card3_body: 'Δεν αντικαθιστά τη ρουτίνα σας, αλλά μια συμπληρωματική θεραπεία διόρθωσης που λειτουργεί παράλληλα με το υπάρχον σχήμα σας.',
        what_heading: 'Τι έχει σχεδιαστεί για να υποστηρίζει αυτό το προϊόν',
        what_benefit1: 'Βοηθά στη βελτίωση της εμφάνισης των γραμμών έκφρασης, υποστηρίζοντας μια πιο ομαλή εμφάνιση με την πάροδο του χρόνου',
        what_benefit2: 'Σχεδιασμένο για να μειώνει την εμφάνιση του πρηξίματος, ιδιαίτερα στην περιοχή κάτω από τα μάτια',
        what_benefit3: 'Υποστηρίζει τη βελτίωση της ορατής σφριγηλότητας και του τόνου του δέρματος',
        what_benefit4: 'Υποστηρίζει τη φυσική δραστηριότητα κολλαγόνου του δέρματος χωρίς να περιέχει το ίδιο το κολλαγόνο',
        what_benefit5: 'Σχεδιασμένο για εφαρμογή ακριβείας σε στοχευμένες περιοχές ορατού ενδιαφέροντος',
        what_benefit6: 'Κατάλληλο για χρήση σε ευαίσθητο δέρμα με εξωτερική εφαρμογή μόνο',
        stats_heading: 'Αποτελέσματα & Στατιστικά',
        stats_subtext: 'Οπτικές βελτιώσεις και αποτελέσματα με συνεπή χρήση',
        stats_wrinkle_headline: 'Μείωση ορατών ρυτίδων και λεπτών γραμμών',
        stats_wrinkle_subtext: 'Με σταθερή εβδομαδιαία χρήση',
        stats_eyelid_headline: 'Ανύψωση βλεφάρων',
        stats_eyelid_subtext: 'Μπορεί να βοηθήσει στη μείωση της εμφάνισης του πρηξίματος και στη στήριξη της εμφάνισης των άνω βλεφάρων',
        stats_maintenance_headline: 'Τα αποτελέσματα διατηρήθηκαν',
        stats_maintenance_subtext: 'Μετά την ολοκλήρωση του πλήρους πρωτοκόλλου, τα αποτελέσματα ενδέχεται να διατηρηθούν μακροπρόθεσμα',
        stats_disclaimer: 'Τα μεμονωμένα αποτελέσματα ενδέχεται να διαφέρουν. Μερικά άτομα μπορεί να δουν τα μέγιστα αποτελέσματα ήδη από 4 εβδομάδες.',
        stats_photo_note: 'Οι φωτογραφίες έχουν υποστεί ελαφριά επεξεργασία για μια πιο καθαρή παρουσίαση. Κάντε κλικ σε οποιαδήποτε φωτογραφία για να δείτε την αρχική.',
        view_original: 'Προβολή πρωτότυπου',
        view_edited: 'Προβολή Επεξεργασμένη',
        how_heading: 'Πώς λειτουργεί',
        how_activation_heading: 'Μηχανισμός ενεργοποίησης',
        how_activation_p1: 'Το Reverse Five απαιτεί ένα ελάχιστο παράθυρο ενεργοποίησης 5 ωρών μετά την εφαρμογή. Κατά τη διάρκεια αυτής της περιόδου, η θεραπεία αλληλεπιδρά με τις φυσικές διαδικασίες του δέρματός σας. Μην πλένετε ή τρίβετε τις περιοχές που έχουν υποστεί επεξεργασία κατά τη διάρκεια αυτού του παραθύρου ενεργοποίησης.',
        how_activation_p2: 'Μετά το ελάχιστο των 5 ωρών, μπορείτε να συνεχίσετε την κανονική ρουτίνα περιποίησης της επιδερμίδας σας. Η σύνθεση έχει σχεδιαστεί για να λειτουργεί προοδευτικά με συνεπή εβδομαδιαία χρήση.',
        how_ingredients_heading: 'Σύστημα βασικών συστατικών',
        how_ingredient1_title: 'Πεπτίδια',
        how_ingredient1_body: 'Υποστηρίξτε τις δομικές διαδικασίες βελτίωσης του δέρματος και συμβάλετε στη βελτίωση της ορατής όψης σφριγηλότητας.',
        how_ingredient2_title: 'Υαλουρονικό Οξύ',
        how_ingredient2_body: 'Παρέχει υποστήριξη επιφανειακής ενυδάτωσης και βοηθά στη διατήρηση της ισορροπίας της υγρασίας του δέρματος κατά τη διάρκεια της διαδικασίας διόρθωσης.',
        how_ingredient3_title: 'Σύμπλεγμα Βλαστοκυττάρων',
        how_ingredient3_body: 'Σχεδιασμένο για να υποστηρίζει τη φυσική δραστηριότητα ανανέωσης του δέρματος και την ορατή φινέτσα με την πάροδο του χρόνου.',
        protocol_heading: 'Πρωτόκολλο χρήσης',
        protocol_intro: 'Το Reverse Five ακολουθεί ένα δομημένο πρωτόκολλο διόρθωσης με καθορισμένες παραμέτρους συχνότητας, χρονισμού και διάρκειας. Η συνέπεια είναι το θεμέλιο της ορατής τελειοποίησης.',
        protocol_step1_title: 'Εβδομαδιαία εφαρμογή',
        protocol_step1_body: 'Εφαρμόστε μία φορά την εβδομάδα στις στοχευμένες περιοχές. Μην υπερβαίνετε τη συνιστώμενη συχνότητα.',
        protocol_step2_title: 'Παράθυρο ενεργοποίησης',
        protocol_step2_body: 'Αφήστε τουλάχιστον 5 ώρες για ενεργοποίηση. Όχι πλύσιμο ή τρίψιμο κατά τη διάρκεια αυτής της περιόδου.',
        protocol_step3_title: 'Συνοχή',
        protocol_step3_body: 'Μία σύριγγα παρέχει περίπου 100 εφαρμογές, σχεδιασμένες να διαρκούν δύο χρόνια με εβδομαδιαία χρήση.',
        protocol_step4_title: 'Φάση συντήρησης',
        protocol_step4_body: 'Μετά την ολοκλήρωση του πρωτοκόλλου, τα ορατά αποτελέσματα μπορούν να διατηρηθούν για 6–18 μήνες.',
        protocol_summary_heading: 'Περίληψη Πρωτοκόλλου',
        protocol_row1_label: 'Συχνότητα',
        protocol_row1_value: 'Μία φορά την εβδομάδα',
        protocol_row2_label: 'Δραστηριοποίηση',
        protocol_row2_value: 'Τουλάχιστον 5 ώρες',
        protocol_row3_label: 'Εφαρμογές',
        protocol_row3_value: '~100 ανά σύριγγα',
        protocol_row4_label: 'Διάρκεια',
        protocol_row4_value: '~ 2 έτη χρήσης',
        protocol_row5_label: 'Συντήρηση',
        protocol_row5_value: '6-18 μηνών',
        important_heading: 'Σημαντικές οδηγίες',
        important_intro: 'Ακολουθήστε αυτές τις οδηγίες για να εξασφαλίσετε τις βέλτιστες συνθήκες για το πρωτόκολλο θεραπείας.',
        important_do_title: 'Κάνω',
        important_do_item1: 'Εφαρμόστε σε καθαρό, στεγνό δέρμα',
        important_do_item2: 'Επιτρέψτε το παράθυρο ενεργοποίησης τουλάχιστον 5 ωρών',
        important_do_item3: 'Εφαρμόστε μόνο μία φορά την εβδομάδα',
        important_do_item4: 'Χρησιμοποιήστε εφαρμογή ακριβείας για να στοχεύσετε περιοχές',
        important_do_item5: 'Ακολουθήστε σταθερό εβδομαδιαίο πρόγραμμα',
        important_avoid_title: 'Αποφεύγω',
        important_avoid_item1: 'Πλύσιμο προσώπου κατά το παράθυρο ενεργοποίησης',
        important_avoid_item2: 'Τρίψιμο ή άγγιγμα περιοχών που έχουν υποστεί επεξεργασία',
        important_avoid_item3: 'Υπέρβαση συχνότητας μία φορά την εβδομάδα',
        important_avoid_item4: 'Εφαρμογή σε βαθιές ρινοχειλικές πτυχές',
        important_avoid_item5: 'Εσωτερική χρήση (μόνο εξωτερική)',
        important_card_title: 'Μόνο εξωτερική χρήση',
        important_card_body: 'Το Reverse Five έχει σχεδιαστεί αποκλειστικά για εξωτερική εφαρμογή. Μην καταπίνετε ή μην εφαρμόζετε σε βλεννογόνους ή σπασμένο δέρμα. Εάν παρουσιαστεί ερεθισμός, διακόψτε τη χρήση και συμβουλευτείτε έναν επαγγελματία υγείας.',
        why_heading: 'Γιατί είναι διαφορετικό',
        why_intro: 'Το Reverse Five αντιπροσωπεύει μια ξεχωριστή προσέγγιση για την ορατή διόρθωση του δέρματος, δομημένη ως πρωτόκολλο και όχι ως καθημερινό προϊόν περιποίησης δέρματος.',
        why_traditional_label: 'Παραδοσιακές κρέμες',
        why_traditional_heading: 'Προσέγγιση επιφανειακής ενυδάτωσης',
        why_traditional_item1: 'Βασίζεται κυρίως στην ενυδάτωση',
        why_traditional_item2: 'Βραχυπρόθεσμο αποτέλεσμα φουσκώματος',
        why_traditional_item3: 'Απαιτείται καθημερινή εφαρμογή',
        why_traditional_item4: 'Προσωρινή ορατή βελτίωση',
        why_traditional_item5: 'Τα αποτελέσματα μειώνονται γρήγορα όταν σταματάτε',
        why_botox_label: 'Ενέσεις Botox®',
        why_botox_heading: 'Κλινική προσέγγιση νευροτοξίνης',
        why_botox_item1: 'Εγχέεται απευθείας στους μύες του προσώπου',
        why_botox_item2: 'Παγώνει την κίνηση για εξομάλυνση γραμμών',
        why_botox_item3: 'Απαιτείται επίσκεψη σε κλινική κάθε 3–4 μήνες',
        why_botox_item4: '€200–€400 ανά συνεδρία θεραπείας',
        why_botox_item5: 'Πιθανοί μώλωπες, πρήξιμο, χρόνος ανάρρωσης',

        why_reverse_label: 'Reverse Five',
        why_reverse_heading: 'Πρωτόκολλο δομημένης διόρθωσης',
        why_reverse_item1: 'Σχεδιασμένο για προοδευτική βελτίωση',
        why_reverse_item2: 'Σύστημα εφαρμογής μία φορά την εβδομάδα',
        why_reverse_item3: 'Καθορισμένες απαιτήσεις ενεργοποίησης',
        why_reverse_item4: 'Υποστηρίζει τη φυσική δραστηριότητα του κολλαγόνου',
        why_reverse_item5: 'Φάση συντήρησης μετά την ολοκλήρωση του πρωτοκόλλου',
        why_reverse_item6: 'Μη ενέσιμη εναλλακτική προσέγγιση',
        faq_heading: 'Συχνές ερωτήσεις',
        faq_q1: 'Αντικαθιστά τη ρουτίνα περιποίησης της επιδερμίδας μου;',
        faq_a1: 'Όχι. Το Reverse Five είναι μια συμπληρωματική θεραπεία διόρθωσης που έχει σχεδιαστεί για να λειτουργεί παράλληλα με την υπάρχουσα ρουτίνα περιποίησης της επιδερμίδας σας. Συνεχίστε να χρησιμοποιείτε τα κανονικά σας καθαριστικά, ενυδατικές κρέμες και ορούς. Εφαρμόστε το Reverse Five μία φορά την εβδομάδα σύμφωνα με τις οδηγίες του πρωτοκόλλου.',
        faq_q2: 'Πόσο συχνά το χρησιμοποιώ;',
        faq_a2: 'Μόνο μία φορά την εβδομάδα. Το πρωτόκολλο έχει σχεδιαστεί για εβδομαδιαία εφαρμογή με ελάχιστο παράθυρο ενεργοποίησης 5 ωρών. Μην υπερβαίνετε αυτή τη συχνότητα, καθώς η θεραπεία απαιτεί χρόνο για να εργαστείτε με τις φυσικές διαδικασίες του δέρματός σας μεταξύ των εφαρμογών.',
        faq_q3: 'Πότε μπορώ να πλύνω το πρόσωπό μου μετά την εφαρμογή;',
        faq_a3: 'Περιμένετε τουλάχιστον 5 ώρες μετά την εφαρμογή πριν πλύνετε το πρόσωπό σας. Κατά τη διάρκεια αυτού του παραθύρου ενεργοποίησης, αποφύγετε το πλύσιμο ή το τρίψιμο των περιοχών που έχουν υποστεί επεξεργασία. Μετά από 5 ώρες, μπορείτε να συνεχίσετε την κανονική ρουτίνα περιποίησης της επιδερμίδας σας.',
        faq_q4: 'Πού να μην το εφαρμόσω;',
        faq_a4: 'Το Reverse Five δεν προορίζεται για βαθιές ρινοχειλικές πτυχές. Εστιάστε την εφαρμογή στις γραμμές έκφρασης στις περιοχές-στόχους: άνω βλέφαρο, κάτω από τα μάτια, πόδια της χήνας, γραμμές μετώπου, γραμμές συνοφρυώματος (11 δευτερόλεπτα) και γραμμές άνω και κάτω χειλιών. Αποφύγετε την εφαρμογή σε σπασμένο δέρμα ή βλεννογόνους.',
        faq_q5: 'Είναι κατάλληλο για ευαίσθητο δέρμα;',
        faq_a5: 'Ναί. Το Reverse Five έχει σχεδιαστεί για να είναι κατάλληλο για ευαίσθητο δέρμα με εξωτερική εφαρμογή μόνο. Εάν εμφανίσετε ερεθισμό, διακόψτε τη χρήση και συμβουλευτείτε έναν επαγγελματία υγείας.',
        faq_q6: 'Πόσο διαρκεί μια σύριγγα;',
        faq_a6: 'Μία σύριγγα παρέχει περίπου 100 εφαρμογές. Με τη συνιστώμενη συχνότητα μία φορά την εβδομάδα, έχει σχεδιαστεί για να διαρκεί περίπου δύο έτη συνεπούς χρήσης σύμφωνα με το πρωτόκολλο.',
        faq_q7: 'Τι χρονοδιάγραμμα αποτελεσμάτων πρέπει να περιμένω;',
        faq_a7: 'Το Reverse Five έχει σχεδιαστεί ως πρωτόκολλο προοδευτικής βελτίωσης, όχι ως άμεση λύση. Τα ορατά αποτελέσματα αναπτύσσονται σταδιακά σε συνεπή εβδομαδιαία χρήση. Μετά την ολοκλήρωση του πλήρους πρωτοκόλλου (περίπου δύο έτη), τα αποτελέσματα μπορούν να διατηρηθούν για 6–18 μήνες.',
        faq_q8: 'Μπορώ να συνδυάσω με άλλα προϊόντα;',
        faq_a8: 'Ναι, το Reverse Five έχει σχεδιαστεί για να λειτουργεί παράλληλα με την υπάρχουσα ρουτίνα περιποίησης της επιδερμίδας σας. Ωστόσο, κατά τη διάρκεια του παραθύρου ενεργοποίησης 5 ωρών, μην εφαρμόζετε άλλα προϊόντα σε περιοχές που έχουν υποστεί θεραπεία. Μετά την ενεργοποίηση, συνεχίστε το κανονικό σχήμα του προϊόντος σας.',
        cta_title: 'Ζήστε τη διαφορά',
        cta_description: 'Ξεκινήστε σήμερα το δομημένο πρωτόκολλο διόρθωσης. Μία σύριγγα. Δύο χρόνια. Ορατή τελειοποίηση.',
        cta_button: 'Προσθήκη στο καλάθι — 300 €',
        footer_note1: 'Ενημερωτική σελίδα προϊόντος • Zero Lines',
        footer_note2: 'Opatra London • Γόμα ρυτίδων Reverse Five',
        cart_title: 'Το καλάθι σας',
        cart_empty: 'Το καλάθι σας είναι άδειο',
        cart_total: 'Σύνολο',
        checkout: 'Αποχώρηση',
        checkout_note: 'Ασφαλής πληρωμή μέσω Stripe',
        reviews_heading: 'Τι λένε οι πελάτες μας',
        reviews_subtext: 'Πραγματικές εμπειρίες από αληθινούς ανθρώπους. Γίνετε μέλος σε περισσότερους από 3.000 ικανοποιημένους πελάτες που έχουν κάνει το Reverse Five μέρος της ρουτίνας τους.',
        reviews_write_btn: 'Γράψε μια Αξιολόγηση',
        reviews_modal_title: 'Μοιραστείτε την εμπειρία σας',
        reviews_modal_desc: 'Τα σχόλιά σας βοηθούν άλλους να ανακαλύψουν το Reverse Five.',
        reviews_label_name: 'Το όνομά σας',
        reviews_label_email: 'E-mail',
        reviews_label_rating: 'Η βαθμολογία σας',
        reviews_label_text: 'Η κριτική σας',
        reviews_submit_btn: 'Υποβολή κριτικής',
        contact_title: 'Επικοινωνήστε',
        contact_desc: 'Έχετε ερωτήσεις σχετικά με το Reverse Five; Η ομάδα μας είναι εδώ για να βοηθήσει. Είτε χρειάζεστε καθοδήγηση σχετικά με το πρωτόκολλο, πληροφορίες αποστολής ή οτιδήποτε άλλο — στείλτε μας ένα μήνυμα.',
        contact_whatsapp: 'WhatsApp Us<br><small>+350 5400 5198</small>',
        contact_email: 'Στείλτε μας email<br><small>info@zerolines.life</small>',
        contact_label_name: 'Ονομα',
        contact_label_email: 'E-mail',
        contact_label_subject: 'Θέμα',
        contact_subject_default: 'Επιλέξτε ένα θέμα',
        contact_subject_product: 'Ερώτηση προϊόντος',
        contact_subject_shipping: 'Αποστολή & Παράδοση',
        contact_subject_protocol: 'Πρωτόκολλο χρήσης',
        contact_subject_order: 'Ερώτηση παραγγελίας',
        contact_subject_other: 'Κάτι άλλο',
        contact_label_message: 'Μήνυμα',
        contact_send_btn: 'Αποστολή μηνύματος',
        contact_response_note: 'Συνήθως απαντάμε εντός 24 ωρών.',
        newsletter_title: 'Εγγραφείτε στην Κοινότητα Zero Lines',
        newsletter_desc: 'Λάβετε αποκλειστικές συμβουλές, έγκαιρη πρόσβαση σε νέα προϊόντα και έκπτωση 10% στην πρώτη σας παραγγελία.',
        newsletter_subscribe: 'Συνεισφέρω',
        newsletter_note: 'Χωρίς ανεπιθύμητο περιεχόμενο. Απεγγραφή ανά πάσα στιγμή.',
        footer_desc: 'Προηγμένες θεραπείες διόρθωσης δέρματος σχεδιασμένες για ορατή, διαρκή φινέτσα.',
        footer_product: 'Προϊόν',
        footer_support: 'Υποστήριξη',
        footer_legal: 'Νομικός',
        mobile_sticky_shipping: 'Δωρεάν αποστολή',
        guarantee_text: 'Εγγύηση ικανοποίησης 30 ημερών',
        trust_dermatologist: 'Δερματολόγος Ελεγμένο',
        trust_cruelty_free: 'Cruelty Free',
        trust_free_shipping: 'Δωρεάν αποστολή σε όλο τον κόσμο',
        nav_where_to_apply: 'Περιοχές εφαρμογής',
        where_heading: 'Πού να υποβάλετε αίτηση',
        where_intro: 'Το Reverse Five έχει σχεδιαστεί για εφαρμογή ακριβείας σε στοχευμένες περιοχές που εμφανίζουν ορατά σημάδια γραμμών έκφρασης και αλλαγές όγκου.',
        zone_forehead: 'Γραμμές μετώπου',
        zone_forehead_desc: 'Οριζόντιες γραμμές έκφρασης σε όλο το μέτωπο.',
        zone_frown: 'Frown Lines (11 δευτ.)',
        zone_frown_desc: 'Κάθετες γραμμές μεταξύ των φρυδιών.',
        zone_upper_eyelid: 'Άνω βλέφαρο',
        zone_upper_eyelid_desc: 'Πάνω από την πτυχή των ματιών για ορατή στήριξη σφριγηλότητας.',
        zone_under_eye: 'Κάτω από το Μάτι',
        zone_under_eye_desc: 'Κάτω από την κάτω γραμμή των βλεφαρίδων για να στοχεύσετε το πρήξιμο και τις γραμμές.',
        zone_crows_feet: 'Crow\'s Feet',
        zone_crows_feet_desc: 'Οι εξωτερικές γωνίες των ματιών.',
        zone_upper_lip: 'Άνω Χείλος',
        zone_upper_lip_desc: 'Above the upper lip line (smoker\'s lines).',
        zone_lower_lip: 'Κάτω Χείλος',
        zone_lower_lip_desc: 'Κάτω από τη γραμμή του κάτω χείλους.',
        zone_not_intended: 'Δεν προορίζεται για βαθιές ρινοχειλικές πτυχές (οι γραμμές που εκτείνονται από τη μύτη έως τις γωνίες του στόματος).',

        label_philosophy: 'Η Φιλοσοφία',
        label_difference: 'Η Διαφορά',
        label_results: 'Κλινικά Αποτελέσματα',
        label_approach: 'Η Προσέγγιση',
        label_experts: 'Εμπιστοσύνη Επαγγελματιών',
        label_targets: 'Στόχοι',
        label_mechanism: 'Ο Μηχανισμός',
        label_areas: 'Περιοχές Στόχευσης',
        label_protocol: 'Το Πρωτόκολλο',
        label_safety: 'Ασφάλεια Πρώτα',
        label_questions: 'Συχνές Ερωτήσεις',
        label_reviews: 'Πραγματικοί Άνθρωποι',
        philosophy_title: 'Ενεργοποιήστε το Σώμα σας. Αφήστε τη Φύση να Κάνει τα Υπόλοιπα.',
        philosophy_intro: 'Η Zero Lines ιδρύθηκε πάνω σε μια απλή αλήθεια: το σώμα σας ξέρει ήδη πώς να θεραπεύεται μόνο του.',
        philosophy_card1_title: 'Μην Καλύπτετε. Διορθώστε.',
        philosophy_card1_body: 'Οι παραδοσιακές κρέμες πλημμυρίζουν το δέρμα σας με εξωτερικό κολλαγόνο και συνθετικά υλικά πλήρωσης. Το αποτέλεσμα εξαφανίζεται τη στιγμή που σταματάτε. Το Reverse Five δημιουργεί τις συνθήκες για να διορθώσει το δέρμα σας από μόνο του.',
        philosophy_card2_title: 'Στείλτε Σήμα, Μην Προσθέτετε.',
        philosophy_card2_body: 'Το πεπτιδικό μας σύμπλεγμα στέλνει σήμα στα ινοβλάσταρα του δέρματός σας να επανενεργοποιήσουν τον φυσικό κύκλο παραγωγής κολλαγόνου. Δεν σας δίνουμε κολλαγόνο. Διδάσκουμε στο σώμα σας να το παράγει ξανά.',
        philosophy_card3_title: 'Αποτελέσματα που Διαρκούν.',
        philosophy_card3_body: 'Επειδή η διόρθωση έρχεται από μέσα, τα αποτελέσματα διατηρούνται 6 έως 18 μήνες μετά την ολοκλήρωση του πρωτοκόλλου. Καμία καθημερινή εξάρτηση. Κανένας ατελείωτος κύκλος προϊόντων.',
        philosophy_card4_title: 'Δύο Χρόνια. Μία Σύριγγα.',
        philosophy_card4_body: 'Μία εβδομαδιαία θεραπεία. Πέντε λεπτά εφαρμογής. Ένα παράθυρο ενεργοποίησης 5 ωρών. Εκατό θεραπείες ανά σύριγγα. Δομημένο, απλό και σχεδιασμένο για την πραγματική ζωή.',
        experts_title: 'Τι Λένε οι Ειδικοί',
        experts_intro: 'Κορυφαίοι δερματολόγοι και αισθητικοί για την επιστήμη πίσω από την πεπτιδική διόρθωση του δέρματος.',
        expert1_quote: 'Ανάμεσα σε όλα τα τοπικά πρωτόκολλα που έχω αξιολογήσει, η συγκέντρωση πεπτιδίων και ο μηχανισμός ενεργοποίησης του Reverse Five προσφέρουν τα πιο συνεπή ορατά αποτελέσματα. Το παράθυρο των 5 ωρών επιτρέπει γνήσια κυτταρική αλληλεπίδραση αντί για επιφανειακή επικάλυψη.',
        expert1_stat_label: 'Ικανοποίηση Ασθενών',
        expert1_name: 'Dr. Sarah Chen',
        expert1_title: 'Πιστοποιημένη Δερματολόγος<br>Harvard Medical School',
        expert2_quote: 'Η προσέγγιση σηματοδότησης πεπτιδίων είναι πραγματικά καινοτόμα. Αντί να προσθέτει εξωτερικό κολλαγόνο, καθοδηγεί το δέρμα να συνεχίσει τη δική του παραγωγή. Οι ασθενείς μου βλέπουν μετρήσιμες βελτιώσεις στη σφριγηλότητα και το βάθος των γραμμών εντός 8 έως 12 εβδομάδων.',
        expert2_stat_label: 'Ορατή Βελτίωση',
        expert2_name: 'Dr. James Whitfield',
        expert2_title: 'Ειδικός στην Αισθητική Ιατρική<br>Johns Hopkins Dermatology',
        expert3_quote: 'Συνιστώ το Reverse Five σε πελάτες που θέλουν πραγματική δομική διόρθωση χωρίς βελόνες. Το υαλουρονικό οξύ διατηρεί το φράγμα υγρασίας ενώ τα πεπτίδια κάνουν τη βαριά δουλειά. Είναι το πλησιέστερο σε κλινική θεραπεία που μπορείτε να χρησιμοποιήσετε στο σπίτι.',
        expert3_stat_label: 'Ενεργοποίηση Κολλαγόνου',
        expert3_name: 'Elena Rodriguez',
        expert3_title: 'Επικεφαλής Ιατρική Αισθητικός<br>The Skin Clinic, Beverly Hills',
        checklist_creams_title: 'Κρέμες Καταναλωτών',
        checklist_reverse_title: 'Reverse Five',
        checklist_creams_1: 'Κυρίως επιφανειακή ενυδάτωση',
        checklist_creams_2: 'Βραχυπρόθεσμο αποτέλεσμα γεμίσματος',
        checklist_creams_3: 'Απαιτείται καθημερινή εφαρμογή',
        checklist_creams_4: 'Καμία κλινική επικύρωση',
        checklist_creams_5: 'Τα αποτελέσματα εξαφανίζονται όταν σταματήσετε',
        checklist_creams_6: 'Κανένας μηχανισμός ενεργοποίησης',
        checklist_reverse_1: 'Πρωτόκολλο ενεργοποίησης πεπτιδίων',
        checklist_reverse_2: 'Προοδευτική δομική διόρθωση',
        checklist_reverse_3: 'Μία φορά εβδομαδιαίως — 5 λεπτά εφαρμογής',
        checklist_reverse_4: 'Πιστοποιημένη παραγωγή GMP',
        checklist_reverse_5: 'Αποτελέσματα διατηρούνται 6–18 μήνες',
        checklist_reverse_6: 'Παράθυρο κυτταρικής ενεργοποίησης 5 ωρών',
    },
};

let currentLang = localStorage.getItem('reverseLang') || 'es';

function getTranslation(key) {
    return translations[currentLang]?.[key] || translations.en[key] || key;
}

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('reverseLang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const translation = getTranslation(key);
        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.dataset.i18nHtml;
        const translation = getTranslation(key);
        if (translation) {
            el.innerHTML = translation;
        }
    });
}

// Language switcher
document.getElementById('language-select').addEventListener('change', (e) => {
    updateLanguage(e.target.value);
});

// Initialize language
document.getElementById('language-select').value = currentLang;
updateLanguage(currentLang);

// ============================================
// 3D PRODUCT TILT
// ============================================
const productFloat = document.querySelector('.product-float');
const productImg = document.querySelector('.product-image');

if (productFloat && productImg && window.matchMedia('(pointer: fine)').matches) {
    productFloat.classList.add('tilt-enabled');
    
    productFloat.addEventListener('mousemove', (e) => {
        const rect = productFloat.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        productImg.style.transform = `
            perspective(1000px)
            rotateY(${x * 15}deg)
            rotateX(${-y * 15}deg)
            scale(1.02)
        `;
    });
    
    productFloat.addEventListener('mouseleave', () => {
        productImg.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
    });
}

// ============================================
// COLLAGE PHOTOS — DRAG & DROP
// ============================================
(function initCollageDrag() {
    const photos = document.querySelectorAll('.collage-photo');
    
    photos.forEach(photo => {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        let currentX = 0, currentY = 0;
        
        const onDown = (e) => {
            isDragging = true;
            photo.style.transition = 'none';
            photo.style.zIndex = 1000;
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            startX = clientX;
            startY = clientY;
            
            const transform = getComputedStyle(photo).transform;
            if (transform && transform !== 'none') {
                const matrix = new DOMMatrix(transform);
                initialX = matrix.m41;
                initialY = matrix.m42;
            } else {
                initialX = 0;
                initialY = 0;
            }
            
            e.preventDefault();
        };
        
        const onMove = (e) => {
            if (!isDragging) return;
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const dx = clientX - startX;
            const dy = clientY - startY;
            
            currentX = initialX + dx;
            currentY = initialY + dy;
            
            const rotate = photo.style.getPropertyValue('--rotate') || getRotation(photo);
            photo.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate})`;
        };
        
        const onUp = () => {
            if (!isDragging) return;
            isDragging = false;
            photo.style.transition = 'transform 0.3s var(--transition-smooth), box-shadow 0.3s';
            photo.style.zIndex = '';
        };
        
        photo.addEventListener('mousedown', onDown);
        photo.addEventListener('touchstart', onDown, { passive: false });
        
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchend', onUp);
    });
    
    function getRotation(el) {
        const style = getComputedStyle(el);
        const transform = style.transform;
        if (!transform || transform === 'none') return '0deg';
        const matrix = new DOMMatrix(transform);
        return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI) + 'deg';
    }
})();

// Desktop gallery click-to-toggle
document.querySelectorAll('.photo-item').forEach(item => {
    const img = item.querySelector('img');
    const overlay = item.querySelector('.photo-overlay span');
    let showingEdited = true;

    item.addEventListener('click', () => {
        item.classList.add('switching');
        setTimeout(() => {
            if (showingEdited) {
                img.src = img.dataset.original;
                overlay.textContent = getTranslation('view_edited') || 'View Edited';
            } else {
                img.src = img.dataset.edited;
                overlay.textContent = getTranslation('view_original') || 'View Original';
            }
            showingEdited = !showingEdited;
            requestAnimationFrame(() => item.classList.remove('switching'));
        }, 180);
    });
});

// ============================================
// MOBILE GALLERY TAP-TO-TOGGLE
// ============================================
document.querySelectorAll('.mobile-photo-item').forEach(item => {
    const toggle = item.querySelector('.mobile-photo-toggle');
    
    toggle.addEventListener('click', () => {
        const isOriginal = item.classList.toggle('show-original');
        toggle.textContent = isOriginal ? 'Tap to see edited' : 'Tap to see original';
    });
});

// ============================================
// STATS COUNT-UP ANIMATION
// ============================================
document.querySelectorAll('.stat-number').forEach(stat => {
    const text = stat.textContent.trim();
    // Skip ranges like "70-90%" or "6-18mo"
    if (text.includes('-')) return;
    
    const match = text.match(/^[\d.]+/);
    if (!match) return;
    
    const target = parseFloat(match[0]);
    const span = stat.querySelector('span');
    const suffix = span ? span.textContent.replace(match[0], '') : text.replace(match[0], '');
    
    const obj = { val: 0 };
    
    if (typeof gsap !== 'undefined') gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: stat,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        onUpdate: () => {
            const v = target < 1 ? obj.val.toFixed(1) : Math.round(obj.val);
            if (span) {
                span.textContent = v + suffix;
            } else {
                stat.textContent = v + suffix;
            }
        }
    });
});

// ============================================
// MAGNETIC BUTTON EFFECT (Desktop)
// ============================================
if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// ============================================
// PRODUCT IMAGE PARALLAX
// ============================================
if (typeof gsap !== 'undefined') gsap.to('.product-float', {
    y: -50,
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
    }
});

// ============================================
// TEXT REVEAL ANIMATION
// ============================================
document.querySelectorAll('.section-title').forEach(title => {
    const text = title.textContent;
    title.innerHTML = '';
    
    // Split into words
    const words = text.split(' ');
    words.forEach((word, i) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'reveal-word';
        wordSpan.style.display = 'inline-block';
        wordSpan.style.overflow = 'hidden';
        wordSpan.style.marginRight = '0.3em';
        
        const innerSpan = document.createElement('span');
        innerSpan.textContent = word;
        innerSpan.style.display = 'inline-block';
        
        wordSpan.appendChild(innerSpan);
        title.appendChild(wordSpan);
    });
    
    const innerSpans = title.querySelectorAll('.reveal-word > span');
    
    gsap.fromTo(innerSpans,
        { y: '110%', opacity: 0 },
        {
            y: '0%',
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                toggleActions: 'play none none none',
            }
        }
    );
});

// Section intro text fade
document.querySelectorAll('.section-intro').forEach(intro => {
    gsap.fromTo(intro,
        { opacity: 0, y: 20 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: intro,
                start: 'top 88%',
                toggleActions: 'play none none none',
            },
            delay: 0.3
        }
    );
});

// ============================================
// INITIALIZE
// ============================================
console.log('🚀 Zero Lines — Reverse Five Experience Loaded');


// ============================================
// REVIEWS SYSTEM
// ============================================
const reviewModal = document.getElementById('review-modal');
const writeReviewBtn = document.getElementById('write-review-btn');
const reviewModalClose = document.getElementById('review-modal-close');
const reviewForm = document.getElementById('review-form');
const starRatingInput = document.getElementById('star-rating-input');
const reviewRatingField = document.getElementById('review-rating');

if (writeReviewBtn && reviewModal) {
    writeReviewBtn.addEventListener('click', () => {
        reviewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        trackEvent('open_review_form');
    });
}

if (reviewModalClose && reviewModal) {
    reviewModalClose.addEventListener('click', closeReviewModal);
    reviewModal.addEventListener('click', (e) => {
        if (e.target === reviewModal) closeReviewModal();
    });
}

function closeReviewModal() {
    reviewModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Star rating
if (starRatingInput) {
    const starButtons = starRatingInput.querySelectorAll('button');
    let selectedRating = 0;
    
    starButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            selectedRating = index + 1;
            reviewRatingField.value = selectedRating;
            updateStarDisplay(selectedRating);
        });
        
        btn.addEventListener('mouseenter', () => {
            updateStarDisplay(index + 1, true);
        });
    });
    
    starRatingInput.addEventListener('mouseleave', () => {
        updateStarDisplay(selectedRating);
    });
    
    function updateStarDisplay(rating, isHover = false) {
        starButtons.forEach((btn, index) => {
            if (index < rating) {
                btn.classList.add('active');
                btn.querySelector('svg').setAttribute('fill', 'currentColor');
            } else {
                btn.classList.remove('active');
                btn.querySelector('svg').setAttribute('fill', 'none');
            }
        });
    }
}

// Review form submission
if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rating = reviewRatingField.value;
        if (!rating) {
            alert('Please select a star rating.');
            return;
        }
        
        // Store in localStorage as "pending" review
        const reviews = JSON.parse(localStorage.getItem('reversePendingReviews') || '[]');
        reviews.push({
            name: document.getElementById('review-name').value,
            email: document.getElementById('review-email').value,
            rating: rating,
            text: document.getElementById('review-text').value,
            date: new Date().toISOString()
        });
        localStorage.setItem('reversePendingReviews', JSON.stringify(reviews));
        
        trackEvent('submit_review', { rating: rating });
        
        // Show success and close
        reviewForm.innerHTML = `
            <div class="form-success" style="display: flex;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="9 12 11 14 15 10"/>
                </svg>
                <h3>Thank You</h3>
                <p>Your review has been submitted for moderation and will appear shortly.</p>
            </div>
        `;
        
        setTimeout(closeReviewModal, 2500);
    });
}

// ============================================
// MOBILE STICKY CTA
// ============================================
const mobileStickyCta = document.getElementById('mobile-sticky-cta');

if (mobileStickyCta && window.innerWidth <= 768) {
    let heroBottom = 0;
    const heroSection = document.getElementById('hero');
    
    function updateMobileCta() {
        if (!heroSection) return;
        const rect = heroSection.getBoundingClientRect();
        const scrolledPastHero = rect.bottom < 0;
        
        if (scrolledPastHero) {
            mobileStickyCta.classList.add('visible');
        } else {
            mobileStickyCta.classList.remove('visible');
        }
    }
    
    if (lenis) lenis.on('scroll', updateMobileCta);
    updateMobileCta();
}

// ============================================
// CONTACT FORM
// ============================================
const contactForm = document.getElementById('contact-form');
const contactSuccess = document.getElementById('contact-success');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const action = contactForm.getAttribute('action');
        
        // If Formspree ID is set, submit to Formspree
        if (action && !action.includes('YOUR_FORM_ID')) {
            fetch(action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    showContactSuccess();
                } else {
                    alert('Something went wrong. Please try again or contact us via WhatsApp.');
                }
            })
            .catch(() => {
                alert('Something went wrong. Please try again or contact us via WhatsApp.');
            });
        } else {
            // Fallback: store in localStorage and show success
            showContactSuccess();
        }
        
        trackEvent('submit_contact');
    });
}

function showContactSuccess() {
    if (contactForm) contactForm.style.display = 'none';
    if (contactSuccess) contactSuccess.style.display = 'flex';
}

// ============================================
// NEWSLETTER FORM
// ============================================
const newsletterForm = document.getElementById('newsletter-form');
const newsletterSuccess = document.getElementById('newsletter-success');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(newsletterForm);
        const action = newsletterForm.getAttribute('action');
        
        if (action && !action.includes('YOUR_NEWSLETTER_ID')) {
            fetch(action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    showNewsletterSuccess();
                } else {
                    alert('Something went wrong. Please try again.');
                }
            })
            .catch(() => {
                alert('Something went wrong. Please try again.');
            });
        } else {
            showNewsletterSuccess();
        }
        
        trackEvent('subscribe_newsletter');
    });
}

function showNewsletterSuccess() {
    if (newsletterForm) newsletterForm.style.display = 'none';
    if (newsletterSuccess) newsletterSuccess.style.display = 'flex';
}

// ============================================
// LAZY-LOAD TRANSLATIONS
// ============================================
const translationCache = {};
const lazyLoadLanguages = ['es', 'fr', 'de', 'pt', 'da', 'pl', 'ru', 'it', 'nl', 'sv', 'ja', 'ko', 'zh', 'ar', 'el'];

// Preload the current language if it's not English
function preloadCurrentLanguage() {
    if (currentLang !== 'en' && !translationCache[currentLang]) {
        loadTranslationFile(currentLang);
    }
}

function loadTranslationFile(lang) {
    if (translationCache[lang]) {
        return Promise.resolve(translationCache[lang]);
    }
    
    // For now, translations are still inline. This function is a placeholder
    // for when translations are moved to external JSON files.
    // Example: return fetch(`translations/${lang}.json`).then(r => r.json());
    return Promise.resolve(null);
}

// Modified updateLanguage to handle RTL
const originalUpdateLanguage = updateLanguage;
updateLanguage = function(lang) {
    currentLang = lang;
    localStorage.setItem('reverseLang', lang);
    document.documentElement.lang = lang;
    
    // RTL handling
    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const translation = getTranslation(key);
        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        }
    });
    
    // Update FAQ schema
    updateFaqSchema();
    
    // Track language change
    trackEvent('change_language', { language: lang });
};

// Initialize RTL on page load
if (currentLang === 'ar') {
    document.documentElement.dir = 'rtl';
}

// ============================================
// FAQ SCHEMA POPULATION
// ============================================
function updateFaqSchema() {
    const faqSchema = document.getElementById('faq-schema');
    if (!faqSchema) return;
    
    const faqItems = document.querySelectorAll('.faq-item');
    const mainEntity = [];
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question span');
        const answer = item.querySelector('.faq-answer p');
        
        if (question && answer) {
            mainEntity.push({
                '@type': 'Question',
                name: question.textContent.trim(),
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: answer.textContent.trim()
                }
            });
        }
    });
    
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: mainEntity
    };
    
    faqSchema.textContent = JSON.stringify(schema, null, 2);
}

// Populate FAQ schema on load
updateFaqSchema();

// ============================================
// ANALYTICS TRACKING
// ============================================
function trackEvent(eventName, params = {}) {
    // Google Analytics 4
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    }
    
    // Meta Pixel
    if (typeof fbq === 'function') {
        fbq('trackCustom', eventName, params);
    }
}

// Track add to cart
const originalAddToCart = addToCart;
addToCart = function(product) {
    originalAddToCart(product);
    trackEvent('add_to_cart', {
        currency: 'EUR',
        value: product.price,
        items: [{
            item_name: product.name,
            item_id: product.id,
            price: product.price,
            quantity: 1
        }]
    });
};

// Track checkout initiation
checkoutBtn.addEventListener('click', () => {
    const { subtotal, discount, total } = calculateTotals();
    trackEvent('begin_checkout', {
        currency: 'EUR',
        value: total,
        items: cart.map(item => ({
            item_name: item.name,
            item_id: item.id,
            price: item.price,
            quantity: item.quantity
        }))
    });
});

// Track promo code application
const originalApplyPromoCode = applyPromoCode;
applyPromoCode = function() {
    const code = promoInput.value.trim().toUpperCase();
    originalApplyPromoCode();
    
    if (appliedPromo && appliedPromo.code === code) {
        trackEvent('apply_promo', {
            code: code,
            discount_type: promoCodes[code]?.type,
            discount_value: promoCodes[code]?.value
        });
    }
};

// Track page engagement
let maxScrollDepth = 0;
if (lenis) lenis.on('scroll', ({ scroll, limit }) => {
    const depth = Math.round((scroll / limit) * 100);
    if (depth > maxScrollDepth) {
        maxScrollDepth = depth;
        if (maxScrollDepth === 25 || maxScrollDepth === 50 || maxScrollDepth === 75 || maxScrollDepth === 90) {
            trackEvent('scroll_depth', { depth: maxScrollDepth });
        }
    }
});

// ============================================
// REDUCED MOTION DETECTION
// ============================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    // Disable GSAP animations
    if (typeof gsap !== 'undefined') gsap.globalTimeline.pause();
    
    // Disable canvas
    const canvas = document.getElementById('hero-canvas');
    if (canvas) canvas.style.display = 'none';
    
    // Disable orbs
    document.querySelectorAll('.orb').forEach(orb => orb.style.display = 'none');
    
    // Show all scroll-reveal elements immediately
    document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.clipPath = 'none';
    });
}

// ============================================
// PREFERS REDUCED MOTION LISTENER
// ============================================
prefersReducedMotion.addEventListener('change', (e) => {
    if (e.matches) {
        if (typeof gsap !== 'undefined') gsap.globalTimeline.pause();
    } else {
        if (typeof gsap !== 'undefined') gsap.globalTimeline.resume();
    }
});

// ============================================
// UPDATE CART UI WITH PRODUCT IMAGE FIX
// ============================================
// Override updateCartUI to use dynamic product image
const originalUpdateCartUI = updateCartUI;
updateCartUI = function() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'flex';
        cartFooter.style.display = 'none';
    } else {
        cartEmpty.style.display = 'none';
        cartFooter.style.display = 'block';
        
        cart.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="assets/reverse-five.png" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-quantity">
                        <button class="qty-btn" data-index="${index}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" data-index="${index}" data-change="1">+</button>
                    </div>
                    <button class="cart-item-remove" data-index="${index}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            `;
            cartItems.appendChild(itemEl);
        });
        
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.index), parseInt(btn.dataset.change)));
        });
        
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.index)));
        });
    }
    
    const { subtotal, discount, total } = calculateTotals();
    
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.classList.toggle('visible', cart.length > 0);
    
    document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
    
    const discountRow = document.getElementById('cart-discount-row');
    if (discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('cart-discount').textContent = `-${formatPrice(discount)}`;
    } else {
        discountRow.style.display = 'none';
    }
    
    cartTotalEl.textContent = formatPrice(total);
};

// ============================================
// INITIALLY PRELOAD CURRENT LANGUAGE
// ============================================
preloadCurrentLanguage();

// ============================================
// ENHANCED INITIALIZE
// ============================================
console.log('🚀 Zero Lines — Reverse Five Experience Loaded');
console.log('Features: Reviews, Contact Form, Newsletter, Analytics, RTL, Lazy Loading');


// ============================================
// WHERE TO APPLY — INTERACTIVE DIAGRAM
// ============================================
const zoneItems = document.querySelectorAll('.zone-item');
const targetZones = document.querySelectorAll('.face-overlay .target-zone');

zoneItems.forEach(item => {
    const zone = item.dataset.zone;
    
    item.addEventListener('mouseenter', () => {
        highlightZone(zone);
    });
    
    item.addEventListener('mouseleave', () => {
        clearZoneHighlight();
    });
});

targetZones.forEach(zone => {
    const zoneName = zone.dataset.zone;
    
    zone.addEventListener('mouseenter', () => {
        highlightZone(zoneName);
    });
    
    zone.addEventListener('mouseleave', () => {
        clearZoneHighlight();
    });
});

function highlightZone(zoneName) {
    // Highlight SVG target zone
    targetZones.forEach(z => {
        if (z.dataset.zone === zoneName) {
            z.classList.add('active');
        } else {
            z.style.opacity = '0.3';
        }
    });
    
    // Highlight list item
    zoneItems.forEach(item => {
        if (item.dataset.zone === zoneName) {
            item.classList.add('active');
        } else {
            item.style.opacity = '0.4';
        }
    });
}

function clearZoneHighlight() {
    targetZones.forEach(z => {
        z.classList.remove('active');
        z.style.opacity = '';
    });
    
    zoneItems.forEach(item => {
        item.classList.remove('active');
        item.style.opacity = '';
    });
}


/* ============================================
   FOOTER YEAR
   ============================================ */
(function initFooterYear() {
    var yearEl = document.getElementById('footer-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
})();

/* ============================================
   EXIT-INTENT EMAIL CAPTURE
   ============================================ */
(function initExitIntentPopup() {
    var popup = document.getElementById('exit-popup');
    var form = document.getElementById('exit-popup-form');
    var input = document.getElementById('exit-popup-email');
    var successMsg = document.getElementById('exit-popup-success');
    var closeBtn = popup ? popup.querySelector('.exit-popup-close') : null;
    var backdrop = popup ? popup.querySelector('.exit-popup-backdrop') : null;

    if (!popup || !form) return;

    // Don't show if user already subscribed this session
    if (sessionStorage.getItem('exitPopupDismissed')) return;
    if (sessionStorage.getItem('exitPopupSubscribed')) return;

    var shown = false;
    var COOLDOWN_MS = 30000; // Minimum 30s before popup can show
    var pageLoadTime = Date.now();

    function showPopup() {
        if (shown) return;
        if (Date.now() - pageLoadTime < COOLDOWN_MS) return;
        shown = true;
        popup.classList.add('active');
        popup.setAttribute('aria-hidden', 'false');
        if (input) input.focus();
    }

    function hidePopup() {
        popup.classList.remove('active');
        popup.setAttribute('aria-hidden', 'true');
        sessionStorage.setItem('exitPopupDismissed', '1');
    }

    function handleSubscribe(e) {
        e.preventDefault();
        var email = input.value.trim();
        if (!email || !input.validity.valid) return;

        // Store email in localStorage (array of emails)
        var emails = JSON.parse(localStorage.getItem('zeroLinesEmails') || '[]');
        if (emails.indexOf(email) === -1) {
            emails.push(email);
            localStorage.setItem('zeroLinesEmails', JSON.stringify(emails));
        }

        sessionStorage.setItem('exitPopupSubscribed', '1');
        form.style.display = 'none';
        var disclaimer = popup.querySelector('.exit-popup-disclaimer');
        if (disclaimer) disclaimer.style.display = 'none';
        if (successMsg) successMsg.classList.add('visible');

        // Auto-close after 3 seconds
        setTimeout(function() {
            hidePopup();
        }, 3000);
    }

    // Desktop: mouse leaving viewport toward top
    document.addEventListener('mouseout', function(e) {
        if (e.clientY <= 0 && !shown) {
            showPopup();
        }
    });

    // Mobile: show after 45 seconds if scrolled at least 30%
    var mobileTimer;
    var mobileTriggered = false;
    function checkMobileTrigger() {
        if (mobileTriggered || shown) return;
        var scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        if (scrollPercent > 0.3) {
            mobileTriggered = true;
            showPopup();
        }
    }

    if (window.matchMedia('(pointer: coarse)').matches) {
        window.addEventListener('scroll', checkMobileTrigger, { passive: true });
        mobileTimer = setTimeout(function() {
            if (!shown) showPopup();
        }, 45000);
    }

    // Close handlers
    if (closeBtn) closeBtn.addEventListener('click', hidePopup);
    if (backdrop) backdrop.addEventListener('click', hidePopup);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            hidePopup();
        }
    });

    // Submit handler
    form.addEventListener('submit', handleSubscribe);
})();

// ============================================
// PRODUCT MOUSE-FOLLOW TILT
// ============================================
(function() {
    const productFloat = document.getElementById('product-tilt');
    const productImg = productFloat ? productFloat.querySelector('.product-image') : null;
    if (!productFloat || !productImg) return;

    let bounds;
    function onResize() { bounds = productFloat.getBoundingClientRect(); }
    window.addEventListener('resize', onResize);
    onResize();

    productFloat.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const leftX = mouseX - bounds.x;
        const topY = mouseY - bounds.y;
        const center = {
            x: leftX - bounds.width / 2,
            y: topY - bounds.height / 2
        };
        const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
        const maxDistance = Math.sqrt((bounds.width / 2) ** 2 + (bounds.height / 2) ** 2);
        const intensity = Math.min(distance / maxDistance, 1);

        productImg.style.transform = `
            translateY(${Math.sin(Date.now() / 800) * 8}px)
            rotateY(${center.x / 20}deg)
            rotateX(${-center.y / 20}deg)
            scale(${1 + intensity * 0.02})
        `;
    });

    productFloat.addEventListener('mouseleave', function() {
        productImg.style.transform = '';
    });
})();
