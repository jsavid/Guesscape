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
        try {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const now = audioCtx.currentTime;

            // Low frequency error buzzer 1
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(160, now);
            gain1.gain.setValueAtTime(0.2, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            osc1.start(now);
            osc1.stop(now + 0.16);

            // Lower frequency error buzzer 2 (distinct game fail buzz)
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(115, now + 0.16);
            gain2.gain.setValueAtTime(0.25, now + 0.16);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start(now + 0.16);
            osc2.stop(now + 0.45);
        } catch (e) {
            console.error("Audio error:", e);
        }
    }
};

// Game Configuration & State
function getQuestionsCount() {
    const params = new URLSearchParams(window.location.search);
    const q = parseInt(params.get('questions'), 10);
    return [10, 20, 50, 100].includes(q) ? q : 20;
}
const TOTAL_QUESTIONS = getQuestionsCount();
let activeMode = 'locate'; // 'locate' (click map) or 'guess' (choose button)
let currentScore = 0;
let remainingCountries = [];
let currentQuestion = null;
let isAnswered = false;
let continentStats = {};
let map = null;

// Map configuration
const MAP_CONFIG = {
    selector: '#map-container',
    map: 'world',
    backgroundColor: 'transparent',
    draggable: true,
    zoomButtons: false, // Using our custom zoom buttons
    zoomOnScroll: true,
    zoomMax: 50, // Ultra-high zoom for small countries & microstates
    zoomMin: 1,
    zoomStep: 1.45,
    zoomAnimate: true,
    regionsSelectable: false,
    regionStyle: {
        initial: {
            fill: '#a87932', // Bronze earth tone
            stroke: 'rgba(50, 50, 50, 0.7)',
            strokeWidth: 0.35,
            fillOpacity: 1
        },
        hover: {
            fillOpacity: 0.88,
            cursor: 'pointer'
        },
        selected: {
            fill: '#dcfe4b', // Fluorescent neon yellow for guess mode
            stroke: 'rgba(20, 20, 20, 0.95)',
            strokeWidth: 0.55
        }
    },
    onRegionTooltipShow(event) {
        // Prevent showing tooltip on hover to avoid giving away country names in locate mode
        event.preventDefault();
    },
    onRegionClick(event, code) {
        if (activeMode === 'locate') {
            handleLocateAnswer(code);
        }
    }
};

// Polyfill setSelectedRegions on jsVectorMap prototype if missing
if (typeof jsVectorMap !== 'undefined' && !jsVectorMap.prototype.setSelectedRegions) {
    jsVectorMap.prototype.setSelectedRegions = function(regions) {
        if (typeof this.clearSelectedRegions === 'function') {
            this.clearSelectedRegions();
        }
        if (typeof this._setSelected === 'function') {
            this._setSelected('regions', regions || []);
        }
    };
}

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

function normalizeMapCode(code) {
    if (!code) return '';
    let c = code.toUpperCase();
    if (c === 'XK') return '_1';
    return c;
}

function getValidMapCountries() {
    const mapPaths = window.jsVectorMap?.maps?.world?.paths || window.jsVectorMapHiresData?.paths || {};
    return countries.filter(c => {
        const code = normalizeMapCode(c.code);
        return !!mapPaths[code];
    });
}

// DOM Elements
const scoreEl = document.getElementById('score');
const countEl = document.getElementById('count');
const gameApp = document.getElementById('game-app');
const gameContainer = document.getElementById('game-container');
const gameOverSection = document.getElementById('game-over');
const finalScoreVal = document.getElementById('final-score-value');
const statsBreakdown = document.getElementById('stats-breakdown');
const finalMessage = document.getElementById('final-message');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const flashOverlay = document.getElementById('flash-overlay');

