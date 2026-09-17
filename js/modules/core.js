
gsap.registerPlugin(ScrollTrigger);

// -- DOM refs --
const can       = document.getElementById('monster-can');
const shadow    = document.querySelector('.can-shadow');
const bgGlow    = document.getElementById('bgGlow');
const navBrand  = document.getElementById('nav-brand');
const navIcon   = document.querySelector('.nav-icon');
const navCta    = document.querySelector('.nav-cta');
const flavourLbl = document.getElementById('flavour-name');
const btns      = document.querySelectorAll('.color-btn');
const root      = document.documentElement;
const navbar    = document.getElementById('navbar');
const scrollHint = document.getElementById('scroll-hint');

// -- cursor --
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX, ringY = mouseY;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(cursorDot, { x: mouseX, y: mouseY });
});

gsap.ticker.add(() => {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    gsap.set(cursorRing, { x: ringX, y: ringY });
});

function bindCursorHovers() {
    document.querySelectorAll('a, button, .nav-cta, .color-btn, .fl-btn, .overlay-btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursorRing, { width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'transparent', duration: 0.3, ease: 'expo.out' });
            gsap.to(cursorDot, { scale: 0, duration: 0.2 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursorRing, { width: 32, height: 32, backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.4)', duration: 0.3, ease: 'expo.out' });
            gsap.to(cursorDot, { scale: 1, duration: 0.2 });
        });
    });
}
bindCursorHovers();

// -- nav scroll-spy --
const navLinks = {
    home:     document.getElementById('nav-home'),
    flavours: document.getElementById('nav-flavours'),
    events:   document.getElementById('nav-events'),
    news:     document.getElementById('nav-news'),
    game:     document.getElementById('nav-game'),
};

const sections = {
    home:     document.getElementById('home'),
    flavours: document.getElementById('flavours'),
    events:   document.getElementById('events'),
    news:     document.getElementById('news'),
    game:     document.getElementById('game'),
};

function setActiveNav(id) {
    Object.values(navLinks).forEach(l => l && l.classList.remove('nav-active'));
    if (navLinks[id]) navLinks[id].classList.add('nav-active');
}

// fires when section ≥15% visible
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) setActiveNav(entry.target.id);
    });
}, { threshold: 0.15 });

Object.values(sections).forEach(sec => sec && sectionObserver.observe(sec));

// -- loader --
const loader       = document.getElementById('loader');
const loaderBar    = document.getElementById('loader-bar');
const loaderLogo   = document.getElementById('loader-logo');
const loaderLetters = document.querySelectorAll('#loader-tagline span:not(.loader-space)');

document.body.style.overflow = 'hidden'; // lock scroll during load

const loaderTl = gsap.timeline({
    onComplete: () => {
        gsap.to(loader, {
            yPercent: -105, duration: 1, ease: 'expo.inOut',
            onComplete: () => {
                loader.remove();
                document.body.style.overflow = '';
                gsap.from(can, { opacity: 0, y: 60, scale: 0.85, duration: 1, ease: 'expo.out' });
                gsap.from('.switch-menu', { opacity: 0, y: 30, duration: 0.8, ease: 'expo.out', delay: 0.2 });
                gsap.from(scrollHint, { opacity: 0, y: 20, duration: 0.8, ease: 'expo.out', delay: 0.5 });
            }
        });
    }
});

loaderTl
    .to(loaderLogo, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2)' })
    .to(loaderBar, { width: '100%', duration: 1.4, ease: 'power2.inOut' }, '-=0.2')
    .to(loaderLetters, { opacity: 1, y: 0, duration: 0.05, stagger: 0.04, ease: 'power2.out' }, '-=1.0')
    .to({}, { duration: 0.5 })
    .to(loaderLogo, { filter: 'drop-shadow(0 0 40px #7fc12b) drop-shadow(0 0 80px #7fc12b)', duration: 0.3 })
    .to(loaderLogo, { opacity: 0, scale: 1.2, duration: 0.4, ease: 'power2.in' });

// -- navbar scroll state (RAF-throttled so it doesn't fire 100x/s) --
let scrollScheduled = false;
window.addEventListener('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
        gsap.to(scrollHint, { opacity: window.scrollY > 40 ? 0 : 1, duration: 0.4 });
        scrollScheduled = false;
    });
});

