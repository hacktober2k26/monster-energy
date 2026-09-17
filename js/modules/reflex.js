// ── Reflex Rush — Monster can whack-a-mole ───────────────────────────
window.ReflexRush = (() => {
    const canvas     = document.getElementById('reflex-canvas');
    const ctx        = canvas.getContext('2d');
    const scoreEl    = document.getElementById('reflex-score');
    const bestEl     = document.getElementById('reflex-best');
    const overlay    = document.getElementById('reflex-overlay');
    const overlayBtn = document.getElementById('reflex-overlay-btn');
    const overlayTitle = document.getElementById('reflex-overlay-title');
    const overlaySub   = document.getElementById('reflex-overlay-sub');
    const lifeDots = [
        document.getElementById('reflex-life-1'),
        document.getElementById('reflex-life-2'),
        document.getElementById('reflex-life-3'),
    ];

    // can colors matching Monster lineup
    const COLORS = ['#7fc12b', '#00e5ff', '#9c27b0', '#f44336'];

    let COLS = 4, ROWS = 3;
    let CELL_W, CELL_H, PAD;

    function resizeCanvas() {
        let w = canvas.parentElement.clientWidth || canvas.closest('.game-card').offsetWidth || 800;
        if (w < 100) w = 800;
        let ratio = 0.55;
        if (window.innerWidth <= 480) ratio = 0.85;
        else if (window.innerWidth <= 768) ratio = 0.68;
        canvas.width  = w;
        canvas.height = Math.round(w * ratio);
        CELL_W = Math.floor(canvas.width  / COLS);
        CELL_H = Math.floor(canvas.height / ROWS);
        PAD    = Math.min(CELL_W, CELL_H) * 0.15;
    }

    resizeCanvas();
    window.addEventListener('resize', () => { if (!gameRunning) resizeCanvas(); });

    // preload can image (logo)
    const canImg = new Image();
    canImg.src   = 'assets/images/logo.png';

    // ── state ──
    let gameRunning = false;
    let score = 0, bestScore = 0, lives = 3;
    let streak = 0, beastMode = false, beastTimer = 0;
    let pods = []; // active pops
    let frameId, spawnTimer, spawnInterval, podLifetime;
    let particles = [];

    // Grid cell to screen coords (centre of cell)
    function cellRect(col, row) {
        return {
            x: col * CELL_W + PAD,
            y: row * CELL_H + PAD,
            w: CELL_W - PAD * 2,
            h: CELL_H - PAD * 2,
        };
    }

    function initGame() {
        score  = 0; lives = 3; streak = 0;
        beastMode = false; beastTimer = 0;
        pods = []; particles = [];
        spawnTimer    = 0;
        spawnInterval = 80;  // frames between spawns
        podLifetime   = 180; // frames a pod lives
        scoreEl.textContent = '0';
        updateLives();
    }

    function spawnPod() {
        // limit max pods on screen to 4
        if (pods.length >= 4) return;
        // pick a free cell
        const occupied = new Set(pods.map(p => `${p.col},${p.row}`));
        const free = [];
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            if (!occupied.has(`${c},${r}`)) free.push({ c, r });
        }
        if (free.length === 0) return;
        const { c, r } = free[Math.floor(Math.random() * free.length)];
        pods.push({
            col: c, row: r,
            life: podLifetime,
            maxLife: podLifetime,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            hit: false,
            scale: 0, // rises from 0 → 1
        });
    }

    function burst(x, y, color) {
        for (let i = 0; i < 18; i++) {
            const angle = Math.random() * Math.PI * 2;
            const vel   = 2.5 + Math.random() * 5;
            particles.push({ x, y, vx: Math.cos(angle) * vel, vy: Math.sin(angle) * vel, r: 3 + Math.random() * 4, alpha: 1, color });
        }
    }

    function updateLives() {
        lifeDots.forEach((d, i) => d.classList.toggle('active', i < lives));
    }

    // ── click / tap detection ──
    function pointerDown(e) {
        if (!gameRunning) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const sx = ((e.clientX ?? e.touches[0].clientX) - rect.left) * (canvas.width  / rect.width);
        const sy = ((e.clientY ?? e.touches[0].clientY) - rect.top)  * (canvas.height / rect.height);

        let hit = false;
        for (let i = pods.length - 1; i >= 0; i--) {
            const p = pods[i];
            if (p.hit) continue;
            const { x, y, w, h } = cellRect(p.col, p.row);
            const visScale = p.scale;
            const vw = w * visScale, vh = h * visScale;
            const cx = x + w / 2, cy = y + h / 2;
            if (sx >= cx - vw / 2 && sx <= cx + vw / 2 && sy >= cy - vh / 2 && sy <= cy + vh / 2) {
                p.hit = true;
                score++;
                scoreEl.textContent = score;
                if (score > bestScore) { bestScore = score; bestEl.textContent = bestScore; }
                streak++;
                if (streak >= 5 && !beastMode) {
                    beastMode  = true;
                    beastTimer = 360; // 6s at 60fps
                    spawnInterval = Math.max(25, spawnInterval * 0.6 | 0);
                }
                burst(cx, cy, p.color);
                hit = true;
                break;
            }
        }
        if (!hit) {
            // miss-click spark (small penalty visual, no life loss)
            particles.push({ x: sx, y: sy, vx: 0, vy: -2, r: 4, alpha: 0.7, color: '#f44336' });
        }
    }

    canvas.addEventListener('mousedown',  pointerDown);
    canvas.addEventListener('touchstart', (e) => {
        if (gameRunning) e.preventDefault();
        // Build a synthetic event-like object with clientX/Y from the touch point
        const touch = e.touches[0];
        pointerDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
        if (gameRunning) e.preventDefault();
    }, { passive: false });

    // ── draw ──
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // subtle grid bg
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth   = 1;
        for (let c = 0; c <= COLS; c++) {
            ctx.beginPath(); ctx.moveTo(c * CELL_W, 0); ctx.lineTo(c * CELL_W, canvas.height); ctx.stroke();
        }
        for (let r = 0; r <= ROWS; r++) {
            ctx.beginPath(); ctx.moveTo(0, r * CELL_H); ctx.lineTo(canvas.width, r * CELL_H); ctx.stroke();
        }

        // beast mode banner
        if (beastMode) {
            ctx.save();
            ctx.font        = `bold ${Math.round(canvas.width * 0.035)}px Inter, sans-serif`;
            ctx.fillStyle   = '#7fc12b';
            ctx.textAlign   = 'center';
            ctx.shadowColor = '#7fc12b'; ctx.shadowBlur = 24;
            ctx.globalAlpha = 0.85;
            ctx.fillText('⚡ BEAST MODE ⚡', canvas.width / 2, canvas.height * 0.06);
            ctx.restore();
        }

        // draw pods
        pods.forEach(p => {
            const { x, y, w, h } = cellRect(p.col, p.row);
            const cx = x + w / 2, cy = y + h / 2;
            const vw = w * p.scale, vh = h * p.scale;

            ctx.save();
            ctx.translate(cx, cy);

            // hit flash then shrink
            if (p.hit) {
                ctx.globalAlpha = p.scale;
                ctx.scale(p.scale, p.scale);
                ctx.shadowColor = p.color; ctx.shadowBlur = 40;
                if (canImg.complete) ctx.drawImage(canImg, -vw / 2, -vh / 2, vw, vh);
                ctx.restore();
                return;
            }

            // timer ring
            const progress = p.life / p.maxLife;
            const radius   = Math.min(vw, vh) * 0.55;

            // ring track
            ctx.beginPath();
            ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth   = 3;
            ctx.stroke();

            // ring fill (draining)
            ctx.beginPath();
            ctx.arc(0, 0, radius + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
            ctx.strokeStyle = p.color;
            ctx.lineWidth   = 3;
            ctx.shadowColor = p.color; ctx.shadowBlur = 10;
            ctx.stroke();

            // can image
            ctx.shadowBlur = 18;
            if (canImg.complete) {
                ctx.drawImage(canImg, -vw / 2, -vh / 2, vw, vh);
            } else {
                // fallback circle
                ctx.beginPath(); ctx.arc(0, 0, vw * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }

            ctx.restore();
        });

        // particles
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle  = p.color;
            ctx.shadowColor = p.color; ctx.shadowBlur = 8;
            ctx.fill(); ctx.restore();
        });
    }

    function update() {
        // beast mode countdown
        if (beastMode) {
            beastTimer--;
            if (beastTimer <= 0) {
                beastMode = false;
                streak    = 0;
                spawnInterval = 80; // reset
            }
        }

        // difficulty ramp
        if (!beastMode) {
            spawnInterval = Math.max(45, 80 - Math.floor(score / 8) * 5);
            podLifetime   = Math.max(90, 180 - Math.floor(score / 10) * 10);
        }

        // spawn
        spawnTimer++;
        if (spawnTimer >= spawnInterval) { spawnPod(); spawnTimer = 0; }

        // update existing pods
        for (let i = pods.length - 1; i >= 0; i--) {
            const p = pods[i];
            if (p.hit) {
                // shrink on hit
                p.scale = Math.max(0, p.scale - 0.12);
                if (p.scale <= 0) pods.splice(i, 1);
                continue;
            }

            // rise animation
            if (p.scale < 1) p.scale = Math.min(1, p.scale + 0.08);

            p.life--;
            if (p.life <= 0) {
                // expired — lose life
                pods.splice(i, 1);
                lives--;
                streak = 0; // break streak on miss
                updateLives();
                if (lives <= 0) { endGame(); return; }
            }
        }

        // particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy;
            p.alpha -= 0.04; p.r *= 0.96;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function loop() {
        if (!gameRunning) return;
        update();
        draw();
        frameId = requestAnimationFrame(loop);
    }

    function startGame() {
        resizeCanvas();
        initGame();
        canvas.style.touchAction = 'none';
        gsap.to(overlay, { opacity: 0, duration: 0.4, ease: 'expo.out', onComplete: () => { overlay.style.display = 'none'; } });
        gameRunning = true;
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(loop);
    }

    function endGame() {
        gameRunning = false;
        cancelAnimationFrame(frameId);
        canvas.style.touchAction = 'pan-y';
        // submit to leaderboard
        if (typeof window.submitLeaderboardScore === 'function') {
            window.submitLeaderboardScore('reflex', score);
        }
        overlay.style.display  = 'flex';
        overlay.style.opacity  = '0';
        overlayTitle.textContent = 'TOO SLOW!';
        overlaySub.innerHTML   = `You smashed <strong style="color:#7fc12b">${score}</strong> cans.<br>Best: ${bestScore}`;
        overlayBtn.textContent = 'SMASH AGAIN';
        gsap.to(overlay, { opacity: 1, duration: 0.5, ease: 'expo.out' });
        gsap.fromTo('#reflex-container', { x: -8 }, { x: 8, duration: 0.05, repeat: 8, yoyo: true, ease: 'none', onComplete: () => gsap.set('#reflex-container', { x: 0 }) });
    }

    function stop() {
        if (gameRunning) {
            gameRunning = false;
            cancelAnimationFrame(frameId);
            canvas.style.touchAction = 'pan-y';
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';
            overlayTitle.textContent = score > 0 ? 'PAUSED' : 'BEAST MODE?';
            overlaySub.innerHTML  = score > 0
                ? `Score: <strong style="color:#7fc12b">${score}</strong>  Best: ${bestScore}`
                : `<span class="instruction-mouse">Click the Monster cans before they vanish.</span><span class="instruction-touch">Tap the Monster cans before they vanish.</span><br>5 consecutive hits = BEAST MODE!`;
            overlayBtn.textContent = score > 0 ? 'RESUME' : 'SMASH IT';
        }
    }

    overlayBtn.addEventListener('click', startGame);

    return { stop };
})();