// Locate Mode Specific Elements
const locateTargetCard = document.getElementById('locate-target-card');
const targetFlagImg = document.getElementById('target-flag-img');
const targetContinentBadge = document.getElementById('target-continent');
const targetCountryNameEl = document.getElementById('target-country-name');
const targetInstructionEl = document.getElementById('target-instruction');
const locateFeedback = document.getElementById('locate-feedback');

// Guess Mode Elements
const continentHint = document.getElementById('continent-hint');
const optionsContainer = document.getElementById('options-container');

// Floating Map Zoom Buttons
const ctrlZoomIn = document.getElementById('ctrl-zoomin');
const ctrlZoomOut = document.getElementById('ctrl-zoomout');
const ctrlReset = document.getElementById('ctrl-reset');

function getCountryDisplayName(code) {
    if (!code) return '';
    let codeUpper = code.toUpperCase();
    if (codeUpper === '_1') codeUpper = 'XK';
    const fromList = countries.find(c => c.code.toUpperCase() === codeUpper);
    if (fromList) {
        return I18N.tCountry(fromList.code, fromList.name);
    }
    const mapData = window.jsVectorMap?.maps?.world;
    if (mapData && mapData.paths && mapData.paths[codeUpper]) {
        return I18N.tCountry(code.toLowerCase(), mapData.paths[codeUpper].name);
    }
    return codeUpper;
}

function updateUIStrings() {
    const scoreLabel = document.getElementById('score-label');
    const countLabel = document.getElementById('count-label');
    const gameTitle = document.getElementById('game-title');
    const gameOverTitle = document.getElementById('game-over-title');
    const finalScoreLabel = document.getElementById('final-score-label');

    if (scoreLabel) scoreLabel.textContent = I18N.t('score');
    if (countLabel) countLabel.textContent = I18N.t('progress');
    if (finalScoreLabel) finalScoreLabel.textContent = I18N.t('finalScore');
    if (gameOverTitle) gameOverTitle.textContent = I18N.t('gameOver');
    if (restartBtn) restartBtn.textContent = I18N.t('backToMenu');
    if (playAgainBtn) playAgainBtn.textContent = I18N.t('playAgain');
    if (backToMenuBtn) backToMenuBtn.textContent = I18N.t('backToMenu');
    if (targetInstructionEl) targetInstructionEl.textContent = I18N.t('locateInstruction');

    if (gameTitle) {
        gameTitle.textContent = activeMode === 'locate'
            ? I18N.t('headerLocate')
            : I18N.t('headerMaps');
    }

    if (currentQuestion && !isAnswered) {
        if (activeMode === 'locate') {
            targetContinentBadge.textContent = I18N.tContinent(currentQuestion.correct.continent);
            targetCountryNameEl.textContent = I18N.tCountry(currentQuestion.correct.code, currentQuestion.correct.name);
        } else {
            continentHint.textContent = I18N.tContinent(currentQuestion.correct.continent);
            optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
                const cCode = btn.dataset.code;
                const country = currentQuestion.options.find(c => c.code === cCode);
                if (country) {
                    const span = btn.querySelector('span');
                    if (span) {
                        span.textContent = I18N.tCountry(country.code, country.name);
                    }
                }
            });
        }
    }

    if (!gameOverSection.classList.contains('hidden')) {
        renderStatsBreakdown();
    }
}

let currentZoomAnimId = null;

function cancelCurrentZoom() {
    if (currentZoomAnimId) {
        cancelAnimationFrame(currentZoomAnimId);
        currentZoomAnimId = null;
    }
}