// -- initial accent --
setAccent('#7fc12b', false);

// -- can float anim --
let floatTween = startFloat();
function startFloat() {
    return gsap.to(can, { y: -28, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
}
gsap.to(shadow, { scaleX: 0.75, opacity: 0.25, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });

// -- color button clicks --
btns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        switchFlavour(btn.dataset.color, btn.dataset.hex, btn.dataset.name);
    });
});

function switchFlavour(colour, hex, name) {
    floatTween.pause();
    const tl = gsap.timeline({
        onComplete: () => { gsap.set(can, { y: 0 }); floatTween.kill(); floatTween = startFloat(); }
    });
    tl.to(can, {
        opacity: 0, y: 60, scale: 0.82, rotation: -12, duration: 0.38, ease: 'expo.inOut',
        onComplete: () => { can.src = `assets/images/${colour}.png`; setAccent(hex); }
    }).to(can, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.7, ease: 'expo.out' });

    gsap.to(flavourLbl, {
        opacity: 0, y: 8, duration: 0.2,
        onComplete: () => { flavourLbl.textContent = name; gsap.to(flavourLbl, { opacity: 1, y: 0, duration: 0.3 }); }
    });
}

function setAccent(hex, animate = true) {
    root.style.setProperty('--accent', hex);
    if (animate) {
        gsap.to(navBrand, { color: hex, textShadow: `0 0 16px ${hex}, 0 0 4px ${hex}`, duration: 0.5, ease: 'expo.out' });
        gsap.to(navCta, { borderColor: hex, color: hex, duration: 0.5 });
    } else {
        gsap.set(navBrand, { color: hex, textShadow: `0 0 16px ${hex}, 0 0 4px ${hex}` });
        gsap.set(navCta, { borderColor: hex, color: hex });
    }
    if (navIcon) navIcon.style.filter = `drop-shadow(0 0 8px ${hex}) drop-shadow(0 0 2px ${hex})`;
    bgGlow.style.background = `radial-gradient(ellipse 70% 60% at 50% 55%, ${hex}2e 0%, transparent 70%)`;
}

// -- flavours scroll animations --
const heroAccent = document.getElementById('fl-title-accent');

gsap.from('.fl-hero-title', { opacity: 0, y: 50, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.fl-hero', start: 'top 80%' } });
gsap.from('.fl-hero-sub',   { opacity: 0, y: 30, duration: 0.8, delay: 0.2, ease: 'expo.out', scrollTrigger: { trigger: '.fl-hero', start: 'top 80%' } });

document.querySelectorAll('.fl-row').forEach((row) => {
    const hex = row.dataset.accent;
    const flCan = row.querySelector('.fl-can');
    const card  = row.querySelector('.fl-detail-card');
    const isReverse = row.classList.contains('fl-row--reverse');

    row.style.setProperty('--row-accent', hex);
    gsap.set(flCan, { opacity: 1 });
    gsap.set(card, { opacity: 1 });

    gsap.from(flCan, {
        opacity: 0, x: isReverse ? 80 : -80, scale: 0.88, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 75%', toggleActions: 'play none none reverse' }
    });
    gsap.from(card, {
        opacity: 0, x: isReverse ? -60 : 60, y: 20, duration: 1, delay: 0.15, ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 75%', toggleActions: 'play none none reverse' }
    });
    gsap.to(flCan, {
        y: -18, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut',
        scrollTrigger: { trigger: row, start: 'top 80%', toggleActions: 'play pause resume pause' }
    });

    ScrollTrigger.create({
        trigger: row, start: 'top 50%', end: 'bottom 50%',
        onEnter: () => applyFlAccent(hex),
        onEnterBack: () => applyFlAccent(hex),
    });
});

function applyFlAccent(hex) {
    root.style.setProperty('--accent', hex);
    gsap.to(navBrand, { color: hex, textShadow: `0 0 16px ${hex}, 0 0 4px ${hex}`, duration: 0.6, ease: 'expo.out' });
    gsap.to(navCta, { borderColor: hex, color: hex, duration: 0.5 });
    gsap.to(heroAccent, { color: hex, duration: 0.6 });
    if (navIcon) navIcon.style.filter = `drop-shadow(0 0 8px ${hex}) drop-shadow(0 0 2px ${hex})`;
    bgGlow.style.background = `radial-gradient(ellipse 70% 60% at 50% 55%, ${hex}2e 0%, transparent 70%)`;
}

// -- smooth anchor scroll + instant active nav update --
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href   = this.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('nav-active'));
            this.classList.add('nav-active');
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// -- events section accent + entrance --
ScrollTrigger.create({
    trigger: '#events', start: 'top 50%', end: 'bottom 50%',
    onEnter: () => applyFlAccent('#e6c200'),
    onEnterBack: () => applyFlAccent('#e6c200'),
});

gsap.from('.ev-heading', {
    opacity: 0, y: 50, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: '.ev-heading', start: 'top 82%' }
});

