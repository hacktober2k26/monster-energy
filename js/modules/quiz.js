// ── Flavour Quiz — "Find Your Beast" 5-question quiz with result & cart ─
(() => {
    const backdrop   = document.getElementById('quiz-backdrop');
    const modal      = document.getElementById('quiz-modal');
    const closeBtn   = document.getElementById('quiz-close');
    const progressFill = document.getElementById('quiz-progress-fill');
    const stepLabel  = document.getElementById('quiz-step-label');
    const questions  = modal ? [...modal.querySelectorAll('.quiz-q:not(.quiz-result)')] : [];
    const resultQ    = document.getElementById('quiz-modal') ? document.querySelector('.quiz-result') : null;
    const resulCanImg  = document.getElementById('quiz-result-can');
    const resultGlow = document.getElementById('quiz-result-glow');
    const resultName = document.getElementById('quiz-result-name');
    const resultDesc = document.getElementById('quiz-result-desc');
    const addBtn     = document.getElementById('quiz-add-btn');
    const retryBtn   = document.getElementById('quiz-retry-btn');
    const openQuizBtn = document.getElementById('fl-quiz-btn');

    const TOTAL = questions.length; // 5

    // Flavour data keyed by canonical colour
    const FLAVOURS = {
        green: {
            name:   'Original Green',
            img:    'assets/images/green.png',
            price:  368.55,
            accent: '#7fc12b',
            desc:   'You are the original beast. Classic, bold, and unstoppable. This is the flagship — 160mg caffeine, citrus kick, zero compromise. Built for legends.'
        },
        cyan: {
            name:   'Ultra Blue',
            img:    'assets/images/cyan.png',
            price:  399.00,
            accent: '#00e5ff',
            desc:   'Cool-headed and calculated. Zero sugar, 150mg caffeine, ice-cold blueberry. You operate at peak efficiency without cutting corners — or calories.'
        },
        purple: {
            name:   'Violet',
            img:    'assets/images/purple.png',
            price:  389.00,
            accent: '#9c27b0',
            desc:   'Mysterious and unapologetic. A bold grape + berry profile with a depth that matches your energy. You go your own way — and that\'s exactly the point.'
        },
        red: {
            name:   'Pipeline Punch',
            img:    'assets/images/red.png',
            price:  379.00,
            accent: '#f44336',
            desc:   'Explosive, raw, relentless. Tropical fruit meets maximum energy in a can that hits as hard as you do. For those who leave no survivors on the scoreboard.'
        },
    };

    // Tracks vote count per flavour across all 5 questions
    let votes = { green: 0, cyan: 0, purple: 0, red: 0 };
    let currentQ = 0;

    // ── Quiz logic ──
    function resetQuiz() {
        votes = { green: 0, cyan: 0, purple: 0, red: 0 };
        currentQ = 0;
        questions.forEach((q, i) => {
            q.classList.toggle('active', i === 0);
            q.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('selected'));
        });
        if (resultQ) resultQ.classList.remove('active');
        updateProgress(0);
        if (stepLabel) stepLabel.textContent = 'QUESTION 1 OF ' + TOTAL;
    }

    function updateProgress(step) {
        const pct = (step / TOTAL) * 100;
        if (progressFill) progressFill.style.width = pct + '%';
    }

    function showQuestion(i) {
        questions.forEach((q, idx) => q.classList.toggle('active', idx === i));
        if (resultQ) resultQ.classList.remove('active');
        if (stepLabel) stepLabel.textContent = `QUESTION ${i + 1} OF ${TOTAL}`;
        updateProgress(i);
    }

    function showResult() {
        questions.forEach(q => q.classList.remove('active'));
        if (resultQ) resultQ.classList.add('active');
        updateProgress(TOTAL);
        if (stepLabel) stepLabel.textContent = 'YOUR BEAST HAS SPOKEN';

        // Tally: pick flavour with most votes (tie-break: green > cyan > purple > red)
        const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
        const fl = FLAVOURS[winner];

        if (resulCanImg) {
            resulCanImg.src = fl.img;
            resulCanImg.alt = fl.name;
            resulCanImg.style.filter = `drop-shadow(0 0 24px ${fl.accent}) drop-shadow(0 20px 40px rgba(0,0,0,0.6))`;
        }
        if (resultGlow) resultGlow.style.background = `radial-gradient(circle, ${fl.accent}66 0%, transparent 70%)`;
        if (resultName) resultName.textContent = fl.name;
        if (resultName) resultName.style.color = fl.accent;
        if (resultDesc) resultDesc.textContent = fl.desc;

        // Style the add-to-cart button with the winner accent
        if (addBtn) {
            addBtn.style.background = fl.accent;
            addBtn.dataset.winner   = winner;
        }
    }

    // Bind option buttons
    if (modal) {
        modal.querySelectorAll('.quiz-opt').forEach(opt => {
            opt.addEventListener('click', () => {
                const q = opt.closest('.quiz-q');
                const qIdx = parseInt(q.dataset.q);

                // Highlight selected
                q.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');

                // Vote
                const val = opt.dataset.val;
                if (votes[val] !== undefined) votes[val]++;

                // Short delay then advance
                setTimeout(() => {
                    if (qIdx + 1 < TOTAL) {
                        currentQ = qIdx + 1;
                        showQuestion(currentQ);
                    } else {
                        showResult();
                    }
                }, 300);
            });
        });
    }

    // Add to cart from result
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const winner = addBtn.dataset.winner;
            const fl = FLAVOURS[winner];
            if (fl && typeof addToCart === 'function') {
                addToCart(fl.name, fl.price);
                closeQuiz();
            }
        });
    }

    if (retryBtn) retryBtn.addEventListener('click', resetQuiz);

    // ── Open / Close ──
    function openQuiz() {
        resetQuiz();
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (typeof bindCursorHovers === 'function') bindCursorHovers();
    }

    function closeQuiz() {
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (openQuizBtn) openQuizBtn.addEventListener('click', openQuiz);
    if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
    if (backdrop) backdrop.addEventListener('click', e => {
        if (e.target === backdrop) closeQuiz();
    });

    // Escape key
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && backdrop && backdrop.classList.contains('open')) closeQuiz();
    });

    // Expose globally for Escape handler
    window.quizBackdrop = backdrop;
})();