// Ease out cubic function for smooth, luxurious deceleration
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Reset Map Zoom to Full View smoothly
function resetMapView(animate = true) {
    if (!map) return;
    cancelCurrentZoom();

    const baseScale = map._baseScale || 1;
    const baseTransX = typeof map._baseTransX !== 'undefined' ? map._baseTransX : 0;
    const baseTransY = typeof map._baseTransY !== 'undefined' ? map._baseTransY : 0;

    if (!animate) {
        map.scale = baseScale;
        map.transX = baseTransX;
        map.transY = baseTransY;
        map._applyTransform();
        applyNonScalingBorders();
        return;
    }

    const startScale = map.scale || baseScale;
    const startTransX = map.transX || baseTransX;
    const startTransY = map.transY || baseTransY;

    // Linear screen pixel coordinates eliminate any parabolic sideways sway
    const pixelXStart = startTransX * startScale;
    const pixelYStart = startTransY * startScale;
    const pixelXEnd = baseTransX * baseScale;
    const pixelYEnd = baseTransY * baseScale;

    const startTime = performance.now();
    const duration = 650;

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = easeOutCubic(progress);

        const currentScale = startScale + (baseScale - startScale) * ease;
        const currentPixelX = pixelXStart + (pixelXEnd - pixelXStart) * ease;
        const currentPixelY = pixelYStart + (pixelYEnd - pixelYStart) * ease;

        map.scale = currentScale;
        map.transX = currentPixelX / currentScale;
        map.transY = currentPixelY / currentScale;

        map.canvas.applyTransformParams(map.scale, map.transX, map.transY);
        applyNonScalingBorders();

        if (progress < 1) {
            currentZoomAnimId = requestAnimationFrame(step);
        } else {
            currentZoomAnimId = null;
            if (typeof map._applyTransform === 'function') {
                map._applyTransform();
            }
        }
    }

    currentZoomAnimId = requestAnimationFrame(step);
}

// Calculate clamped translation to keep country centered with comfortable boundary margins
function getClampedTranslation(targetScale, anchorX, anchorY) {
    const curW = map._width || 800;
    const curH = map._height || 450;
    const defW = map._defaultWidth || 900;
    const defH = map._defaultHeight || 440.7;

    // Direct mathematical center for target coordinates
    let transX = anchorX + curW / (2 * targetScale);
    let transY = anchorY + curH / (2 * targetScale);

    // Generous boundary margins allowing countries near the map edges (like USA, Alaska, Russia, New Zealand)
    // to be placed dead-center in the screen rather than being clamped against borders
    const padX = curW / (2 * targetScale);
    const padY = curH / (2 * targetScale);

    const maxTransX = padX;
    const minTransX = (curW - defW * targetScale) / targetScale - padX;

    const maxTransY = padY;
    const minTransY = (curH - defH * targetScale) / targetScale - padY;

    if (transX > maxTransX) transX = maxTransX;
    else if (transX < minTransX) transX = minTransX;

    if (transY > maxTransY) transY = maxTransY;
    else if (transY < minTransY) transY = minTransY;

    return { transX, transY };
}

