// -- game section entrance anims --
gsap.from('.game-hero', {
    opacity: 0, y: 50, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: '.game-section', start: 'top 80%' }
});
gsap.from('.game-hub', {
    opacity: 0, y: 60, scale: 0.97, duration: 1, delay: 0.2, ease: 'expo.out',
    scrollTrigger: { trigger: '.game-section', start: 'top 75%' }
});

// ── Monster Catch — wrapped as a stoppable module ──────────────────
window.MonsterCatch = (() => {
    const canvas     = document.getElementById('game-canvas');
    const ctx        = canvas.getContext('2d');
    const scoreEl    = document.getElementById('game-score');
    const bestEl     = document.getElementById('game-best');
    const overlay    = document.getElementById('game-overlay');
    const overlayBtn = document.getElementById('overlay-btn');
    const overlayTitle = document.getElementById('overlay-title');
    const overlaySub   = document.getElementById('overlay-sub');
    const lifeDots = [
        document.getElementById('life-1'),
        document.getElementById('life-2'),
        document.getElementById('life-3'),
    ];

    const CAN_COLORS = ['green', 'cyan', 'purple', 'red'];
    const CAN_HEX    = { green: '#7fc12b', cyan: '#00e5ff', purple: '#9c27b0', red: '#f44336' };
    const root = document.documentElement; // explicit definition

    // -- canvas sizing --
    function resizeCanvas() {
        let w = canvas.parentElement.clientWidth || canvas.closest('.game-card').offsetWidth || 800;
        if (w < 100) w = 800; // guard against collapsed containers
        let ratio = 0.55;
        if (window.innerWidth <= 480) ratio = 0.85;
        else if (window.innerWidth <= 768) ratio = 0.68;
        canvas.width  = w;
        canvas.height = Math.round(w * ratio);
        buildGridCanvas();
    }

    // -- offscreen grid --
    let gridCanvas, gridCtx;
    function buildGridCanvas() {
        gridCanvas        = document.createElement('canvas');
        gridCanvas.width  = canvas.width;
        gridCanvas.height = canvas.height;
        gridCtx           = gridCanvas.getContext('2d');
        gridCtx.strokeStyle = 'rgba(255,255,255,0.02)';
        gridCtx.lineWidth   = 1;
        for (let x = 0; x < canvas.width; x += 40) {
            gridCtx.beginPath(); gridCtx.moveTo(x, 0); gridCtx.lineTo(x, canvas.height); gridCtx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
            gridCtx.beginPath(); gridCtx.moveTo(0, y); gridCtx.lineTo(canvas.width, y); gridCtx.stroke();
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // -- game state --
    let gameRunning  = false;
    let score = 0, bestScore = 0, lives = 3;
    let paddleX      = 0;
    let cans         = [];
    let particles    = [];
    let frameId;
    let spawnTimer   = 0;
    let spawnInterval = 90;
    let speed        = 2.5;
    let frameCount   = 0;

    // -- paddle: mouse + touch --
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        paddleX = (e.clientX - rect.left) * (canvas.width / rect.width);
    });
    function handleTouch(e) {
        if (gameRunning) e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        paddleX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    }
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove',  handleTouch, { passive: false });

    // -- preload logo --
    const monsterLogo = new Image();
    monsterLogo.src   = 'assets/images/logo.png';

    function spawnDrop() {
        const color = CAN_COLORS[Math.floor(Math.random() * CAN_COLORS.length)];
        let sizeFactor = 0.07;
        if (canvas.width <= 480) sizeFactor = 0.12;
        else if (canvas.width <= 768) sizeFactor = 0.09;
        const size  = canvas.width * sizeFactor;
        const x     = Math.random() * (canvas.width - size - 20) + 10;
        cans.push({ x, y: -size, w: size, h: size, color, vy: speed + Math.random() * 1.2 });
    }

    function burst(x, y, hex) {
        for (let i = 0; i < 14; i++) {
            const angle = Math.random() * Math.PI * 2;
            const vel   = 2 + Math.random() * 4;
            particles.push({ x, y, vx: Math.cos(angle) * vel, vy: Math.sin(angle) * vel, r: 3 + Math.random() * 3, alpha: 1, color: hex });
        }
    }

    function drawPaddle() {
        const W  = canvas.width, H = canvas.height;
        const pw = W * 0.15, ph = H * 0.025;
        const py = H - ph - 12;
        const px = Math.max(pw / 2, Math.min(W - pw / 2, paddleX));
        const hex = root.style.getPropertyValue('--accent') || '#7fc12b';
        ctx.shadowColor = hex; ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.roundRect(px - pw / 2, py, pw, ph, ph / 2);
        ctx.fillStyle = hex; ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle  = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.roundRect(px - pw / 2 + 4, py + 2, pw * 0.5, ph * 0.4, 2);
        ctx.fill();
        return { px, py, pw, ph };
    }

    function drawDrops() {
        if (!monsterLogo.complete) return;
        cans.forEach(c => {
            ctx.save();
            ctx.shadowColor = CAN_HEX[c.color]; ctx.shadowBlur = 16;
            ctx.drawImage(monsterLogo, c.x, c.y, c.w, c.h);
            ctx.restore();
        });
    }

    function drawParticles() {
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
        frameCount++;
        speed         = 2.5 + Math.floor(score / 10) * 0.4;
        spawnInterval = Math.max(38, 90 - Math.floor(score / 5) * 5);
        spawnTimer++;
        if (spawnTimer >= spawnInterval) { spawnDrop(); spawnTimer = 0; }

        const W = canvas.width, H = canvas.height;
        const pw = W * 0.15, ph = H * 0.025;
        const py = H - ph - 12;
        const px = Math.max(pw / 2, Math.min(W - pw / 2, paddleX));

        for (let i = cans.length - 1; i >= 0; i--) {
            const c = cans[i];
            c.y += c.vy;
            if (c.y + c.h >= py && c.y + c.h <= py + ph + c.vy + 4 &&
                c.x + c.w >= px - pw / 2 && c.x <= px + pw / 2) {
                burst(c.x + c.w / 2, py, CAN_HEX[c.color]);
                cans.splice(i, 1);
                score++;
                scoreEl.textContent = score;
                if (score > bestScore) { bestScore = score; bestEl.textContent = bestScore; }
                root.style.setProperty('--accent', CAN_HEX[c.color]);
                continue;
            }
            if (c.y > H + 10) {
                cans.splice(i, 1);
                lives--;
                updateLives();
                if (lives <= 0) { endGame(); return; }
            }
        }
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy;
            p.alpha -= 0.035; p.r *= 0.97;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function updateLives() {
        lifeDots.forEach((dot, i) => dot.classList.toggle('active', i < lives));
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(gridCanvas, 0, 0);
        drawDrops();
        drawParticles();
        drawPaddle();
        if (frameCount % 2 === 0 && particles.length > 6) {
            ctx.save();
            ctx.globalAlpha   = 0.1;
            ctx.strokeStyle   = root.style.getPropertyValue('--accent') || '#7fc12b';
            ctx.lineWidth     = 2;
            ctx.shadowBlur    = 16;
            ctx.shadowColor   = ctx.strokeStyle;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }

    function loop() {
        if (!gameRunning) return;
        update(); draw();
        frameId = requestAnimationFrame(loop);
    }

    function startGame() {
        score = 0; lives = 3; cans = []; particles = [];
        spawnTimer = 0; frameCount = 0; speed = 2.5; spawnInterval = 90;
        scoreEl.textContent = '0';
        updateLives();
        paddleX = canvas.width / 2;
        canvas.style.touchAction = 'none';
        gsap.to(overlay, { opacity: 0, duration: 0.4, ease: 'expo.out', onComplete: () => { overlay.style.display = 'none'; } });
        gameRunning = true;
        cancelAnimationFrame(frameId);
        loop();
    }

    function endGame() {
        gameRunning = false;
        cancelAnimationFrame(frameId);
        canvas.style.touchAction = 'pan-y';
        // submit to leaderboard
        if (typeof window.submitLeaderboardScore === 'function') {
            window.submitLeaderboardScore('catch', score);
        }
        overlay.style.display  = 'flex';
        overlay.style.opacity  = '0';
        overlayTitle.textContent = 'GAME OVER';
        overlaySub.innerHTML   = `You caught <strong style="color:var(--accent)">${score}</strong> logos.<br>Best: ${bestScore}`;
        overlayBtn.textContent = 'PLAY AGAIN';
        gsap.to(overlay, { opacity: 1, duration: 0.5, ease: 'expo.out' });
        gsap.fromTo('#game-container', { x: -10 }, { x: 10, duration: 0.05, repeat: 8, yoyo: true, ease: 'none', onComplete: () => gsap.set('#game-container', { x: 0 }) });
    }

    // public API for the hub
    function stop() {
        if (gameRunning) {
            gameRunning = false;
            cancelAnimationFrame(frameId);
            canvas.style.touchAction = 'pan-y';
            // show overlay so user can resume later
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';
            overlayTitle.textContent = score > 0 ? 'PAUSED' : 'READY?';
            overlaySub.innerHTML  = score > 0
                ? `Score: <strong style="color:var(--accent)">${score}</strong>  Best: ${bestScore}`
                : `<span class="instruction-mouse">Move your mouse to catch the falling Monster logos.</span><span class="instruction-touch">Tap to catch the falling Monster logos.</span><br>Miss 3 and you're done.`;
            overlayBtn.textContent = score > 0 ? 'RESUME' : 'UNLEASH';
        }
    }

    overlayBtn.addEventListener('click', startGame);

    return { stop };
})();