gsap.from('.ev-card--featured', {
    opacity: 0, x: -60, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.ev-layout', start: 'top 78%' }
});
gsap.from('.ev-card--small', {
    opacity: 0, x: 50, duration: 0.9, ease: 'expo.out', stagger: 0.12,
    scrollTrigger: { trigger: '.ev-layout', start: 'top 78%' }
});

// -- event modal refs --
const modalBackdrop = document.getElementById('ev-modal-backdrop');
const modalImg      = document.getElementById('ev-modal-img');
const modalGlow     = document.getElementById('ev-modal-img-glow');
const modalTag      = document.getElementById('ev-modal-tag');
const modalTitle    = document.getElementById('ev-modal-title');
const modalDate     = document.getElementById('ev-modal-date');
const modalDesc     = document.getElementById('ev-modal-desc');
const modalClose    = document.getElementById('ev-modal-close');

const eventImgMap = {
    f1:         'assets/images/Event_F1.jpg',
    motogp:     'assets/images/Event_MotoGP.jpg',
    basketball: 'assets/images/Event_basketball.jpg',
    football:   'assets/images/Event_football.jpg',
};

const eventGlowMap = {
    f1:         'rgba(220,30,30,0.25)',
    motogp:     'rgba(0,180,255,0.2)',
    basketball: 'rgba(255,140,0,0.2)',
    football:   'rgba(50,200,80,0.2)',
};

function openModal(card) {
    const key   = card.dataset.event;
    const title = card.dataset.title;
    const date  = card.dataset.date;
    const desc  = card.dataset.desc;
    const tag   = card.querySelector('.ev-card-tag').textContent;

    modalImg.src   = eventImgMap[key] || '';
    modalImg.alt   = title;
    modalTag.textContent   = tag;
    modalTitle.textContent = title;
    modalDate.textContent  = date;
    modalDesc.textContent  = desc;
    modalGlow.style.background = `linear-gradient(135deg, ${eventGlowMap[key] || 'rgba(127,193,43,0.2)'} 0%, transparent 60%)`;

    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    gsap.fromTo('#ev-modal',
        { y: 40, scale: 0.95, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'expo.out' }
    );
    bindCursorHovers(); // rebind hovers for modal buttons
}

function closeModal() {
    gsap.to('#ev-modal', {
        y: 30, scale: 0.97, opacity: 0, duration: 0.35, ease: 'expo.in',
        onComplete: () => { modalBackdrop.classList.remove('open'); document.body.style.overflow = ''; }
    });
}

document.querySelectorAll('.ev-card').forEach(card => {
    card.addEventListener('click', () => openModal(card));
});
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) closeModal();
});

// events section in observer
const evSection = document.getElementById('events');
if (evSection) sectionObserver.observe(evSection);

// -- carousel arrows --
const evLayout = document.getElementById('ev-layout');
const evPrev   = document.getElementById('ev-prev');
const evNext   = document.getElementById('ev-next');

if (evLayout && evPrev && evNext) {
    evPrev.addEventListener('click', () => evLayout.scrollBy({ left: -580, behavior: 'smooth' }));
    evNext.addEventListener('click', () => evLayout.scrollBy({ left:  580, behavior: 'smooth' }));
}

// -- news section --
const nwSection = document.getElementById('news');
if (nwSection) sectionObserver.observe(nwSection);

ScrollTrigger.create({
    trigger: '#news', start: 'top 50%', end: 'bottom 50%',
    onEnter: () => applyFlAccent('#7fc12b'),
    onEnterBack: () => applyFlAccent('#7fc12b'),
});

