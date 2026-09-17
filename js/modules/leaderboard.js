// ── Leaderboard — localStorage high score tracking + panel UI ──────────
(() => {
    const STORAGE_KEY = 'monster-leaderboard';
    const MAX_SCORES  = 5; // top 5 per game

    // ── DOM refs ──
    const backdrop  = document.getElementById('lb-backdrop');
    const panel     = document.getElementById('lb-panel');
    const closeBtn  = document.getElementById('lb-close');
    const resetBtn  = document.getElementById('lb-reset');

    const scoreEls = {
        catch:  document.getElementById('lb-catch-scores'),
        snake:  document.getElementById('lb-snake-scores'),
        reflex: document.getElementById('lb-reflex-scores'),
    };

    // ── Data ──
    function loadAll() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
        catch { return {}; }
    }

    function saveAll(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // Submit a score for a game ID. Returns true if it made the top 5.
    function submitScore(gameId, score) {
        if (!score || score <= 0) return false;
        const data   = loadAll();
        const scores = data[gameId] || [];
        const entry  = { score, date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) };
        scores.push(entry);
        scores.sort((a, b) => b.score - a.score);
        data[gameId] = scores.slice(0, MAX_SCORES);
        saveAll(data);
        return true;
    }

    // Expose globally so game modules can call it
    window.submitLeaderboardScore = submitScore;

    // ── Render ──
    const MEDALS = ['lb-rank-1', 'lb-rank-2', 'lb-rank-3'];

    function renderGame(gameId) {
        const el = scoreEls[gameId];
        if (!el) return;
        const data   = loadAll();
        const scores = data[gameId] || [];

        if (scores.length === 0) {
            el.innerHTML = '<div class="lb-empty">No scores yet — play to claim the throne!</div>';
            return;
        }

        el.innerHTML = scores.map((entry, i) => {
            const rankClass = MEDALS[i] || 'lb-rank-n';
            const medalLabel = i === 0 ? 'TOP' : '';
            return `
                <div class="lb-score-row">
                    <div class="lb-rank ${rankClass}">${i + 1}</div>
                    <div class="lb-score-info">
                        <span class="lb-score-val">${entry.score}</span>
                        <span class="lb-score-date">${entry.date}</span>
                    </div>
                    ${medalLabel ? `<span class="lb-score-badge">${medalLabel}</span>` : ''}
                </div>
            `;
        }).join('');
    }

    function renderAll() {
        renderGame('catch');
        renderGame('snake');
        renderGame('reflex');
    }

    // ── Open / Close ──
    function openLB() {
        renderAll();
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (typeof bindCursorHovers === 'function') bindCursorHovers();
    }

    function closeLB() {
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLB);
    if (backdrop) backdrop.addEventListener('click', e => { if (!panel.contains(e.target)) closeLB(); });

    if (resetBtn) resetBtn.addEventListener('click', () => {
        if (confirm('Clear all leaderboard scores? This cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEY);
            renderAll();
            if (typeof showToast === 'function') showToast('Scores cleared. Start fresh!');
        }
    });

    // Escape key
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && backdrop && backdrop.classList.contains('open')) closeLB();
    });

    // ── Inject "Leaderboard" button into game section hero ──
    const gameHero = document.querySelector('.game-hero');
    if (gameHero) {
        const lbBtn = document.createElement('button');
        lbBtn.className = 'lb-open-btn';
        lbBtn.id = 'lb-open-btn';
        lbBtn.setAttribute('aria-haspopup', 'dialog');
        lbBtn.innerHTML = '🏆 LEADERBOARD';
        lbBtn.addEventListener('click', openLB);
        gameHero.appendChild(lbBtn);
    }

    // Also expose open function globally
    window.openLeaderboard = openLB;
})();
