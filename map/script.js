const countries = window.gameData.countries;

// Audio System (Reusing from Flag game)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const SoundManager = {
    playTone: (freq, type, duration) => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    },

    playWin: () => {
        const now = audioCtx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.05, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
    },

    playLose: () => {
        SoundManager.playTone(150, 'sawtooth', 0.4);
        SoundManager.playTone(140, 'sawtooth', 0.4);
    }
};

// Map configuration constants
const MAP_CONFIG = {
    selector: '#map-container',
    map: 'world',
    backgroundColor: 'transparent',
    draggable: true,
    zoomButtons: true,
    zoomOnScroll: true,
    zoomMax: 15,
    zoomMin: 1,
    zoomStep: 1.4,
    zoomAnimate: true,
    regionsSelectable: false, // Strictly disable manual selection
    regionStyle: {
        initial: {
            fill: '#a87932', // Bronze tone preserved
            stroke: 'rgba(50, 50, 50, 0.7)',
            strokeWidth: 0.35,
            fillOpacity: 1
        },
        hover: {
            fillOpacity: 0.9,
            cursor: 'default'
        },
        selected: {
            fill: '#dcfe4b', // Fluorescent yellow preserved
            stroke: 'rgba(20, 20, 20, 0.9)',
            strokeWidth: 0.5
        }
    },
    onRegionTooltipShow(event, tooltip) {
        event.preventDefault();
    },
    onRegionClick(event, code) {
        event.preventDefault();
    }
};

function applyNonScalingBorders() {
    const mapSvg = document.querySelector('#map-container svg');
    if (mapSvg) {
        mapSvg.querySelectorAll('path').forEach(p => {
            p.setAttribute('vector-effect', 'non-scaling-stroke');
            p.setAttribute('stroke-linejoin', 'round');
            p.setAttribute('stroke-linecap', 'round');
        });
    }
}

// Game State
let currentScore = 0;
let remainingCountries = [];
let currentQuestion = null;
let isAnswered = false;
let continentStats = {};
let map = null;

// DOM Elements
const scoreEl = document.getElementById('score');
const countEl = document.getElementById('count');
const gameContainer = document.getElementById('game-container');
const gameOverSection = document.getElementById('game-over');
const finalScoreVal = document.getElementById('final-score-value');
const statsBreakdown = document.getElementById('stats-breakdown');
const finalMessage = document.getElementById('final-message');
const restartBtn = document.getElementById('restart-btn');
const continentHint = document.getElementById('continent-hint');
const optionsContainer = document.getElementById('options-container');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const flashOverlay = document.getElementById('flash-overlay');

const TOTAL_QUESTIONS = 20;

function updateUIStrings() {
    const scoreLabel = document.getElementById('score-label');
    const countLabel = document.getElementById('count-label');
    const gameTitle = document.getElementById('game-title');
    const gameOverTitle = document.getElementById('game-over-title');
    const finalScoreLabel = document.getElementById('final-score-label');

    if (scoreLabel) scoreLabel.textContent = I18N.t('score');
    if (countLabel) countLabel.textContent = I18N.t('progress');
    if (gameTitle) gameTitle.textContent = I18N.t('headerMaps');
    if (gameOverTitle) gameOverTitle.textContent = I18N.t('gameOver');
    if (finalScoreLabel) finalScoreLabel.textContent = I18N.t('finalScore');
    if (restartBtn) restartBtn.textContent = I18N.t('backToMenu');
    if (backToMenuBtn) backToMenuBtn.textContent = I18N.t('backToMenu');

    if (currentQuestion && !isAnswered) {
        continentHint.textContent = I18N.tContinent(currentQuestion.correct.continent);
        optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
            const code = btn.dataset.code;
            const country = currentQuestion.options.find(c => c.code === code);
            if (country) {
                const span = btn.querySelector('span');
                if (span) {
                    span.textContent = I18N.tCountry(country.code, country.name);
                }
            }
        });
    }

    if (!gameOverSection.classList.contains('hidden')) {
        const percentage = Math.round((currentScore / TOTAL_QUESTIONS) * 100);
        finalMessage.textContent = I18N.getRating(percentage);
        renderStatsBreakdown();
    }
}

// Initialize
function init() {
    try {
        map = new jsVectorMap(MAP_CONFIG);
        applyNonScalingBorders();
    } catch (e) {
        console.error("Map initialization failed", e);
    }

    const shuffled = [...countries].sort(() => 0.5 - Math.random());
    remainingCountries = shuffled.slice(0, TOTAL_QUESTIONS);
    currentScore = 0;

    continentStats = {};
    remainingCountries.forEach(c => {
        if (!continentStats[c.continent]) {
            continentStats[c.continent] = { correct: 0, total: 0 };
        }
    });

    updateScoreUI();
    updateUIStrings();

    gameContainer.classList.remove('hidden');
    gameOverSection.classList.add('hidden');
    backToMenuBtn.classList.remove('hidden');

    generateQuestion();

    const goToMenu = () => window.location.href = '../index.html';
    restartBtn.onclick = goToMenu;
    backToMenuBtn.onclick = goToMenu;
}

