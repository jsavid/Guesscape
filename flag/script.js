const countries = window.gameData.countries;

// Audio System
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
        // Major Arpeggio
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
        // Dissonant Buzz
        SoundManager.playTone(150, 'sawtooth', 0.4);
        SoundManager.playTone(140, 'sawtooth', 0.4);
    }
};

// Game State
let currentScore = 0;
let remainingCountries = [];
let currentQuestion = null;
let isAnswered = false;
let continentStats = {};

// DOM Elements
const scoreEl = document.getElementById('score');
const countEl = document.getElementById('count');
const gameContainer = document.getElementById('game-container');
const gameOverSection = document.getElementById('game-over');
const finalScoreVal = document.getElementById('final-score-value');
const statsBreakdown = document.getElementById('stats-breakdown');
const finalMessage = document.getElementById('final-message');
const restartBtn = document.getElementById('restart-btn');
const flagImg = document.getElementById('flag-img');
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
    if (gameTitle) gameTitle.textContent = I18N.t('headerFlags');
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
                btn.textContent = I18N.tCountry(country.code, country.name);
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
    // Shuffle and pick 20
    const shuffled = [...countries].sort(() => 0.5 - Math.random());
    remainingCountries = shuffled.slice(0, TOTAL_QUESTIONS);
    currentScore = 0;

    // Reset Stats
    continentStats = {};
    remainingCountries.forEach(c => {
        if (!continentStats[c.continent]) {
            continentStats[c.continent] = { correct: 0, total: 0 };
        }
    });

    updateScoreUI();
    updateUIStrings();

    // UI Reset
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

    // Reset UI
    isAnswered = false;
    optionsContainer.innerHTML = '';
    flagImg.style.opacity = '0';

    // Pick Random
    const randomIndex = Math.floor(Math.random() * remainingCountries.length);
    const correctCountry = remainingCountries[randomIndex];

    continentStats[correctCountry.continent].total++;
    remainingCountries.splice(randomIndex, 1);
    updateScoreUI();

    // Distractors
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

    // Render Flag
    const img = new Image();
    img.onload = () => {
        flagImg.src = img.src;
        flagImg.style.opacity = '1';
    };
    img.src = `https://flagcdn.com/w640/${correctCountry.code.toLowerCase()}.png`;

    continentHint.textContent = I18N.tContinent(correctCountry.continent);

    options.forEach(country => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = I18N.tCountry(country.code, country.name);
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
        generateQuestion();
    }, 1000);
}

init();