// Extract mainland center and size for optimal country camera framing
function getCountryFocusGeometry(code) {
    if (!code) return null;
    const codeUpper = normalizeMapCode(code);

    // First try extracting mainland (largest subpath) from path definition
    const mapPaths = window.jsVectorMapHiresData?.paths 
                  || window.jsVectorMap?.maps?.world?.paths;
    const rawPath = mapPaths?.[codeUpper]?.path;

    if (rawPath) {
        const subpaths = rawPath.split(/(?=[Mm])/);
        let bestSub = rawPath;
        let maxLen = 0;
        subpaths.forEach(s => {
            if (s.length > maxLen) {
                maxLen = s.length;
                bestSub = s;
            }
        });

        const matches = bestSub.match(/-?[\d\.]+/g);
        if (matches && matches.length >= 4) {
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            for (let i = 0; i < matches.length; i += 2) {
                const x = parseFloat(matches[i]);
                const y = parseFloat(matches[i + 1]);
                if (!isNaN(x) && !isNaN(y)) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
            if (minX !== Infinity && maxX > minX && maxY > minY) {
                const width = maxX - minX;
                const height = maxY - minY;
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                return {
                    anchorX: -centerX,
                    anchorY: -centerY,
                    width,
                    height
                };
            }
        }
    }

    // Fallback: standard getBBox from shape
    const region = map?.regions?.[codeUpper];
    try {
        const bbox = region?.element?.shape?.getBBox();
        if (bbox && bbox.width && bbox.height) {
            return {
                anchorX: -(bbox.x + bbox.width / 2),
                anchorY: -(bbox.y + bbox.height / 2),
                width: bbox.width,
                height: bbox.height
            };
        }
    } catch (e) {}

    return null;
}

// Smooth, direct zoom towards the country ("zoom suavemente") without any sideways deviation
function smoothFocusCountry(code, duration = 900, zoomMultiplier = 1.0) {
    if (!map || !map.regions) return;
    const geom = getCountryFocusGeometry(code);
    if (!geom) return;

    cancelCurrentZoom();

    const baseScale = map._baseScale || 1;
    const viewportMinDim = Math.min(map._width || 600, map._height || 400);
    const maxDim = Math.max(geom.width, geom.height);

    // Calculate optimal scale so that country fills prominently
    // For large countries like USA, Russia, Canada, Brazil, allow comfortable framing
    const idealScale = ((viewportMinDim * 0.46) / Math.max(maxDim, 16)) * zoomMultiplier;
    const minScale = baseScale * 1.5 * zoomMultiplier;
    const maxScale = Math.min(baseScale * 8.5 * zoomMultiplier, (map.params?.zoomMax || 50));
    const targetScale = Math.min(Math.max(idealScale, minScale), maxScale);

    const startScale = map.scale || baseScale;
    const startTransX = map.transX || 0;
    const startTransY = map.transY || 0;

    // Target translation centered on mainland anchor with boundary clamping
    const clamped = getClampedTranslation(targetScale, geom.anchorX, geom.anchorY);
    const endTransX = clamped.transX;
    const endTransY = clamped.transY;

    // Interpolating physical screen pixel coordinates (trans * scale) guarantees
    // the target point travels in a 100% straight, calm path straight to center screen
    const pixelXStart = startTransX * startScale;
    const pixelYStart = startTransY * startScale;
    const pixelXEnd = endTransX * targetScale;
    const pixelYEnd = endTransY * targetScale;

    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = easeOutCubic(progress);

        const currentScale = startScale + (targetScale - startScale) * ease;
        const currentPixelX = pixelXStart + (pixelXEnd - pixelXStart) * ease;
        const currentPixelY = pixelYStart + (pixelYEnd - pixelYStart) * ease;

        map.scale = currentScale;
        map.transX = currentPixelX / currentScale;
        map.transY = currentPixelY / currentScale;

        map.canvas.applyTransformParams(map.scale, map.transX, map.transY);
        applyNonScalingBorders();

        if (progress < 1) {
            currentZoomAnimId = requestAnimationFrame(step);
        } else {
            currentZoomAnimId = null;
            if (typeof map._applyTransform === 'function') {
                map._applyTransform();
            }
        }
    }

    currentZoomAnimId = requestAnimationFrame(step);
}

// Alias for backwards compatibility
const gentleFocusCountry = smoothFocusCountry;

// Helper to get native SVG path DOM element for any country code
function getRegionPathNode(code) {
    if (!code) return null;
    const codeUpper = normalizeMapCode(code);

    // 1. Direct query in DOM by data-code attribute
    const directQuery = document.querySelector(`#map-container path[data-code="${codeUpper}"], #map-container [data-code="${codeUpper}"]`);
    if (directQuery) return directQuery;

    // 2. Query through jsVectorMap instance structure
    if (map && map.regions && map.regions[codeUpper]) {
        const reg = map.regions[codeUpper];
        if (reg.element?.shape?.node) return reg.element.shape.node;
        if (reg.element?.node) return reg.element.node;
    }
    return null;
}

