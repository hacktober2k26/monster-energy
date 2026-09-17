// ── Snake Frenzy — Monster-themed snake game ─────────────────────────
window.SnakeFrenzy = (() => {
    const canvas     = document.getElementById('snake-canvas');
    const ctx        = canvas.getContext('2d');
    const scoreEl    = document.getElementById('snake-score');
    const bestEl     = document.getElementById('snake-best');
    const overlay    = document.getElementById('snake-overlay');
    const overlayBtn = document.getElementById('snake-overlay-btn');
    const overlayTitle = document.getElementById('snake-overlay-title');
    const overlaySub   = document.getElementById('snake-overlay-sub');

    const ACCENT     = '#7fc12b';
    const CELL       = 24; // grid cell size in px — recomputed in resize
    let   COLS, ROWS, CELL_W;

    // -- size canvas to fit container --
    function resizeCanvas() {
        let w = canvas.parentElement.clientWidth || canvas.closest('.game-card').offsetWidth || 800;
        if (w < 100) w = 800;
        let ratio = 0.55;
        if (window.innerWidth <= 480) ratio = 0.85;
        else if (window.innerWidth <= 768) ratio = 0.68;
        canvas.width  = w;
        canvas.height = Math.round(w * ratio);
        // snap grid
        CELL_W = Math.floor(canvas.width / 22);
        COLS   = Math.floor(canvas.width  / CELL_W);
        ROWS   = Math.floor(canvas.height / CELL_W);
        buildGrid();
    }

    // -- offscreen bg -- 
    let bgCanvas, bgCtx;
    function buildGrid() {
        bgCanvas        = document.createElement('canvas');
        bgCanvas.width  = canvas.width;
        bgCanvas.height = canvas.height;
        bgCtx           = bgCanvas.getContext('2d');
        bgCtx.strokeStyle = 'rgba(127,193,43,0.04)';
        bgCtx.lineWidth   = 1;
        for (let c = 0; c <= COLS; c++) {
            bgCtx.beginPath();
            bgCtx.moveTo(c * CELL_W, 0);
            bgCtx.lineTo(c * CELL_W, canvas.height);
            bgCtx.stroke();
        }
        for (let r = 0; r <= ROWS; r++) {
            bgCtx.beginPath();
            bgCtx.moveTo(0, r * CELL_W);
            bgCtx.lineTo(canvas.width, r * CELL_W);
            bgCtx.stroke();
        }
    }

    resizeCanvas();
    window.addEventListener('resize', () => {
        if (!gameRunning) resizeCanvas();
    });

    // -- preload logo as food --
    const logoImg = new Image();
    logoImg.src   = 'assets/images/logo.png';

    // -- game state --
    let gameRunning = false;
    let snake, dir, nextDir, food, score, bestScore = 0, frameId, tickMs, lastTick;

    function randCell() {
        return {
            x: 1 + Math.floor(Math.random() * (COLS - 2)),
            y: 1 + Math.floor(Math.random() * (ROWS - 2))
        };
    }

    function placeFood() {
        let c;
        do { c = randCell(); } while (snake.some(s => s.x === c.x && s.y === c.y));
        food = c;
    }

    function initGame() {
        const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
        snake   = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
        dir     = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        score   = 0;
        tickMs  = 145;
        scoreEl.textContent = '0';
        placeFood();
    }

    // -- input: keyboard --
    function onKey(e) {
        if (!gameRunning) return;
        const map = {
            ArrowUp:    { x:  0, y: -1 },
            ArrowDown:  { x:  0, y:  1 },
            ArrowLeft:  { x: -1, y:  0 },
            ArrowRight: { x:  1, y:  0 },
            w: { x:  0, y: -1 },
            s: { x:  0, y:  1 },
            a: { x: -1, y:  0 },
            d: { x:  1, y:  0 },
        };
        const d = map[e.key];
        if (!d) return;
        if (d.x === -dir.x && d.y === -dir.y) return;
        nextDir = d;
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    }
    document.addEventListener('keydown', onKey);

    // -- mouse steering --
    // The mouse position in canvas-space is tracked; on each tick we steer
    // toward the cursor (horizontal or vertical, whichever axis has greater offset).
    let mouseCanvasX = -1, mouseCanvasY = -1;
    canvas.addEventListener('mousemove', (e) => {
        if (!gameRunning) return;
        const rect = canvas.getBoundingClientRect();
        mouseCanvasX = (e.clientX - rect.left) * (canvas.width / rect.width);
        mouseCanvasY = (e.clientY - rect.top)  * (canvas.height / rect.height);
    });
    canvas.addEventListener('mouseleave', () => {
        mouseCanvasX = -1; mouseCanvasY = -1;
    });

    function steerByMouse() {
        if (!gameRunning || mouseCanvasX < 0 || !snake) return;
        const head = snake[0];
        // head centre in canvas px
        const hx = (head.x + 0.5) * CELL_W;
        const hy = (head.y + 0.5) * CELL_W;
        const dx = mouseCanvasX - hx;
        const dy = mouseCanvasY - hy;
        const dead = CELL_W * 0.6; // ignore tiny offsets
        if (Math.abs(dx) < dead && Math.abs(dy) < dead) return;

        let d;
        if (Math.abs(dx) >= Math.abs(dy)) {
            d = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
            d = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }
        // disallow 180-degree reversal
        if (d.x === -dir.x && d.y === -dir.y) return;
        nextDir = d;
    }

    // -- touch swipe --
    let touchStart = null;
    canvas.addEventListener('touchstart', e => {
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        // prevent page scroll during gameplay
        if (gameRunning) e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
        // prevent page scroll while snake is running
        if (gameRunning) e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', e => {
        if (!touchStart || !gameRunning) return;
        const dx = e.changedTouches[0].clientX - touchStart.x;
        const dy = e.changedTouches[0].clientY - touchStart.y;
        if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
        if (Math.abs(dx) > Math.abs(dy)) {
            const d = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
            if (d.x !== -dir.x) nextDir = d;
        } else {
            const d = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
            if (d.y !== -dir.y) nextDir = d;
        }
        touchStart = null;
    }, { passive: true });

    // -- draw --
    function draw(ts) {
        if (!gameRunning) return;

        // tick-based movement
        if (ts - lastTick >= tickMs) {
            lastTick = ts;
            tick();
            if (!gameRunning) return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgCanvas, 0, 0);

        // draw food (logo)
        if (logoImg.complete) {
            const pad = CELL_W * 0.1;
            ctx.save();
            ctx.shadowColor = ACCENT; ctx.shadowBlur = 20;
            ctx.drawImage(logoImg, food.x * CELL_W + pad, food.y * CELL_W + pad, CELL_W - pad * 2, CELL_W - pad * 2);
            ctx.restore();
        }

        // draw snake
        snake.forEach((seg, i) => {
            const isHead = i === 0;
            const t = 1 - (i / snake.length) * 0.6; // brightness gradient tail→head
            const px = seg.x * CELL_W, py = seg.y * CELL_W;
            const r  = CELL_W * 0.38;

            // glow on head
            ctx.save();
            if (isHead) {
                ctx.shadowColor = ACCENT;
                ctx.shadowBlur  = 22;
            }
            ctx.beginPath();
            ctx.roundRect(px + 1, py + 1, CELL_W - 2, CELL_W - 2, r);
            // green → darker green for tail
            const g = Math.round(193 * t), b = Math.round(43 * t);
            ctx.fillStyle = `rgb(${Math.round(127 * t)},${g},${b})`;
            ctx.fill();

            // claw "M" mark on head
            if (isHead) {
                ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                ctx.lineWidth   = 1.2;
                ctx.beginPath();
                const cx = px + CELL_W / 2, cy = py + CELL_W / 2, s = CELL_W * 0.22;
                ctx.moveTo(cx - s, cy + s);
                ctx.lineTo(cx - s * 0.5, cy - s);
                ctx.lineTo(cx, cy + s * 0.3);
                ctx.lineTo(cx + s * 0.5, cy - s);
                ctx.lineTo(cx + s, cy + s);
                ctx.stroke();
            }
            ctx.restore();
        });

        frameId = requestAnimationFrame(draw);
    }

    function tick() {
        steerByMouse(); // apply mouse-aim before committing direction
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        // wall collision
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) { endGame(); return; }
        // self collision
        if (snake.some(s => s.x === head.x && s.y === head.y)) { endGame(); return; }

        snake.unshift(head);

        // eat food
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreEl.textContent = score;
            if (score > bestScore) { bestScore = score; bestEl.textContent = bestScore; }
            // speed up every 5 eats, min 65ms
            tickMs = Math.max(65, 145 - Math.floor(score / 5) * 10);
            placeFood();
        } else {
            snake.pop();
        }
    }

    function startGame() {
        resizeCanvas();
        initGame();
        canvas.style.touchAction = 'none';
        gsap.to(overlay, { opacity: 0, duration: 0.4, ease: 'expo.out', onComplete: () => { overlay.style.display = 'none'; } });
        gameRunning = true;
        lastTick    = performance.now();
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(draw);
    }

    function endGame() {
        gameRunning = false;
        cancelAnimationFrame(frameId);
        canvas.style.touchAction = 'pan-y';
        // submit to leaderboard
        if (typeof window.submitLeaderboardScore === 'function') {
            window.submitLeaderboardScore('snake', score);
        }
        overlay.style.display  = 'flex';
        overlay.style.opacity  = '0';
        overlayTitle.textContent = 'BEAST DOWN!';
        overlaySub.innerHTML   = `You ate <strong style="color:#7fc12b">${score}</strong> logos.<br>Best: ${bestScore}`;
        overlayBtn.textContent = 'SLITHER AGAIN';
        gsap.to(overlay, { opacity: 1, duration: 0.5, ease: 'expo.out' });
        gsap.fromTo('#snake-container', { x: -8 }, { x: 8, duration: 0.05, repeat: 8, yoyo: true, ease: 'none', onComplete: () => gsap.set('#snake-container', { x: 0 }) });
    }

    function stop() {
        if (gameRunning) {
            gameRunning = false;
            cancelAnimationFrame(frameId);
            canvas.style.touchAction = 'pan-y';
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';
            overlayTitle.textContent = score > 0 ? 'PAUSED' : 'HUNT MODE';
            overlaySub.innerHTML  = score > 0
                ? `Score: <strong style="color:#7fc12b">${score}</strong>  Best: ${bestScore}`
                : `<span class="instruction-mouse">Arrow keys / WASD to slither.</span><span class="instruction-touch">Swipe to slither.</span><br>Eat Monster logos to grow. Avoid walls &amp; yourself.`;
            overlayBtn.textContent = score > 0 ? 'RESUME' : 'SLITHER';
        }
    }

    overlayBtn.addEventListener('click', startGame);

    return { stop };
})();
