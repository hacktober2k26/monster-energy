// -- cart system --
let cart = [];
const cartDrawerBackdrop = document.getElementById('cart-drawer-backdrop');
const cartCloseBtn = document.getElementById('cart-close');
const cartNavBtn = document.getElementById('nav-cta-cart');
const cartBadge = document.getElementById('cart-badge');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartEmptyMsg = document.getElementById('cart-empty-msg');
const checkoutBtn = document.querySelector('.checkout-btn');

function openCart() { cartDrawerBackdrop.classList.add('open'); document.body.style.overflow = 'hidden'; bindCursorHovers(); }
function closeCart() { cartDrawerBackdrop.classList.remove('open'); document.body.style.overflow = ''; }

function updateCartBadge() {
    if (cart.length === 0) {
        cartBadge.style.display = 'none';
    } else {
        cartBadge.style.display = 'inline-flex';
        cartBadge.textContent = cart.length;
    }
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    const fmt = window.formatPrice || (v => '₹' + v.toFixed(2));

    if (cart.length === 0) {
        cartItemsContainer.appendChild(cartEmptyMsg);
        cartSubtotalEl.textContent = fmt(0);
        updateCartBadge();
        return;
    }

    let subtotal = 0;
    cart.forEach((item, index) => {
        subtotal += item.price;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        // map flavour name → image file
        const imgBase = item.name.toLowerCase().includes('green') ? 'green' :
            item.name.toLowerCase().includes('blue') ? 'cyan' :
                item.name.toLowerCase().includes('violet') ? 'purple' : 'red';
        itemEl.innerHTML = `
            <img src="assets/images/${imgBase}.png" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">${fmt(item.price)}</span>
                <span class="cart-item-remove" data-index="${index}">Remove</span>
            </div>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    cartSubtotalEl.textContent = fmt(subtotal);
    updateCartBadge();

    // rebind remove buttons after re-render
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            const removed = cart.splice(idx, 1)[0];
            updateCartUI();
            showToast(`Removed "${removed.name}" from cart`);
        });
    });
}

function addToCart(name, price) {
    cart.push({ name, price: parseFloat(price) });
    updateCartUI();
    showToast(`✔ ${name} added to cart!`);
    // pulse the badge
    if (cartBadge) {
        cartBadge.style.transform = 'scale(1.5)';
        setTimeout(() => cartBadge.style.transform = 'scale(1)', 300);
    }
}

// open/close listeners
if (cartNavBtn) cartNavBtn.addEventListener('click', openCart);
if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
if (cartDrawerBackdrop) {
    cartDrawerBackdrop.addEventListener('click', (e) => { if (e.target === cartDrawerBackdrop) closeCart(); });
}

// -- checkout → open payment gateway --
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) { showToast('Your cart is empty! Add some Monster first. 🥤'); return; }
        closeCart();
        setTimeout(() => {
            if (typeof openPaymentGateway === 'function') openPaymentGateway(cart);
        }, 350);
    });
}

// -- add to cart buttons in flavours section --
document.querySelectorAll('.fl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const price = btn.dataset.price;
        if (name && price) {
            addToCart(name, price);
            // quick visual feedback on the button
            const orig = btn.textContent;
            btn.textContent = '✔ ADDED!';
            btn.style.background = 'var(--accent)';
            btn.style.color = '#000';
            btn.style.borderColor = 'var(--accent)';
            setTimeout(() => {
                btn.textContent = orig;
                btn.style.background = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }, 1500);
        }
    });
});

// init
updateCartUI();