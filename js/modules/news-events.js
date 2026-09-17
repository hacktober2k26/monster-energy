// -- event modal "register interest" button --
document.querySelector('.ev-modal-btn').addEventListener('click', () => {
    const title = document.getElementById('ev-modal-title').textContent;
    const date  = document.getElementById('ev-modal-date').textContent;
    closeModal();
    setTimeout(() => {
        showConfirm(
            '🏁',
            'Interest Registered!',
            `We've noted your interest in "${title}" (${date}). Monster Energy will keep you updated — stay wild! 🤘`
        );
    }, 400);
});

// -- news modal "read full story" button --
document.querySelector('.nw-modal-btn').addEventListener('click', () => {
    const title = document.getElementById('nw-modal-title').textContent;
    showToast(`Full story for "${title}" — coming soon on Monster.com! 📰`);
});

// -- more news panel: wire up "read more →" buttons + row clicks --
// maps panel articles (by index) to their full data
const newsData = [
    {
        tag:   'FORMULA 1',
        title: 'Lando Norris Crowned 2025 World Champion',
        date:  'November 2025 · Motors',
        desc:  'In a stunning championship finale, Lando Norris of McLaren secured the 2025 Formula 1 Drivers\' World Championship, backed by Monster Energy. After a season of relentless pressure, brilliant strategy, and scintillating pace, the British driver claimed his maiden title with a dominant lights-to-flag victory. Monster Energy was there every step of the way.',
        img:   'assets/images/Lando Norris Crowned 2025 World Champion(news).png',
    },
    {
        tag:   'RALLY',
        title: 'Interview with Dakar Rally Finisher Adrien Van Beveren',
        date:  'January 2024 · Offroad',
        desc:  'Monster Energy athlete Adrien Van Beveren secured a brilliant 3rd place at the 2024 Dakar Rally, one of the most gruelling off-road competitions on the planet. He opens up about navigating the sand dunes of Saudi Arabia across 14 stages and pushing through mechanical setbacks.',
        img:   'assets/images/Interview with 2024 Dakar Rally 3rd Place Finisher Adrien Van Beveren (News).png',
    },
    {
        tag:   'GAMING',
        title: 'Mastering Verdansk: Pro Tips for Dominating Warzone',
        date:  'March 2025 · Esports',
        desc:  'Monster Energy\'s roster of professional Call of Duty Warzone players share their elite strategies for dominating Verdansk. From optimal landing zones and looting routes to late-game circle management and weapon meta breakdowns — this insider guide is built for players who want to compete at the highest level.',
        img:   'assets/images/Mastering Verdansk  Pro Tips for Dominating Warzone(News).png',
    },
    {
        tag:   'FIGHT',
        title: 'Pitbull Scores First UFC Victory at UFC 318',
        date:  'August 2025 · MMA',
        desc:  'Monster Energy athlete Patricio \'Pitbull\' Freire delivered a stunning performance at UFC 318, securing his first UFC victory in dramatic fashion. The former Bellator featherweight champion delivered a second-round TKO in one of the night\'s most electric bouts.',
        img:   'assets/images/Monster Energy\'s Patricio \'Pitbull\' Freire Scores First UFC Victory at UFC 318(News).png',
    },
];

// open news modal from panel data (close panel first for smooth UX)
function openNewsModalFromData(data) {
    document.getElementById('nw-modal-img').src           = data.img;
    document.getElementById('nw-modal-img').alt           = data.title;
    document.getElementById('nw-modal-tag').textContent   = data.tag;
    document.getElementById('nw-modal-title').textContent = data.title;
    document.getElementById('nw-modal-date').textContent  = data.date;
    document.getElementById('nw-modal-desc').textContent  = data.desc;
    document.getElementById('nw-modal-img-glow').style.background =
        `linear-gradient(135deg, ${{
            'FORMULA 1': 'rgba(220,30,30,0.25)',
            'RALLY':     'rgba(255,160,0,0.2)',
            'GAMING':    'rgba(0,200,255,0.2)',
            'FIGHT':     'rgba(255,80,0,0.22)',
        }[data.tag] || 'rgba(127,193,43,0.2)'} 0%, transparent 60%)`;

    closeNewsPanel();
    setTimeout(() => {
        nwModalBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        gsap.fromTo('#nw-modal',
            { y: 40, scale: 0.95, opacity: 0 },
            { y: 0,  scale: 1,    opacity: 1, duration: 0.5, ease: 'expo.out' }
        );
        bindCursorHovers();
    }, 350);
}

// "read more →" buttons
document.querySelectorAll('.nw-panel-article-btn').forEach((btn, i) => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (newsData[i]) openNewsModalFromData(newsData[i]);
    });
});

// whole article row clickable too
document.querySelectorAll('.nw-panel-article').forEach((article, i) => {
    article.style.cursor = 'pointer';
    article.addEventListener('click', () => {
        if (newsData[i]) openNewsModalFromData(newsData[i]);
    });
});