// -- flavour "know more" modal --
// expose to window so core.js escape handler can reach them
window.flKmBackdrop    = document.getElementById('fl-km-backdrop');
const flKmClose        = document.getElementById('fl-km-close');
const flKmBackdrop     = window.flKmBackdrop;

// elements to populate
const flKmglow        = document.getElementById('fl-km-glow');
const flKmCan         = document.getElementById('fl-km-can');
const flKmTag         = document.getElementById('fl-km-tag');
const flKmTitle       = document.getElementById('fl-km-title');
const flKmDesc        = document.getElementById('fl-km-desc');
const flKmTaste       = document.getElementById('fl-km-taste');
const flKmSugar       = document.getElementById('fl-km-sugar');
const flKmIngredients = document.getElementById('fl-km-ingredients');
const flKmModal       = document.getElementById('fl-km-modal');

function openFlavourModal(card) {
    const name   = card.dataset.kmName;
    const tag    = card.dataset.kmTag;
    const accent = card.dataset.kmAccent;
    const img    = card.dataset.kmImg;
    const desc   = card.dataset.kmDesc;
    const taste  = card.dataset.kmTaste;
    const sugar  = card.dataset.kmSugar;
    const ing    = card.dataset.kmIngredients;

    flKmModal.style.setProperty('--fl-km-accent', accent);
    flKmglow.style.background = `radial-gradient(circle, color-mix(in srgb, ${accent} 40%, transparent) 0%, transparent 70%)`;

    flKmCan.src                 = img;
    flKmCan.alt                 = name;
    flKmTag.textContent         = tag;
    flKmTitle.textContent       = name;
    flKmDesc.textContent        = desc;
    flKmTaste.textContent       = taste;
    flKmSugar.textContent       = sugar;
    flKmIngredients.textContent = ing;

    flKmBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    bindCursorHovers();
}

function closeFlavourModal() {
    if (flKmBackdrop) flKmBackdrop.classList.remove('open');
    document.body.style.overflow = '';
}
// expose to window for cross-module escape key handler
window.closeFlavourModal = closeFlavourModal;

// bind "know more ↗" buttons
document.querySelectorAll('.fl-know-more-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.fl-detail-card');
        if (card) openFlavourModal(card);
    });
});

// close handlers
if (flKmClose)    flKmClose.addEventListener('click', closeFlavourModal);
if (flKmBackdrop) {
    flKmBackdrop.addEventListener('click', (e) => {
        if (e.target === flKmBackdrop) closeFlavourModal();
    });
}