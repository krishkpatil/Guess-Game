/* ---------------- World Flag Challenge main logic ---------------- */
// ----- Config -----
const COUNTRIES = [
  { name: "France", iso: "fr", center: [46.2276, 2.2137] },
  { name: "Japan", iso: "jp", center: [36.2048, 138.2529] },
  { name: "Brazil", iso: "br", center: [-14.235, -51.9253] },
  { name: "India", iso: "in", center: [20.5937, 78.9629] },
  { name: "Canada", iso: "ca", center: [56.1304, -106.3468] },
  { name: "Australia", iso: "au", center: [-25.2744, 133.7751] },
  { name: "South Africa", iso: "za", center: [-30.5595, 22.9375] },
  { name: "Germany", iso: "de", center: [51.1657, 10.4515] },
  { name: "Mexico", iso: "mx", center: [23.6345, -102.5528] },
  { name: "Italy", iso: "it", center: [41.8719, 12.5674] },
  { name: "United Kingdom", iso: "gb", center: [55.3781, -3.436] },
  { name: "United States", iso: "us", center: [37.0902, -95.7129] },
  { name: "Russia", iso: "ru", center: [61.5240, 105.3188] },
  { name: "China", iso: "cn", center: [35.8617, 104.1954] },
  { name: "Spain", iso: "es", center: [40.4637, -3.7492] },
  { name: "Argentina", iso: "ar", center: [-38.4161, -63.6167] },
  { name: "Sweden", iso: "se", center: [60.1282, 18.6435] },
  { name: "Switzerland", iso: "ch", center: [46.8182, 8.2275] },
  { name: "Egypt", iso: "eg", center: [26.8206, 30.8025] },
  { name: "Turkey", iso: "tr", center: [38.9637, 35.2433] },
  { name: "Thailand", iso: "th", center: [15.87, 100.9925] },
  { name: "New Zealand", iso: "nz", center: [-40.9006, 174.8860] },
  { name: "Netherlands", iso: "nl", center: [52.1326, 5.2913] },
  { name: "Norway", iso: "no", center: [60.4720, 8.4689] },
  { name: "Greece", iso: "gr", center: [39.0742, 21.8243] },
  { name: "South Korea", iso: "kr", center: [35.9078, 127.7669] },
  { name: "Indonesia", iso: "id", center: [-0.7893, 113.9213] },
  { name: "Saudi Arabia", iso: "sa", center: [23.8859, 45.0792] },
  { name: "Nigeria", iso: "ng", center: [9.081999, 8.675277] },
  { name: "Kenya", iso: "ke", center: [-0.0236, 37.9062] },
  { name: "Portugal", iso: "pt", center: [39.3999, -8.2245] },
  { name: "Poland", iso: "pl", center: [51.9194, 19.1451] },
  { name: "Belgium", iso: "be", center: [50.5039, 4.4699] },
  { name: "Chile", iso: "cl", center: [-35.6751, -71.5430] },
  { name: "Colombia", iso: "co", center: [4.5709, -74.2973] },
  { name: "Peru", iso: "pe", center: [-9.189967, -75.015152] },
  { name: "Iran", iso: "ir", center: [32.4279, 53.6880] },
  { name: "Iraq", iso: "iq", center: [33.2232, 43.6793] },
  { name: "Vietnam", iso: "vn", center: [14.0583, 108.2772] },
  { name: "Malaysia", iso: "my", center: [4.2105, 101.9758] }
];
const FLAG_CDN = iso => `https://flagcdn.com/w320/${iso}.png`;
const POINTS_TABLE = [
  { maxTime: 5, points: 500 },
  { maxTime: 10, points: 400 },
  { maxTime: 15, points: 300 },
  { maxTime: 20, points: 200 },
  { maxTime: Infinity, points: 100 }
];

// ----- Game State -----
let map, geojsonLayer;
let targetCountry = null;
let selectedCountry = null;
let selectedLayer = null;
let score = 0;
let timerInterval, startTime;
let roundHistory = [];
let isRoundActive = false;
let loadingMap = true;

// ----- DOM -----
const el = id => document.getElementById(id);
const flagImg = el("flag-img");
const flagPlaceholder = el("flag-placeholder");
const selectedCountryEl = el("selected-country");
const startBtn = el("start-btn");
const submitBtn = el("submit-btn");
const timerEl = el("timer");
const scoreEl = el("score");
const scoreHistory = el("score-history");
const toast = el("toast");
const toastMessage = el("toast-message");
const feedbackModal = el("feedback-modal");
const feedbackIcon = el("feedback-icon");
const modalTitle = el("modal-title");
const modalMessage = el("modal-message");
const modalPoints = el("modal-points");
const modalTime = el("modal-time");
const continueBtn = el("continue-btn");
const loader = el("loader");
const confettiCanvas = el("confetti-canvas");
const playerNameEl = el("player-name");
const resetBtn = el("reset-btn");
const nameModal = el("name-modal");
const nameInput = el("name-input");
const saveNameBtn = el("save-name-btn");
const cancelNameBtn = el("cancel-name-btn");
const confirmModal = el("confirm-modal");
const confirmResetBtn = el("confirm-reset-btn");
const cancelResetBtn = el("cancel-reset-btn");

confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;
window.addEventListener("resize", () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

// ----- Init Map -----
map = L.map("map", {
  worldCopyJump: true,
  minZoom: 2,
  maxBounds: [ [-90, -180], [90, 180] ],
  maxBoundsViscosity: 1.0,
  zoomControl: false
}).setView([20, 0], 2);

L.control.zoom({ position: "bottomright" }).addTo(map);
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution:
    "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>",
  subdomains: "abcd",
  maxZoom: 19
}).addTo(map);

fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
  .then(r => r.json())
  .then(worldData => {
    geojsonLayer = L.geoJSON(worldData, {
      style: () => ({ color: "#3b82f6", weight: 1, fillOpacity: 0.1, fillColor: "#93c5fd" }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
        layer.on({
          mouseover: e => {
            if (!isRoundActive) return;
            const l = e.target;
            l.setStyle({ fillOpacity: 0.3, fillColor: "#60a5fa" });
            l.openPopup();
          },
          mouseout: e => {
            if (!isRoundActive || e.target === selectedLayer) return;
            geojsonLayer.resetStyle(e.target);
            e.target.closePopup();
          },
          click: e => {
            if (!isRoundActive) {
              showToast("Start a new round first!", "error");
              return;
            }
            handleCountryClick(feature, e.target);
          }
        });
      }
    }).addTo(map);
    loadingMap = false;
    loader.style.display = "none";
  })
  .catch(err => {
    console.error(err);
    showToast("Failed to load map data", "error");
    loader.style.display = "none";
  });

// ----- Event listeners -----
startBtn.addEventListener("click", startRound);
submitBtn.addEventListener("click", submitGuess);
continueBtn.addEventListener("click", () => {
  feedbackModal.style.display = "none";
  resetForNextRound();
});
playerNameEl.addEventListener("click", openNameModal);
resetBtn.addEventListener("click", openResetConfirmation);
saveNameBtn.addEventListener("click", saveName);
cancelNameBtn.addEventListener("click", () => (nameModal.style.display = "none"));
confirmResetBtn.addEventListener("click", resetGame);
cancelResetBtn.addEventListener("click", () => (confirmModal.style.display = "none"));
nameInput.addEventListener("keydown", e => e.key === "Enter" && saveName());

// ----- Core functions -----
function startRound() {
  resetRound();
  isRoundActive = true;
  targetCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  flagImg.src = FLAG_CDN(targetCountry.iso);
  flagImg.style.display = "block";
  flagPlaceholder.style.display = "none";
  startTime = performance.now();
  timerInterval = setInterval(updateTimer, 100);
  startBtn.textContent = "🔄 Skip";
  selectedCountryEl.textContent = "Select a country on the map";
}

function resetRound() {
  if (geojsonLayer) geojsonLayer.resetStyle();
  selectedCountry = null;
  selectedLayer = null;
  selectedCountryEl.textContent = "No country selected";
  submitBtn.disabled = true;
  clearInterval(timerInterval);
  timerEl.textContent = "0.0s";
}

function resetForNextRound() {
  targetCountry = null;
  isRoundActive = false;
  flagImg.style.display = "none";
  flagPlaceholder.style.display = "flex";
  startBtn.textContent = "🎮 New Round";
  selectedCountryEl.textContent = "No country selected";
  submitBtn.disabled = true;
}

function handleCountryClick(feature, layer) {
  if (!isRoundActive) return;
  if (selectedLayer) geojsonLayer.resetStyle(selectedLayer);
  layer.setStyle({ fillOpacity: 0.5, fillColor: "#3b82f6", weight: 2 });
  selectedCountry = feature.properties.name;
  selectedLayer = layer;
  selectedCountryEl.textContent = selectedCountry;
  submitBtn.disabled = false;
  const bounds = layer.getBounds();
  if (bounds && !map.getBounds().contains(bounds)) map.fitBounds(bounds);
}

function submitGuess() {
  if (!selectedCountry || !isRoundActive) return;
  clearInterval(timerInterval);
  const elapsed = (performance.now() - startTime) / 1000;
  const isCorrect = selectedCountry.toLowerCase() === targetCountry.name.toLowerCase();
  let points = 0;
  if (isCorrect) {
    points = POINTS_TABLE.find(p => elapsed <= p.maxTime).points;
    score += points;
    scoreEl.textContent = score;
    showFeedback(true, points, elapsed);
    triggerConfetti();
  } else {
    showFeedback(false, 0, elapsed);
  }
  addToHistory(targetCountry.name, isCorrect, points);
}

