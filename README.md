# Monster Energy Experience

**Live Demo: [monster.dinomae.in](https://monster.dinomae.in/)**

A passion project built to experiment with immersive web experiences. It's a high-energy, single-page site for Monster Energy that leans heavily into glassmorphism, GSAP animations, a full 3-game arcade hub, and a fake multi-step e-commerce checkout. The goal was to create a site that feels as "monstrous" as the brand itself — fast, dark, and visually intense.

---

## The Vibe

The site is designed to feel "alive" using GSAP ScrollTrigger to handle the scroll flow. As you scroll, the product stays central, morphing and reacting to your position. Everything — from the custom cursor tracking to glowing liquid-crystal buttons — is built to keep the user engaged.

---

## Features

- **Dynamic Flavour Swapping:** Switch between Original, Blue, Purple, and Red. The whole site's theme (glows, accents, text shadows) shifts instantly to match the can.
- **3-Game Arcade Hub:** A 3D coverflow carousel housing three fully playable HTML5 Canvas games. Click or swipe to switch between them.
- **🏆 Leaderboard:** Persistent localStorage-backed leaderboard tracking top 5 scores across all 3 games, with gold/silver/bronze rank badges.
- **⚡ Flavour Quiz:** "Find Your Beast" — 5 personality questions that tally votes and reveal your Monster flavour match, with a direct Add to Cart button.
- **🌍 Currency Selector:** Switch prices between ₹ INR, $ USD, € EUR, and £ GBP — persisted across sessions.
- **📱 PWA Support:** `manifest.json` + service worker for offline caching and Add to Home Screen on iOS & Android.
- **Fake Payment Gateway:** Full multi-step checkout — Order Review → Shipping → Card Details → Processing → Success, with live card preview and network detection (Visa/MC/Amex/Discover).
- **News & Events:** Glassmorphic modals with smooth transitions and a "More News" side panel.
- **Magnetic Navigation:** Sticky navbar with scroll-spy, smooth anchor scrolling, and a mobile hamburger overlay.
- **Responsive Design:** Fully responsive — 1440px down to 360px. Covers tiny Androids, iPhone SE, notched iPhones (safe area insets), and everything in between.
- **Custom Cursor:** Mouse-following dot + ring with hover morphing effects (hidden on touch devices).

---

## Arcade Hub — Games

The arcade section features a **3D coverflow carousel**. The active game sits front and center; the other two are visible as scaled, rotated previews behind it. Switch by clicking a preview card, swiping left/right on mobile, or using ← → arrow keys.

### 🟢 Monster Catch
Catch every falling Monster logo. Miss 3 and it's over.
- **Controls:** Move your mouse / drag your finger — the paddle follows.
- Difficulty ramps up as your score increases (faster drops, tighter spawning).
- Lives displayed as glowing HUD dots.
- Score auto-submits to the leaderboard on game over.

### 🐍 Snake Frenzy
Classic snake, Monster-branded. Eat logos to grow. Don't bite yourself or the walls.
- **Controls:** Arrow keys / WASD, touch-swipe, or just move your mouse — the snake steers toward the cursor automatically.
- Grid-based game loop with increasing speed.
- Score auto-submits to the leaderboard on game over.

### ⚡ Reflex Rush
Monster cans appear on a grid. Tap or click them before they vanish.
- **Controls:** Click or tap directly on the cans.
- 5 consecutive hits triggers **BEAST MODE** — faster spawns, shorter lifetimes.
- Touch events correctly map tap coordinates to the canvas grid.
- Score auto-submits to the leaderboard on game over.

---

## Screenshots

![Home](screenshorts/1.png)
![Flavours](screenshorts/2.png)
![Events](screenshorts/3.png)
![News](screenshorts/4.png)
![Game](screenshorts/5.png)

---

## Design Philosophy

Fundamentals kept deliberately simple: HTML, CSS, and Vanilla JavaScript — no heavy frameworks, no build steps. 3D renders were produced in Blender for the product imagery.

### Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic) |
| Styling | Vanilla CSS (modular) |
| Logic | Vanilla JS (ES modules) |
| Animation | GSAP + ScrollTrigger |
| Games | HTML5 Canvas API |
| 3D Assets | Blender renders |
| Offline | Service Worker (Cache API) |
| Storage | localStorage (cart, scores, currency) |

---

## Project Structure

```
Monster/
├── index.html                      # Single-page entry point
├── manifest.json                   # PWA manifest (Add to Home Screen)
├── sw.js                           # Service worker (offline cache)
├── README.md
│
├── assets/
│   └── images/                     # Cans, logo, backgrounds, news photos
│
├── css/
│   ├── main.css                    # Imports all modules (in order)
│   ├── base.css                    # Reset, tokens, scroll-padding, cursor, toast
│   ├── variables.css               # CSS custom properties
│   ├── components.css              # Modals, cart drawer, overlays
│   ├── sections.css                # Game hub, events, news, hero rules
│   ├── features.css                # Currency selector, quiz modal, leaderboard panel
│   ├── payment.css                 # Fake checkout — all 4 steps
│   ├── responsive.css              # Breakpoints: 1024 / 768 / 480 / 360px
│   │
│   └── sections/
│       ├── flavours.css            # Flavour rows, know-more modal, stats
│       └── footer.css              # Footer grid, newsletter form
│
└── js/
    └── modules/
        ├── core.js                 # Scroll-spy, cursor, GSAP init, loader, escape handler
        ├── game-hub.js             # 3D coverflow carousel controller
        ├── game.js                 # Monster Catch — canvas game
        ├── snake.js                # Snake Frenzy — canvas game
        ├── reflex.js               # Reflex Rush — canvas game
        ├── leaderboard.js          # Leaderboard panel + localStorage score persistence
        ├── quiz.js                 # Flavour Quiz — 5 questions, can reveal, cart hook
        ├── currency.js             # Currency selector (₹/$/€/£) + formatPrice()
        ├── cart.js                 # Shopping cart drawer + currency-aware pricing
        ├── payment.js              # Fake multi-step checkout gateway
        ├── flavours-modal.js       # Flavour know-more modal + global theme switching
        └── news-events.js          # News feed modals & events panel
```

---

## Key Implementation Details

### Arcade Carousel (`game-hub.js`)

All three game cards share the same center position in the DOM. GSAP drives `xPercent`, `rotateY`, `scale`, `z`, and `opacity` to create the 3D coverflow effect.

Switching is handled by a **capturing click listener** on the hub that compares the click coordinates against each preview card's `getBoundingClientRect()`. This bypasses CSS `pointer-events` entirely — necessary because the 3D-transformed bounding boxes physically overlap on screen.

A guard checks whether the click landed inside the **active card's game-container** first; if so, the event is passed through to the game (preventing accidental switches when playing Reflex Rush near the edges).

Mobile switching uses `touchstart`/`touchend` on the hub: a horizontal swipe with `|dx| > 50px` and `|dx| > |dy|` triggers `switchNext()` or `switchPrev()`.

### Snake Mouse Steering

Each game tick calls `steerByMouse()` before committing the direction. It computes the vector from the snake's head centre to the mouse position in canvas-space and selects the dominant axis (horizontal vs vertical) to set `nextDir`. A dead-zone of `0.6 × CELL_W` prevents jitter when the cursor is directly over the head. Keyboard and swipe inputs override mouse by writing to `nextDir` directly — last input before the tick wins.

### Leaderboard (`leaderboard.js`)

Scores are persisted in `localStorage` under the key `monster-leaderboard` as a map of `gameId → [{score, date}]`. On every `endGame()` call, each game module checks for `window.submitLeaderboardScore(gameId, score)` and calls it if present — safe-guarded with `typeof` so the leaderboard module is optional with no side effects if missing.

### Flavour Quiz (`quiz.js`)

Five questions, each option tagged with a `data-val` mapped to one of the four flavours (`green`, `cyan`, `purple`, `red`). Answers are tallied into a vote object; the flavour with the most votes wins. Tie-breaking is handled by natural object key order. The result screen dynamically sets the can image, glow color, name, and description. The ADD TO CART button calls `addToCart()` directly, bridging the quiz to the cart module.

### Currency System (`currency.js`)

Exposes `window.formatPrice(inrAmount)` and `window.currentCurrency()` globally. `cart.js` and `payment.js` use `window.formatPrice || (v => '₹' + v.toFixed(2))` as a fallback so the feature degrades gracefully if `currency.js` is removed. Currency preference is stored in `localStorage` under `monster-currency`.

### CSS Architecture

- `sections.css` contains 3D hub layout, pointer-event rules, HUD, overlay, and game card styles.
- `features.css` handles all three new feature UIs (currency dropdown, quiz modal, leaderboard panel) in a single file, imported before responsive overrides.
- `responsive.css` handles all breakpoints down to `360px`. Hub height, card width, and button tap targets all scale progressively.
- `pointer: coarse` media query hides the custom cursor and mouse-specific instructions on touch devices.

### Mobile & PWA

- `viewport-fit=cover` + safe area insets (`env(safe-area-inset-*)`) on body and toast for notch/punch-hole phones.
- `scroll-padding-top: calc(var(--nav-h) + 2rem)` on `html` prevents section headings from hiding under the sticky navbar on anchor navigation.
- `manifest.json` declares a standalone display, Monster green theme color, and the logo as the app icon.
- The service worker caches all core assets on install and uses network-first for HTML, cache-first for all other assets — enabling offline arcade play after the first visit.
- Overlay buttons are `min-height: 48px` (WCAG 2.5.5 touch target size).

---

## How to Run

```bash
# Any static server works — e.g.:
npx serve . -l 3456
# then open http://localhost:3456
```

Or just open `index.html` directly in a modern browser (Chrome, Firefox, Safari, Edge).

---

Unleash the Beast.