// Color specific region as correct (green #22c55e), wrong (red #ef4444), or target (#dcfe4b fluorescent yellow)
function highlightRegion(code, status) {
    if (!code) return;
    const codeUpper = normalizeMapCode(code);
    const region = map?.regions?.[codeUpper];
    const node = getRegionPathNode(codeUpper);

    // Exact color palette matching "Identificar en el Mapa"
    let color = '#22c55e'; // Green for correct
    let strokeColor = '#14532d';
    if (status === 'wrong') {
        color = '#ef4444'; // Red for wrong clicked country
        strokeColor = '#7f1d1d';
    } else if (status === 'target') {
        color = '#dcfe4b'; // Strong fluorescent Yellow identical to "Identificar en el Mapa"
        strokeColor = 'rgba(20, 20, 20, 0.95)';
    }

    // 1. Native jsVectorMap selection for target
    if (status === 'target') {
        try {
            if (region?.element) {
                region.element.select(true);
            } else if (map && typeof map.setSelectedRegions === 'function') {
                map.setSelectedRegions([codeUpper]);
            }
        } catch (e) {}
    }

    // 2. Update jsVectorMap internal shape style
    if (region?.element) {
        try {
            if (region.element.shape) {
                region.element.shape.style = region.element.shape.style || {};
                region.element.shape.style.current = region.element.shape.style.current || {};
                region.element.shape.style.current.fill = color;
                region.element.shape.style.current.fillOpacity = 1;
                region.element.shape.style.current.stroke = strokeColor;
                region.element.shape.style.current.strokeWidth = 0.85;
                if (typeof region.element.shape.updateStyle === 'function') {
                    region.element.shape.updateStyle();
                }
            }
            if (typeof region.element.setStyle === 'function') {
                region.element.setStyle({
                    fill: color,
                    fillOpacity: 1,
                    stroke: strokeColor,
                    strokeWidth: 0.85
                });
            }
        } catch (e) {}
    }

    // 3. Set inline styles with !important, classes, and attributes on native SVG node
    if (node) {
        node.style.setProperty('fill', color, 'important');
        node.style.setProperty('fill-opacity', '1', 'important');
        node.style.setProperty('stroke', strokeColor, 'important');
        node.style.setProperty('stroke-width', '0.85px', 'important');
        node.setAttribute('fill', color);
        node.setAttribute('data-status', status);

        node.classList.remove('map-region-correct', 'map-region-wrong', 'map-region-target');
        node.classList.add(`map-region-${status}`);
    }
}

// Clear temporary colors on all regions
function clearRegionColors() {
    if (!map) return;
    try {
        if (typeof map.clearSelectedRegions === 'function') {
            map.clearSelectedRegions();
        }

        // 1. Clear styled paths directly in DOM
        const styledNodes = document.querySelectorAll('#map-container [data-status], #map-container .map-region-correct, #map-container .map-region-wrong, #map-container .map-region-target');
        styledNodes.forEach(node => {
            node.style.removeProperty('fill');
            node.style.removeProperty('fill-opacity');
            node.style.removeProperty('stroke');
            node.style.removeProperty('stroke-width');
            node.removeAttribute('data-status');
            node.setAttribute('fill', '#a87932');
            node.classList.remove('map-region-correct', 'map-region-wrong', 'map-region-target');
        });

        // 2. Reset jsVectorMap internal shape styles
        if (map.regions) {
            for (const code in map.regions) {
                const reg = map.regions[code];
                if (reg?.element?.shape) {
                    try {
                        reg.element.shape.isSelected = false;
                        if (reg.element.shape.style?.current) {
                            delete reg.element.shape.style.current.fill;
                            delete reg.element.shape.style.current.fillOpacity;
                            delete reg.element.shape.style.current.stroke;
                            delete reg.element.shape.style.current.strokeWidth;
                        }
                        if (reg.element.shape.node) {
                            reg.element.shape.node.style.removeProperty('fill');
                            reg.element.shape.node.style.removeProperty('fill-opacity');
                            reg.element.shape.node.style.removeProperty('stroke');
                            reg.element.shape.node.style.removeProperty('stroke-width');
                            reg.element.shape.node.removeAttribute('data-status');
                            reg.element.shape.node.setAttribute('fill', '#a87932');
                            reg.element.shape.node.classList.remove('map-region-correct', 'map-region-wrong', 'map-region-target');
                        }
                        if (typeof reg.element.shape.updateStyle === 'function') {
                            reg.element.shape.updateStyle();
                        }
                    } catch (e) {}
                }
            }
        }
    } catch (e) {
        console.error("Clear region colors error:", e);
    }
}

