// ── Game Hub Controller — 3D carousel switching ─────────────────────
(() => {
    const hub = document.getElementById('game-hub');
    const cards = [
        document.getElementById('gcard-catch'),
        document.getElementById('gcard-snake'),
        document.getElementById('gcard-reflex')
    ];

    const GAME_META = {
        catch:  { title: 'Monster Catch', sub: 'Catch every drop. Miss one and it\'s over.' },
        snake:  { title: 'Snake Frenzy',  sub: 'Grow your beast. Don\'t bite yourself.' },
        reflex: { title: 'Reflex Rush',   sub: 'Smash the cans. Prove your reflexes.' },
    };

    const sectionTitle = document.getElementById('game-section-title');
    const sectionSub   = document.getElementById('game-section-sub');

    const modules = {
        catch:  window.MonsterCatch,
        snake:  window.SnakeFrenzy,
        reflex: window.ReflexRush,
    };

    let activeIndex = 0;
    let animating   = false;

    // mobile nav dots
    const mobDots = document.querySelectorAll('.game-mob-dot');
    function updateDots() {
        mobDots.forEach((d, i) => d.classList.toggle('game-mob-dot--active', i === activeIndex));
    }
    function renderCarousel(animate) {
        const w = window.innerWidth;
        let xOff, scale, zOff;
        if (w <= 380) {
            xOff = 42; scale = 0.62; zOff = -120; // tiny phones — keep cards visible
        } else if (w <= 600) {
            xOff = 50; scale = 0.68; zOff = -140;
        } else {
            xOff = 70; scale = 0.75; zOff = -200;
        }

        cards.forEach((card, i) => {
            if (!card) return;

            let diff = i - activeIndex;
            if (diff > 1)  diff -= 3;
            if (diff < -1) diff += 3;

            let props;

            if (diff === 0) {
                props = { xPercent: 0, z: 0, rotateY: 0, scale: 1, opacity: 1, zIndex: 10 };
                card.classList.add('game-card--active');
                card.classList.remove('game-card--preview');
            } else if (diff === 1) {
                props = { xPercent: xOff, z: zOff, rotateY: -20, scale, opacity: 0.5, zIndex: 5 };
                card.classList.remove('game-card--active');
                card.classList.add('game-card--preview');
            } else {
                props = { xPercent: -xOff, z: zOff, rotateY: 20, scale, opacity: 0.5, zIndex: 5 };
                card.classList.remove('game-card--active');
                card.classList.add('game-card--preview');
            }

            if (animate) {
                gsap.to(card, { ...props, duration: 0.65, ease: 'expo.out' });
            } else {
                gsap.set(card, props);
            }
        });
    }

    renderCarousel(false);

    function switchTo(i) {
        if (animating || i === activeIndex) return;
        animating = true;

        const prevId = cards[activeIndex].dataset.game;
        if (modules[prevId] && modules[prevId].stop) modules[prevId].stop();

        activeIndex = i;
        renderCarousel(true);
        updateDots();

        const meta = GAME_META[cards[i].dataset.game];
        if (meta) {
            gsap.to([sectionTitle, sectionSub], {
                opacity: 0, y: -10, duration: 0.2, ease: 'power2.in',
                onComplete: () => {
                    sectionTitle.textContent = meta.title;
                    sectionSub.textContent   = meta.sub;
                    gsap.to([sectionTitle, sectionSub], { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
                }
            });
        }

        setTimeout(() => { animating = false; }, 550);
    }

    function switchNext() {
        switchTo((activeIndex + 1) % cards.length);
    }
    function switchPrev() {
        switchTo((activeIndex + cards.length - 1) % cards.length);
    }

    // ── Click detection (desktop): bounding rect hit testing ──
    // useCapture fires before children. Guard: if click is inside the
    // active card's game-container, don't switch.
    hub.addEventListener('click', (e) => {
        if (animating) return;

        const clickX = e.clientX;
        const clickY = e.clientY;

        // If click is inside active card's game-container, let it through
        const activeContainer = cards[activeIndex].querySelector('.game-container');
        if (activeContainer) {
            const ar = activeContainer.getBoundingClientRect();
            if (clickX >= ar.left && clickX <= ar.right &&
                clickY >= ar.top  && clickY <= ar.bottom) {
                return;
            }
        }

        // Check preview card rects
        for (let i = 0; i < cards.length; i++) {
            if (i === activeIndex) continue;
            const rect = cards[i].getBoundingClientRect();
            if (clickX >= rect.left && clickX <= rect.right &&
                clickY >= rect.top  && clickY <= rect.bottom) {
                switchTo(i);
                return;
            }
        }
    }, true);

    // ── Swipe gesture (mobile): horizontal swipe on hub switches games ──
    let touchStartX = null;
    let touchStartY = null;
    let touchStartedInGame = false; // track if touch started inside active game canvas

    hub.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        // Check if touch started inside the active game's container
        // If so, we must NOT switch games on this swipe
        touchStartedInGame = false;
        const activeContainer = cards[activeIndex] && cards[activeIndex].querySelector('.game-container');
        if (activeContainer) {
            const r = activeContainer.getBoundingClientRect();
            if (touchStartX >= r.left && touchStartX <= r.right &&
                touchStartY >= r.top  && touchStartY <= r.bottom) {
                touchStartedInGame = true;
            }
        }
    }, { passive: true });

    hub.addEventListener('touchend', (e) => {
        if (touchStartX === null) return;

        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const startedInGame = touchStartedInGame;
        touchStartX = null;
        touchStartY = null;
        touchStartedInGame = false;

        // Don't switch games if the swipe originated inside the active game
        if (startedInGame) return;

        // Only trigger if horizontal swipe dominates (not a scroll)
        const SWIPE_MIN = 50;
        if (Math.abs(dx) < SWIPE_MIN || Math.abs(dy) > Math.abs(dx)) return;

        if (dx < 0) {
            switchNext(); // swipe left → next game
        } else {
            switchPrev(); // swipe right → prev game
        }
    }, { passive: true });

    // Keyboard navigation (← →) — only when no game is running
    document.addEventListener('keydown', (e) => {
        if (animating) return;
        // Don't switch games if the active game is running (player is using arrow keys to play)
        const activeModuleId = cards[activeIndex] && cards[activeIndex].dataset.game;
        const activeMod = modules[activeModuleId];
        // Each game module exposes a `running` getter or we check via stop being available
        // Since we can't easily check if the game is running from outside,
        // only switch on Alt+Arrow or if the active card is NOT in-game-overlay mode
        const overlay = cards[activeIndex] && cards[activeIndex].querySelector('.game-overlay');
        const overlayVisible = overlay && overlay.style.display !== 'none';
        // If the overlay is hidden, a game is running — don't steal arrow keys
        if (!overlayVisible) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); switchNext(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); switchPrev(); }
    });

    // Mobile arrow buttons
    const mobPrev = document.getElementById('game-mob-prev');
    const mobNext = document.getElementById('game-mob-next');
    if (mobPrev) mobPrev.addEventListener('click', switchPrev);
    if (mobNext) mobNext.addEventListener('click', switchNext);

    // Entrance animation
    ScrollTrigger.create({
        trigger: hub,
        start: 'top 85%',
        once: true,
        onEnter: () => {
            gsap.from(cards, {
                opacity: 0, y: 60, duration: 0.9, stagger: 0.12, ease: 'expo.out',
                onComplete: () => renderCarousel(false)
            });
        }
    });

    window.addEventListener('resize', () => renderCarousel(false));
})();
