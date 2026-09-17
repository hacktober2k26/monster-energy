// ── Currency Selector — converts and refreshes all price displays ──────
(() => {
    const btn      = document.getElementById('currency-btn');
    const symbol   = document.getElementById('currency-symbol');
    const dropdown = document.getElementById('currency-dropdown');
    const selector = document.getElementById('currency-selector');
    const options  = dropdown ? dropdown.querySelectorAll('.currency-option') : [];

    // Persist last choice
    let current = JSON.parse(localStorage.getItem('monster-currency') || 'null') || {
        code: 'INR', symbol: '₹', rate: 1
    };

    // All elements that show a price — marked with data-price-inr="<base INR amount>"
    // We tag them on first run, then update on currency switch
    function tagPrices() {
        // Cart and payment use dynamic JS — handled via formatPrice()
        // Flavour "ADD TO CART" buttons keep data-price in INR base — that doesn't need change
    }

    function formatPrice(inrAmount) {
        const converted = inrAmount * current.rate;
        return current.symbol + converted.toFixed(2);
    }

    // Expose globally so cart.js & payment.js can call it
    window.formatPrice   = formatPrice;
    window.currentCurrency = () => current;

    function applySymbol() {
        if (symbol) symbol.textContent = current.symbol;
        // Update any static price spans that carry data-base-inr
        document.querySelectorAll('[data-base-inr]').forEach(el => {
            el.textContent = formatPrice(parseFloat(el.dataset.baseInr));
        });
        // Refresh cart UI & payment if open
        if (typeof updateCartUI === 'function') updateCartUI();
    }

    function setActive(code) {
        options.forEach(o => o.classList.toggle('active', o.dataset.code === code));
    }

    function selectCurrency(opt) {
        current = {
            code:   opt.dataset.code,
            symbol: opt.dataset.symbol,
            rate:   parseFloat(opt.dataset.rate)
        };
        localStorage.setItem('monster-currency', JSON.stringify(current));
        applySymbol();
        setActive(current.code);
        closeDropdown();
    }

    function openDropdown()  {
        selector && selector.classList.add('open');
        btn  && btn.setAttribute('aria-expanded', 'true');
    }
    function closeDropdown() {
        selector && selector.classList.remove('open');
        btn  && btn.setAttribute('aria-expanded', 'false');
    }

    if (btn) btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selector.classList.contains('open') ? closeDropdown() : openDropdown();
    });

    options.forEach(opt => opt.addEventListener('click', () => selectCurrency(opt)));

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (selector && !selector.contains(e.target)) closeDropdown();
    });

    // Init
    setActive(current.code);
    applySymbol();
})();