function showFeedback(type, message) {
    locateFeedback.className = `locate-feedback feedback-${type}`;
    locateFeedback.textContent = message;
    locateFeedback.classList.remove('hidden');
}

function hideFeedback() {
    locateFeedback.classList.add('hidden');
    locateFeedback.textContent = '';
}

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
            const contPercent = Math.round((data.correct / data.total) * 100);
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
    clearLocateTimers();
    gameApp.classList.remove('map-locked');
    gameContainer.classList.add('hidden');
    backToMenuBtn.classList.add('hidden');
    gameOverSection.classList.remove('hidden');

    const percentage = Math.round((currentScore / TOTAL_QUESTIONS) * 100);
    finalScoreVal.textContent = `${percentage}%`;
    if (finalMessage) finalMessage.textContent = '';

    renderStatsBreakdown();
    SoundManager.playWin();
}

function switchMode(newMode) {
    activeMode = newMode;

    if (activeMode === 'locate') {
        gameApp.classList.add('locate-mode');
        locateTargetCard.classList.remove('hidden');
        continentHint.classList.add('hidden');
        optionsContainer.classList.add('hidden');
    } else {
        gameApp.classList.remove('locate-mode');
        locateTargetCard.classList.add('hidden');
        hideFeedback();
        continentHint.classList.remove('hidden');
        optionsContainer.classList.remove('hidden');
    }

    startNewGame();
}

function startNewGame() {
    clearLocateTimers();
    gameApp.classList.remove('map-locked');
    const validCountries = getValidMapCountries();
    const sourceList = validCountries.length >= TOTAL_QUESTIONS ? validCountries : countries;
    const shuffled = [...sourceList].sort(() => 0.5 - Math.random());
    remainingCountries = shuffled.slice(0, TOTAL_QUESTIONS);
    currentScore = 0;

    continentStats = {};
    remainingCountries.forEach(c => {
        if (!continentStats[c.continent]) {
            continentStats[c.continent] = { correct: 0, total: 0 };
        }
    });

    clearRegionColors();
    hideFeedback();
    resetMapView(false);

    updateScoreUI();
    updateUIStrings();

    gameContainer.classList.remove('hidden');
    gameOverSection.classList.add('hidden');
    backToMenuBtn.classList.remove('hidden');

    generateQuestion();
}