gsap.from('.nw-heading', {
    opacity: 0, y: 50, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: '.news-section', start: 'top 82%' }
});
gsap.from('.nw-card', {
    opacity: 0, y: 60, duration: 1, stagger: 0.15, ease: 'expo.out',
    scrollTrigger: { trigger: '.nw-layout', start: 'top 85%' }
});
gsap.from('.nw-more-btn', {
    opacity: 0, y: 30, duration: 1, delay: 0.5, ease: 'expo.out',
    scrollTrigger: { trigger: '.nw-layout', start: 'top 85%' }
});

// -- news modal refs --
const nwModalBackdrop = document.getElementById('nw-modal-backdrop');
const nwModalImg      = document.getElementById('nw-modal-img');
const nwModalGlow     = document.getElementById('nw-modal-img-glow');
const nwModalTag      = document.getElementById('nw-modal-tag');
const nwModalTitle    = document.getElementById('nw-modal-title');
const nwModalDate     = document.getElementById('nw-modal-date');
const nwModalDesc     = document.getElementById('nw-modal-desc');
const nwModalClose    = document.getElementById('nw-modal-close');

const newsGlowMap = {
    'FORMULA 1': 'rgba(220,30,30,0.25)',
    'RALLY':     'rgba(255,160,0,0.2)',
    'GAMING':    'rgba(0,200,255,0.2)',
    'FIGHT':     'rgba(255,80,0,0.22)',
};

function openNewsModal(card) {
    const tag    = card.dataset.tag   || card.querySelector('.nw-card-tag').textContent;
    const title  = card.dataset.title || card.querySelector('.nw-card-title').textContent;
    const date   = card.dataset.date  || card.querySelector('.nw-card-date').textContent;
    const desc   = card.dataset.desc  || '';
    const imgSrc = card.querySelector('.nw-card-img').src;

    nwModalImg.src             = imgSrc;
    nwModalImg.alt             = title;
    nwModalTag.textContent     = tag;
    nwModalTitle.textContent   = title;
    nwModalDate.textContent    = date;
    nwModalDesc.textContent    = desc;
    nwModalGlow.style.background = `linear-gradient(135deg, ${newsGlowMap[tag] || 'rgba(127,193,43,0.2)'} 0%, transparent 60%)`;

    nwModalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    gsap.fromTo('#nw-modal',
        { y: 40, scale: 0.95, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'expo.out' }
    );
    bindCursorHovers();
}

function closeNewsModal() {
    gsap.to('#nw-modal', {
        y: 30, scale: 0.97, opacity: 0, duration: 0.35, ease: 'expo.in',
        onComplete: () => { nwModalBackdrop.classList.remove('open'); document.body.style.overflow = ''; }
    });
}

document.querySelectorAll('.nw-card').forEach(card => {
    card.addEventListener('click', () => openNewsModal(card));
});
nwModalClose.addEventListener('click', closeNewsModal);
nwModalBackdrop.addEventListener('click', (e) => { if (e.target === nwModalBackdrop) closeNewsModal(); });

// -- more news panel --
const nwPanelBackdrop = document.getElementById('nw-panel-backdrop');
const nwPanelClose    = document.getElementById('nw-panel-close');
const nwMoreBtn       = document.querySelector('.nw-more-btn');

function openNewsPanel()  { nwPanelBackdrop.classList.add('open'); document.body.style.overflow = 'hidden'; bindCursorHovers(); }
function closeNewsPanel() { nwPanelBackdrop.classList.remove('open'); document.body.style.overflow = ''; }

if (nwMoreBtn)       nwMoreBtn.addEventListener('click', openNewsPanel);
if (nwPanelClose)    nwPanelClose.addEventListener('click', closeNewsPanel);
if (nwPanelBackdrop) {
    nwPanelBackdrop.addEventListener('click', (e) => {
        // close only if clicking the dark backdrop, not the panel itself
        if (!document.getElementById('nw-panel').contains(e.target)) closeNewsPanel();
    });
}