function showFeedback(success, points, elapsed) {
  feedbackIcon.className = `feedback-icon ${success ? "success" : "error"}`;
  feedbackIcon.textContent = success ? "✓" : "✗";
  modalTitle.textContent = success ? "Correct!" : "Incorrect!";
  modalMessage.textContent = success ? `Great job! You identified ${targetCountry.name}.` : `The correct answer was ${targetCountry.name}.`;
  modalPoints.textContent = `+${points}`;
  modalTime.textContent = `${elapsed.toFixed(1)}s`;
  feedbackModal.style.display = "flex";
}

function triggerConfetti() {
  const myConfetti = confetti.create(confettiCanvas, { resize: true });
  myConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

function updateTimer() {
  const elapsed = (performance.now() - startTime) / 1000;
  timerEl.textContent = `${elapsed.toFixed(1)}s`;
}

function showToast(message, type = "success") {
  toastMessage.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function addToHistory(country, correct, points) {
  roundHistory.unshift({ country, correct, points });
  if (roundHistory.length > 10) roundHistory.pop();
  updateHistoryUI();
}

function updateHistoryUI() {
  scoreHistory.innerHTML = "";
  if (!roundHistory.length) {
    scoreHistory.innerHTML = `<div class='score-item'><span class='score-country'>No rounds played</span><span class='score-points'>-</span></div>`;
    return;
  }
  roundHistory.forEach(item => {
    const div = document.createElement("div");
    div.className = "score-item";
    div.innerHTML = `<span class='score-country'>${item.country}</span><span class='score-points ${item.correct ? "correct" : "incorrect"}'>${item.correct ? `+${item.points}` : "0"}</span>`;
    scoreHistory.appendChild(div);
  });
}

function saveGameData() {
  localStorage.setItem("flagGameData", JSON.stringify({ score, roundHistory, playerName: playerNameEl.textContent }));
}

function loadGameData() {
  const data = localStorage.getItem("flagGameData");
  if (!data) return;
  try {
    const { score: s = 0, roundHistory: rh = [], playerName } = JSON.parse(data);
    score = s;
    roundHistory = rh;
    scoreEl.textContent = score;
    if (playerName && playerName !== "Guest") playerNameEl.textContent = playerName;
    updateHistoryUI();
  } catch (e) {
    console.error("Failed to parse saved data", e);
  }
}

// ----- Player name & reset -----
function openNameModal() {
  nameInput.value = playerNameEl.textContent === "Guest" ? "" : playerNameEl.textContent;
  nameModal.style.display = "flex";
  nameInput.focus();
}
function saveName() {
  const name = nameInput.value.trim();
  playerNameEl.textContent = name || "Guest";
  saveGameData();
  nameModal.style.display = "none";
  showToast(`Welcome, ${playerNameEl.textContent}!`, "success");
}
function openResetConfirmation() { confirmModal.style.display = "flex"; }
function resetGame() {
  score = 0;
  roundHistory = [];
  scoreEl.textContent = "0";
  updateHistoryUI();
  saveGameData();
  confirmModal.style.display = "none";
  showToast("Game progress reset", "success");
}

// ----- Responsive / shortcuts -----
function handleWindowResize() {
  map.setMinZoom(window.innerWidth < 768 ? 1 : 2);
}
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", e => {
    if (e.code === "Space" && !isRoundActive) { e.preventDefault(); startRound(); }
    if (e.code === "Enter" && isRoundActive && selectedCountry) { e.preventDefault(); submitGuess(); }
    if (e.code === "Escape" && isRoundActive) { e.preventDefault(); submitGuess(); }
  });
}

// ----- Init all once map is ready -----
(function initWhenReady() {
  const iv = setInterval(() => {
    if (!loadingMap && geojsonLayer) {
      clearInterval(iv);
      enhanceMapData();
      initGame();
    }
  }, 100);
})();

function enhanceMapData() {
  geojsonLayer.eachLayer(layer => {
    const countryName = layer.feature.properties.name;
    const match = COUNTRIES.find(c => c.name.toLowerCase() === countryName.toLowerCase());
    if (!match) return;
    layer.feature.properties.iso = match.iso;
    layer.bindPopup(`<div style='display:flex;align-items:center;gap:0.5rem'>` +
      `<img src='${FLAG_CDN(match.iso)}' style='width:30px;height:20px;object-fit:cover;border-radius:2px'/>` +
      `<strong>${countryName}</strong></div>`);
  });
}

function initGame() {
  loadGameData();
  initializePlayer();
  window.addEventListener("resize", handleWindowResize);
  handleWindowResize();
  setupKeyboardShortcuts();
  window.addEventListener("beforeunload", saveGameData);
  updateHistoryUI();
  setTimeout(() => showToast("Welcome to World Flag Challenge!", "success"), 1000);
}

function initializePlayer() {
  if (!localStorage.getItem("flagGamePlayerId")) {
    localStorage.setItem("flagGamePlayerId", "player_" + Date.now());
  }
}