function generateQuestion() {
    if (remainingCountries.length === 0) {
        endGame();
        return;
    }

    isAnswered = false;
    clearRegionColors();
    hideFeedback();

    const randomIndex = Math.floor(Math.random() * remainingCountries.length);
    const correctCountry = remainingCountries[randomIndex];

    continentStats[correctCountry.continent].total++;
    remainingCountries.splice(randomIndex, 1);
    updateScoreUI();

    let flagCode = correctCountry.code.toLowerCase();
    if (flagCode === '_1') flagCode = 'xk';

    if (activeMode === 'locate') {
        currentQuestion = {
            correct: correctCountry
        };

        targetContinentBadge.textContent = I18N.tContinent(correctCountry.continent);
        targetCountryNameEl.textContent = I18N.tCountry(correctCountry.code, correctCountry.name);
        targetFlagImg.src = `https://flagcdn.com/w160/${flagCode}.png`;
        targetFlagImg.alt = I18N.tCountry(correctCountry.code, correctCountry.name);

        resetMapView(true);
        applyNonScalingBorders();
    } else {
        // Guess mode: multiple choice
        const sameContinent = countries.filter(c =>
            c.continent === correctCountry.continent && c.code !== correctCountry.code
        );

        const shuffledDistractors = sameContinent.sort(() => 0.5 - Math.random());
        let distractors = shuffledDistractors.slice(0, 5);

        if (distractors.length < 5) {
            const others = countries.filter(c =>
                c.code !== correctCountry.code && !distractors.some(d => d.code === c.code)
            ).sort(() => 0.5 - Math.random());
            distractors = distractors.concat(others.slice(0, 5 - distractors.length));
        }

        const options = [correctCountry, ...distractors].sort(() => 0.5 - Math.random());

        currentQuestion = {
            correct: correctCountry,
            options: options
        };

        if (map) {
            try {
                const countryCode = normalizeMapCode(correctCountry.code);
                map.setSelectedRegions([countryCode]);
                highlightRegion(countryCode, 'target');
                smoothFocusCountry(countryCode, 950);
                applyNonScalingBorders();
            } catch (e) {
                console.error("Map focus error:", e);
            }
        }

        continentHint.textContent = I18N.tContinent(correctCountry.continent);
        optionsContainer.innerHTML = '';

        options.forEach(country => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';

            let optFlag = country.code.toLowerCase();
            if (optFlag === '_1') optFlag = 'xk';

            btn.innerHTML = `
                <img src="https://flagcdn.com/w40/${optFlag}.png" class="option-flag" alt="">
                <span>${I18N.tCountry(country.code, country.name)}</span>
            `;

            btn.dataset.code = country.code;
            btn.addEventListener('click', () => handleGuessAnswer(country, btn));
            optionsContainer.appendChild(btn);
        });
    }
}

let locateAnswerTimers = [];
function clearLocateTimers() {
    locateAnswerTimers.forEach(id => clearTimeout(id));
    locateAnswerTimers = [];
}

// Locate mode answer handler (clicking region on the map)
function handleLocateAnswer(clickedCode) {
    if (isAnswered || !currentQuestion) return;
    isAnswered = true;
    clearLocateTimers();

    // Lock map interactions while showing feedback
    gameApp.classList.add('map-locked');

    const correctCode = normalizeMapCode(currentQuestion.correct.code);
    const clickedUpper = normalizeMapCode(clickedCode);
    const continent = currentQuestion.correct.continent;

    if (clickedUpper === correctCode) {
        currentScore++;
        continentStats[continent].correct++;
        SoundManager.playWin();
        triggerFlash('correct');
        highlightRegion(clickedUpper, 'correct'); // Green on correct country!
        showFeedback('correct', I18N.t('feedbackCorrect'));
        scoreEl.parentElement.classList.add('pulse');
        setTimeout(() => scoreEl.parentElement.classList.remove('pulse'), 500);

        // Slow, gradual zoom towards the correct country ("zoom despacio")
        smoothFocusCountry(correctCode, 950);

        updateScoreUI();
        const tNext = setTimeout(() => {
            gameApp.classList.remove('map-locked');
            generateQuestion();
        }, 1900);
        locateAnswerTimers.push(tNext);
    } else {
        // 1. Error inmediato: sonido de error, flash rojo y el país errado en ROJO
        SoundManager.playLose(); // Error sound buzzer!
        triggerFlash('wrong');
        highlightRegion(clickedUpper, 'wrong'); // Red on clicked country!

        const clickedName = getCountryDisplayName(clickedUpper);
        const correctName = I18N.tCountry(currentQuestion.correct.code, currentQuestion.correct.name);
        const feedbackMsg = I18N.t('feedbackWrong')
            .replace('{clicked}', clickedName)
            .replace('{correct}', correctName);
        showFeedback('wrong', feedbackMsg);

        updateScoreUI();

        // 2. Primero aparece el error en rojo; luego (a los 750ms), se muestra el correcto en VERDE
        //    y viaja despacio hacia el país correcto suavemente y haciendo más zoom (zoomMultiplier: 1.55, duración: 1500ms)
        const tReveal = setTimeout(() => {
            highlightRegion(correctCode, 'correct'); // Verde en el país correcto!
            smoothFocusCountry(correctCode, 1500, 1.55); // Despacio, suavemente y con más zoom
        }, 750);
        locateAnswerTimers.push(tReveal);

        // 3. Tiempo prudencial para contemplar la respuesta correcta ampliada antes de la siguiente pregunta
        const tNext = setTimeout(() => {
            gameApp.classList.remove('map-locked');
            generateQuestion();
        }, 3800);
        locateAnswerTimers.push(tNext);
    }
}

