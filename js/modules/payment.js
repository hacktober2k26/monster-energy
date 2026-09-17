// ── Payment Gateway — Fake multi-step checkout ─────────────────────
// Steps: 1 Order Summary → 2 Shipping → 3 Card Details → 4 Processing/Success

(() => {
    // ── DOM refs ──
    const backdrop   = document.getElementById('pg-backdrop');
    const modal      = document.getElementById('pg-modal');
    const closeBtn   = document.getElementById('pg-close');

    const panels     = [1,2,3,4].map(n => document.getElementById(`pg-panel-${n}`));
    const stepDots   = [1,2,3].map(n => document.getElementById(`pgstep-${n}`));

    // Step 1
    const orderListEl  = document.getElementById('pg-order-list');
    const pgSubEl      = document.getElementById('pg-sub');
    const pgTotalEl    = document.getElementById('pg-total');
    const pgPayAmount  = document.getElementById('pg-pay-amount');
    const next1Btn     = document.getElementById('pg-next-1');

    // Step 2
    const next2Btn  = document.getElementById('pg-next-2');
    const back2Btn  = document.getElementById('pg-back-2');

    // Step 3
    const back3Btn      = document.getElementById('pg-back-3');
    const payBtn        = document.getElementById('pg-pay');
    const cardNumIn     = document.getElementById('pg-cardnum');
    const cardNameIn    = document.getElementById('pg-cardname');
    const expiryIn      = document.getElementById('pg-expiry');

    // Card preview display
    const cardDispEl    = document.getElementById('pg-card-disp');
    const cardHolderEl  = document.getElementById('pg-card-holder-disp');
    const cardExpiryEl  = document.getElementById('pg-card-expiry-disp');
    const cardNetworkEl = document.getElementById('pg-card-network');

    // Step 4
    const processingEl = document.getElementById('pg-processing');
    const successEl    = document.getElementById('pg-success');
    const orderIdEl    = document.getElementById('pg-order-id');
    const doneBtn      = document.getElementById('pg-done');

    let cartSnapshot = [];
    let currentStep  = 1;
    let orderTotal   = 0;

    // ── Open / Close ──
    function openPG(cartItems) {
        cartSnapshot = [...cartItems];
        orderTotal   = cartSnapshot.reduce((s, i) => s + i.price, 0);

        // Populate step 1
        populateOrderSummary();

        // Reset to step 1
        goToStep(1);

        // Reset step 4
        processingEl.style.display = 'flex';
        successEl.style.display    = 'none';

        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closePG() {
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    window.openPaymentGateway = openPG;

    // ── Order Summary ──
    function populateOrderSummary() {
        orderListEl.innerHTML = '';
        cartSnapshot.forEach(item => {
            const imgBase = item.name.toLowerCase().includes('green')  ? 'green'  :
                            item.name.toLowerCase().includes('blue')   ? 'cyan'   :
                            item.name.toLowerCase().includes('violet') ? 'purple' : 'red';
            const row = document.createElement('div');
            row.className = 'pg-order-item';
            row.innerHTML = `
                <img src="assets/images/${imgBase}.png" alt="${item.name}" class="pg-order-img">
                <span class="pg-order-name">${item.name}</span>
                <span class="pg-order-price">₹${item.price.toFixed(2)}</span>
            `;
            orderListEl.appendChild(row);
        });

        pgSubEl.textContent   = `₹${orderTotal.toFixed(2)}`;
        pgTotalEl.textContent = `₹${orderTotal.toFixed(2)}`;
        pgPayAmount.textContent = `₹${orderTotal.toFixed(2)}`;
    }

    // ── Step navigation ──
    function goToStep(n) {
        panels.forEach((p, i) => p.classList.toggle('pg-panel--hidden', i + 1 !== n));
        stepDots.forEach((d, i) => {
            d.classList.toggle('active', i + 1 <= n && n < 4);
            d.classList.toggle('done',   i + 1 < n && n < 4);
        });
        currentStep = n;
        modal.scrollTop = 0;
    }

    // ── Validation helpers ──
    function shake(el) {
        el.classList.remove('pg-shake');
        void el.offsetWidth; // reflow
        el.classList.add('pg-shake');
    }

    function validateStep2() {
        const req = ['pg-fname','pg-lname','pg-email','pg-phone','pg-address','pg-city','pg-pin'];
        for (const id of req) {
            const el = document.getElementById(id);
            if (!el.value.trim()) { shake(el); el.focus(); return false; }
        }
        const email = document.getElementById('pg-email').value;
        if (!/\S+@\S+\.\S+/.test(email)) { shake(document.getElementById('pg-email')); return false; }
        return true;
    }

    function validateStep3() {
        const num = cardNumIn.value.replace(/\s/g,'');
        if (num.length < 12) { shake(cardNumIn); cardNumIn.focus(); return false; }
        if (!cardNameIn.value.trim()) { shake(cardNameIn); cardNameIn.focus(); return false; }
        if (expiryIn.value.length < 5) { shake(expiryIn); expiryIn.focus(); return false; }
        const cvv = document.getElementById('pg-cvv').value;
        if (cvv.length < 3) { shake(document.getElementById('pg-cvv')); return false; }
        return true;
    }

    // ── Card number formatting + network detection ──
    cardNumIn.addEventListener('input', () => {
        // Keep only digits, group in 4s
        let v = cardNumIn.value.replace(/\D/g,'').slice(0,16);
        cardNumIn.value = v.replace(/(.{4})/g,'$1 ').trim();

        // Update live card preview
        const groups = v.padEnd(16,'•').match(/.{1,4}/g);
        cardDispEl.textContent = groups ? groups.join(' ') : '•••• •••• •••• ••••';

        // Network detection
        const net = v[0] === '4' ? 'VISA' :
                    (v[0] === '5' && ['1','2','3','4','5'].includes(v[1])) ? 'MC' :
                    v.startsWith('34') || v.startsWith('37') ? 'AMEX' :
                    v.startsWith('6011') || v.startsWith('65') ? 'DISC' : '';
        cardNetworkEl.textContent = net;
        cardNetworkEl.dataset.net = net;
    });

    cardNameIn.addEventListener('input', () => {
        cardHolderEl.textContent = cardNameIn.value.toUpperCase() || 'YOUR NAME';
    });

    expiryIn.addEventListener('input', () => {
        let v = expiryIn.value.replace(/\D/g,'').slice(0,4);
        if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
        expiryIn.value = v;
        cardExpiryEl.textContent = v || 'MM/YY';
    });

    // ── Navigation bindings ──
    next1Btn.addEventListener('click', () => goToStep(2));

    next2Btn.addEventListener('click', () => {
        if (validateStep2()) goToStep(3);
    });

    back2Btn.addEventListener('click', () => goToStep(1));
    back3Btn.addEventListener('click', () => goToStep(2));

    payBtn.addEventListener('click', () => {
        if (!validateStep3()) return;

        goToStep(4);
        processingEl.style.display = 'flex';
        successEl.style.display    = 'none';

        // Simulate 2.4s processing delay
        setTimeout(() => {
            processingEl.style.display = 'none';
            successEl.style.display    = 'flex';

            // Generate fake order ID
            const oid = 'ME-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random()*900+100);
            orderIdEl.textContent = oid;

            // Tick animation
            const icon = document.querySelector('.pg-success-icon');
            if (icon) {
                icon.style.transform = 'scale(0)';
                setTimeout(() => { icon.style.transform = 'scale(1)'; }, 50);
            }

            // Clear the real cart
            if (typeof cart !== 'undefined') {
                cart.length = 0;
                if (typeof updateCartUI === 'function') updateCartUI();
            }
        }, 2400);
    });

    doneBtn.addEventListener('click', closePG);

    // Backdrop click to close (but not on steps 3/4 to avoid accidental close)
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop && currentStep < 3) closePG();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.classList.contains('open') && currentStep < 4) closePG();
    });

    closeBtn.addEventListener('click', closePG);

})();