I18N.onLanguageChange(updateUIStrings);

function updateScoreUI() {
    scoreEl.textContent = currentScore;
    const answeredCount = TOTAL_QUESTIONS - remainingCountries.length;
    countEl.textContent = `${answeredCount}/${TOTAL_QUESTIONS}`;
}

function triggerFlash(type) {
    flashOverlay.className = 'flash-overlay';
    void flashOverlay.offsetWidth;
    if (type === 'correct') {
        flashOverlay.classList.add('flash-correct');
    } else {
        flashOverlay.classList.add('flash-wrong');
    }
}

function renderStatsBreakdown() {
    statsBreakdown.innerHTML = '';
    const sortedContinents = Object.keys(continentStats).sort();

    sortedContinents.forEach(cont => {
        const data = continentStats[cont];
        if (data.total > 0) {
            let contPercent = Math.round((data.correct / data.total) * 100);
            const row = document.createElement('div');
            row.className = 'stat-row';
            row.innerHTML = `
                <span class="continent-name">${I18N.tContinent(cont)}</span>
                <span class="continent-score">${contPercent}% (${data.correct}/${data.total})</span>
            `;
            statsBreakdown.appendChild(row);
        }
    });
}

function endGame() {
    gameContainer.classList.add('hidden');
    backToMenuBtn.classList.add('hidden');
    gameOverSection.classList.remove('hidden');

    const percentage = Math.round((currentScore / TOTAL_QUESTIONS) * 100);
    finalScoreVal.textContent = `${percentage}%`;
    finalMessage.textContent = I18N.getRating(percentage);

    renderStatsBreakdown();
    SoundManager.playWin();
}

function generateQuestion() {
    if (remainingCountries.length === 0) {
        endGame();
        return;
    }

    isAnswered = false;
    optionsContainer.innerHTML = '';

    const randomIndex = Math.floor(Math.random() * remainingCountries.length);
    const correctCountry = remainingCountries[randomIndex];

    continentStats[correctCountry.continent].total++;
    remainingCountries.splice(randomIndex, 1);
    updateScoreUI();

    const sameContinent = countries.filter(c =>
        c.continent === correctCountry.continent && c.code !== correctCountry.code
    );

    const shuffledDistractors = sameContinent.sort(() => 0.5 - Math.random());
    const distractors = shuffledDistractors.slice(0, 5);
    const options = [correctCountry, ...distractors].sort(() => 0.5 - Math.random());

    currentQuestion = {
        correct: correctCountry,
        options: options
    };

    if (map) {
        try {
            map.clearSelectedRegions();
            const countryCode = correctCountry.code.toUpperCase();
            map.setSelectedRegions([countryCode]);
            map.setFocus({
                regions: [countryCode],
                animate: true,
                padding: 0.2
            });
            applyNonScalingBorders();
        } catch (e) {
            console.error("Map focus error:", e);
        }
    }

    continentHint.textContent = I18N.tContinent(correctCountry.continent);

    options.forEach(country => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';

        let flagCode = country.code.toLowerCase();
        if (flagCode === '_1') flagCode = 'xk';

        btn.innerHTML = `
            <img src="https://flagcdn.com/w40/${flagCode}.png" class="option-flag" alt="">
            <span>${I18N.tCountry(country.code, country.name)}</span>
        `;

        btn.dataset.code = country.code;
        btn.addEventListener('click', () => handleAnswer(country, btn));
        optionsContainer.appendChild(btn);
    });
}

function handleAnswer(selectedCountry, btnElement) {
    if (isAnswered) return;
    isAnswered = true;

    const correctCode = currentQuestion.correct.code;
    const continent = currentQuestion.correct.continent;
    const allButtons = optionsContainer.querySelectorAll('.option-btn');

    if (selectedCountry.code === correctCode) {
        currentScore++;
        continentStats[continent].correct++;
        SoundManager.playWin();
        triggerFlash('correct');
        btnElement.classList.add('correct');
        scoreEl.parentElement.classList.add('pulse');
        setTimeout(() => scoreEl.parentElement.classList.remove('pulse'), 500);
    } else {
        SoundManager.playLose();
        triggerFlash('wrong');
        btnElement.classList.add('wrong');
        allButtons.forEach(btn => {
            if (btn.dataset.code === correctCode) {
                btn.classList.add('correct');
            }
        });
    }

    updateScoreUI();
    allButtons.forEach(btn => btn.disabled = true);

    setTimeout(() => {
        if (map) map.clearSelectedRegions();
        generateQuestion();
    }, 1500);
}

// Start
window.onload = () => {
    init();
};