// Guess mode answer handler (clicking multiple choice buttons)
function handleGuessAnswer(selectedCountry, btnElement) {
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

// Setup floating zoom buttons (+, -, reset)
function setupCustomZoomControls() {
    if (ctrlZoomIn) {
        ctrlZoomIn.onclick = (e) => {
            e.stopPropagation();
            if (!map) return;
            cancelCurrentZoom();
            map._setScale(map.scale * map.params.zoomStep, map._width / 2, map._height / 2, false, map.params.zoomAnimate);
            applyNonScalingBorders();
        };
    }

    if (ctrlZoomOut) {
        ctrlZoomOut.onclick = (e) => {
            e.stopPropagation();
            if (!map) return;
            cancelCurrentZoom();
            map._setScale(map.scale / map.params.zoomStep, map._width / 2, map._height / 2, false, map.params.zoomAnimate);
            applyNonScalingBorders();
        };
    }

    if (ctrlReset) {
        ctrlReset.onclick = (e) => {
            e.stopPropagation();
            cancelCurrentZoom();
            resetMapView(true);
            applyNonScalingBorders();
        };
    }
}

// Initialize Application
function init() {
    try {
        map = new jsVectorMap(MAP_CONFIG);

        // Patch _applyTransform to allow centering and panning near map boundaries
        if (map && typeof map._applyTransform === 'function') {
            map._applyTransform = function() {
                const curW = this._width || 800;
                const curH = this._height || 450;
                const defW = this._defaultWidth || 900;
                const defH = this._defaultHeight || 440.7;

                const padX = curW / (2 * this.scale);
                const padY = curH / (2 * this.scale);

                const maxTransX = padX;
                const minTransX = (curW - defW * this.scale) / this.scale - padX;

                const maxTransY = padY;
                const minTransY = (curH - defH * this.scale) / this.scale - padY;

                if (this.transX > maxTransX) this.transX = maxTransX;
                else if (this.transX < minTransX) this.transX = minTransX;

                if (this.transY > maxTransY) this.transY = maxTransY;
                else if (this.transY < minTransY) this.transY = minTransY;

                this.canvas.applyTransformParams(this.scale, this.transX, this.transY);
                if (this._markers) this._repositionMarkers();
                if (this._lines) this._repositionLines();
                if (typeof this._repositionLabels === 'function') this._repositionLabels();
                applyNonScalingBorders();
            };
        }

        applyNonScalingBorders();
    } catch (e) {
        console.error("Map initialization failed", e);
    }

    setupCustomZoomControls();

    // Determine initial mode from URL param (?mode=locate or ?mode=guess)
    const urlParams = new URLSearchParams(window.location.search);
    const paramMode = urlParams.get('mode');
    const initialMode = (paramMode === 'guess') ? 'guess' : 'locate';

    // Navigation and game reset actions
    const goToMenu = () => window.location.href = '../index.html';
    restartBtn.onclick = goToMenu;
    backToMenuBtn.onclick = goToMenu;
    playAgainBtn.onclick = () => startNewGame();

    I18N.onLanguageChange(updateUIStrings);

    switchMode(initialMode);
}

window.onload = () => {
    init();
};