// -- shared escape key handler (covers all modals + panel + cart) --
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (nwModalBackdrop.classList.contains('open'))   closeNewsModal();
        if (nwPanelBackdrop.classList.contains('open'))   closeNewsPanel();
        if (cartDrawerBackdrop && cartDrawerBackdrop.classList.contains('open')) closeCart();
        if (confirmBackdrop    && confirmBackdrop.classList.contains('open'))    closeConfirm();
        // flKmBackdrop / closeFlavourModal are exposed from flavours-modal.js via window
        if (window.flKmBackdrop && window.flKmBackdrop.classList.contains('open')) {
            if (typeof window.closeFlavourModal === 'function') window.closeFlavourModal();
        }
        // leaderboard & quiz
        const lbBack = document.getElementById('lb-backdrop');
        if (lbBack && lbBack.classList.contains('open')) lbBack.classList.remove('open'), (document.body.style.overflow = '');
        if (window.quizBackdrop && window.quizBackdrop.classList.contains('open')) window.quizBackdrop.classList.remove('open'), (document.body.style.overflow = '');
    }
});

// -- toast --
const toastEl = document.getElementById('toast');
let toastTimer;

function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

// -- confirm modal --
const confirmBackdrop  = document.getElementById('confirm-modal-backdrop');
const confirmIcon      = document.getElementById('confirm-icon');
const confirmTitle     = document.getElementById('confirm-title');
const confirmSub       = document.getElementById('confirm-sub');
const confirmCloseBtn  = document.getElementById('confirm-close-btn');

function showConfirm(icon, title, sub) {
    confirmIcon.textContent  = icon;
    confirmTitle.textContent = title;
    confirmSub.textContent   = sub;
    confirmBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeConfirm() {
    confirmBackdrop.classList.remove('open');
    document.body.style.overflow = '';
}

if (confirmCloseBtn) confirmCloseBtn.addEventListener('click', closeConfirm);
if (confirmBackdrop) confirmBackdrop.addEventListener('click', (e) => { if (e.target === confirmBackdrop) closeConfirm(); });

// -- hamburger / mobile nav --
const hamburger       = document.getElementById('hamburger');
const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
const mobileNavLinks  = mobileNavOverlay ? mobileNavOverlay.querySelectorAll('a') : [];

function openMobileNav()  { document.body.classList.add('nav-open'); document.body.style.overflow = 'hidden'; hamburger && hamburger.setAttribute('aria-expanded', 'true'); }
function closeMobileNav() { document.body.classList.remove('nav-open'); document.body.style.overflow = ''; hamburger && hamburger.setAttribute('aria-expanded', 'false'); }

if (hamburger) {
    hamburger.addEventListener('click', () => {
        document.body.classList.contains('nav-open') ? closeMobileNav() : openMobileNav();
    });
}

// close overlay when any mobile link is tapped
mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileNav));

// tap the dark backdrop area (outside the links) to close
if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', (e) => {
        // only close if click is directly on the overlay, not on a link
        if (e.target === mobileNavOverlay) closeMobileNav();
    });
}

// -- sync mobile nav active highlight with desktop scroll-spy via MutationObserver --
const mobileNavMap = {
    home:     document.getElementById('mnav-home'),
    flavours: document.getElementById('mnav-flavours'),
    events:   document.getElementById('mnav-events'),
    news:     document.getElementById('mnav-news'),
    game:     document.getElementById('mnav-game'),
};

const navObserver = new MutationObserver(() => {
    Object.keys(navLinks).forEach(id => {
        const isActive = navLinks[id] && navLinks[id].classList.contains('nav-active');
        if (mobileNavMap[id]) mobileNavMap[id].classList.toggle('nav-active', isActive);
    });
});

Object.values(navLinks).forEach(link => {
    if (link) navObserver.observe(link, { attributes: true, attributeFilter: ['class'] });
});

// close mobile nav on Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) closeMobileNav();
});

// -- newsletter form feedback --
const newsletterForm = document.querySelector('.footer-newsletter-form');
const newsletterInput = document.querySelector('.footer-newsletter-input');
if (newsletterForm && newsletterInput) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterInput.value.trim();
        if (!email || !email.includes('@')) {
            showToast('⚠️ Enter a valid email address.');
            newsletterInput.focus();
            return;
        }
        showToast('🔥 You\'re in the Beast Zone! Check your inbox.');
        newsletterInput.value = '';
    });
}
