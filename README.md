# Monster Energy Experience

Monster Energy Experience is a high-energy, single-page web application featuring dynamic energy drink flavour switching, GSAP animations, glassmorphic UI modals, and an interactive HTML5 canvas mini-game.

The project is built using **HTML, CSS, and JavaScript**, so you do not need to know a framework or use any complicated setup to contribute.

This repository is especially suitable for **first-time open-source contributors**.

---

## About the Project

The Monster Energy Experience brings an immersive brand experience and interactive mini-game into one single-page application.

### Current Features

* **Dynamic Flavour Switcher** — Switch between Original Green, Ultra Blue, Ultra Violet, and Mango Loco with animated 3D can morphing and site-wide theme glowing.
* **Shopping Cart Drawer** — Interactive cart drawer with item additions, subtotal calculations, badges, and checkout modal feedback.
* **Monster Catch Mini-Game** — HTML5 canvas arcade game to catch falling Monster logos with score tracking, lives, and high score display.
* **News & Events Modals** — Glassmorphic popups with event registration and category-themed gradient lighting.
* **More News Side Panel** — Full-height sliding panel to browse all Monster news articles and stories.
* **Custom Glowing Cursor** — Dynamic dual-layer mouse tracking cursor with hover scaling over interactive elements.
* **Mobile Responsive Navigation** — Sticky navigation bar with animated mobile hamburger menu overlay and scroll-spy active indicators.

---

## Tech Stack

This project uses basic web technologies:

* HTML5
* CSS3 (Vanilla CSS with modular structure)
* JavaScript (ES6+ Vanilla JS)
* GSAP 3 (GreenSock Animation Platform with ScrollTrigger)

No framework or build tool is required.

---

## Project Structure

```text
Monster/
│
├── index.html              # The main single-page stage
├── README.md               # Original project README
├── README_AUDIT.md         # Open-source contributor & audit guide
│
├── assets/images/          # High-resolution cans, backgrounds, and event graphics
│
├── css/                    # Modular stylesheets
│   ├── main.css            # Master stylesheet importing module styles
│   ├── base.css            # Base styles, tokens, custom cursor & loader
│   ├── sections.css        # Layout for Mini-game, Events & News sections
│   ├── components.css      # Cart drawer, News panel & Modal styles
│   ├── responsive.css      # Responsive breakpoints (1024px, 768px, 480px)
│   └── sections/           # Section-specific styles
│       ├── flavours.css    # Flavour card grid & know-more modals
│       └── footer.css      # Marquee rail & footer layout
│
└── js/modules/             # Vanilla JavaScript modules
    ├── core.js             # GSAP timelines, theme switching, cursor & scroll-spy
    ├── cart.js             # Cart state, item removal & drawer toggles
    ├── flavours-modal.js   # "Know More" popup data binding
    ├── game.js             # Canvas game loop, drop spawning & collision detection
    └── news-events.js     # Event interest registration & news panel handlers
```

You can start by opening `index.html` in your browser and exploring the application.

---

# Open Bugs

These are existing problems in the project that contributors can help fix.

| ID   | Issue                                                    | Difficulty   | Area             |
| ---- | -------------------------------------------------------- | ------------ | ---------------- |
| B-01 | Broken image link in Pitbull UFC News modal (quote mismatch) | Beginner     | JavaScript / Data |
| B-02 | Unsaved cart items and high score reset on page refresh | Intermediate | JavaScript / LocalStorage |
| B-03 | Flavour can switch animation suffers lag and jitter      | Intermediate | GSAP / CSS / Media |
| B-04 | Game canvas steals touch scrolling on mobile devices     | Intermediate | JavaScript / Touch |
| B-05 | Pressing Escape key before script load causes ReferenceError | Beginner     | JavaScript |
| B-06 | Footer newsletter subscribe button does nothing          | Beginner     | HTML / JavaScript |
| B-07 | Footer social media and sports category links point to `#` | Beginner    | HTML / CSS |
| B-08 | Duplicate CSS definitions in base.css and typography-nav.css | Beginner   | CSS |

> Each bug has detailed information in the audit documentation to help you locate and solve the issue.

---

# Feature Ideas

These features can be added to improve the application.

| ID   | Feature                        | Difficulty   | Area                    |
| ---- | ------------------------------ | ------------ | ----------------------- |
| F-01 | Cart item quantity controls (`+` / `-`) | Beginner     | JavaScript / UI |
| F-02 | Web Audio API sound effects for mini-game | Intermediate | JavaScript / Audio |
| F-03 | LocalStorage persistence for user selected flavour theme | Beginner | JavaScript |
| F-04 | Special drop items in mini-game (bonus points / slow motion) | Intermediate | JavaScript / Canvas |
| F-05 | WebP image conversion for fast load times | Beginner | Assets / Media |
| F-06 | Full keyboard accessibility & modal focus traps | Intermediate | HTML / Accessibility |
| F-07 | Open Graph meta tags and product schema markup | Beginner | HTML / SEO |
| F-08 | Smooth page transition loader enhancements | Intermediate | GSAP / CSS |

> Feature ideas are suggestions. Contributors can choose an idea that matches their skill level.

---

## Difficulty Guide

Not sure which issue to choose?

### Beginner

Good starting point if this is your first contribution.

Usually involves:

* HTML changes
* CSS fixes & cleanups
* Small JavaScript changes
* Fixing broken asset paths or string mismatches
* Simple bug fixes

### Intermediate

Requires some familiarity with JavaScript, canvas, or animation libraries.

Usually involves:

* LocalStorage implementation
* Event handling and touch event logic
* GSAP timeline adjustments
* Canvas physics / game logic
* Multiple files or modules

### Advanced

Suitable for contributors who are comfortable working with larger parts of the application.

Usually involves:

* Complete ES module refactoring (`type="module"`)
* Complex Web Audio API audio synthesis
* Full accessibility (a11y) audit and keyboard traps across all modals
* Significant performance optimization across low-end mobile devices

---

## How to Contribute

If you find an issue you'd like to work on:

1. Open the **Issues** section of this repository.
2. Read the issue description carefully.
3. Check whether someone is already working on it.
4. Comment on the issue if you want to work on it.
5. Fork the repository and make your changes.
6. Test your changes locally.
7. Create a Pull Request explaining what you changed.

You don't need to be an experienced developer to contribute. Start with an issue that matches your current skill level and learn as you go.

---



Thank you for taking the time to contribute to Monster Energy Experience.

Every contribution counts — whether it is a small CSS fix, a JavaScript improvement, documentation update, or a completely new feature.
