const destinations = [
  { id: "paris", name: "Paris", country: "França", code: "PAR / FR", lat: 48.8584, lon: 2.2945, image: "assets/paris.jpg", alt: "Torre Eiffel em Paris" },
  { id: "china", name: "Muralha da China", short: "China", country: "China", code: "PEK / CN", lat: 40.4319, lon: 116.5704, image: "assets/china.jpg", alt: "Grande Muralha da China" },
  { id: "coliseu", name: "Coliseu", short: "Roma", country: "Itália", code: "ROM / IT", lat: 41.8902, lon: 12.4922, image: "assets/coliseu.jpg", alt: "Coliseu em Roma" },
  { id: "dubai", name: "Dubai", country: "Emirados Árabes", code: "DXB / AE", lat: 25.2048, lon: 55.2708, image: "assets/dubai.jpg", alt: "Avenida e skyline de Dubai" },
  { id: "egito", name: "Pirâmides de Gizé", short: "Egito", country: "Egito", code: "CAI / EG", lat: 29.9792, lon: 31.1342, image: "assets/egito.jpg", alt: "Pirâmides de Gizé no Egito" },
  { id: "fuji", name: "Monte Fuji", short: "Fuji", country: "Japão", code: "FJI / JP", lat: 35.3606, lon: 138.7274, image: "assets/fuji.jpg", alt: "Monte Fuji no Japão" },
  { id: "hollywood", name: "Hollywood", country: "Estados Unidos", code: "LAX / US", lat: 34.1341, lon: -118.3215, image: "assets/hollywood.jpg", alt: "Letreiro de Hollywood em Los Angeles" },
  { id: "italia", name: "Torre de Pisa", short: "Pisa", country: "Itália", code: "PSA / IT", lat: 43.7229, lon: 10.3966, image: "assets/italia.jpg", alt: "Torre inclinada de Pisa" },
  { id: "jerusalem", name: "Jerusalém", country: "Israel", code: "JRS / IL", lat: 31.7683, lon: 35.2137, image: "assets/jerusalem.jpg", alt: "Cidade de Jerusalém" },
  { id: "lisboa", name: "Lisboa", country: "Portugal", code: "LIS / PT", lat: 38.7223, lon: -9.1393, image: "assets/lisboa.jpg", alt: "Praça do Comércio em Lisboa" },
  { id: "machu-picchu", name: "Machu Picchu", country: "Peru", code: "CUZ / PE", lat: -13.1631, lon: -72.545, image: "assets/machu-picchu.jpg", alt: "Ruínas de Machu Picchu" },
  { id: "madrid", name: "Madri", country: "Espanha", code: "MAD / ES", lat: 40.4168, lon: -3.7038, image: "assets/madrid.jpg", alt: "Palácio de Cibeles em Madri" },
  { id: "masp-sp", name: "MASP", country: "São Paulo, Brasil", code: "SAO / BR", lat: -23.5614, lon: -46.6559, image: "assets/masp-sp.jpg", alt: "Museu de Arte de São Paulo" },
  { id: "moscou", name: "Moscou", country: "Rússia", code: "MOW / RU", lat: 55.7558, lon: 37.6173, image: "assets/moscou.jpg", alt: "Catedral de São Basílio em Moscou" },
  { id: "nova-yorke", name: "Nova York", country: "Estados Unidos", code: "NYC / US", lat: 40.6892, lon: -74.0445, image: "assets/nova-yorke.jpg", alt: "Estátua da Liberdade em Nova York" },
  { id: "rio-de-janeiro", name: "Rio de Janeiro", short: "Rio", country: "Brasil", code: "RIO / BR", lat: -22.9519, lon: -43.2105, image: "assets/rio-de-janeiro.jpg", alt: "Cristo Redentor no Rio de Janeiro" },
  { id: "savana-africana", name: "Savana Africana", short: "Savana", country: "Quênia", code: "NBO / KE", lat: -1.2921, lon: 36.8219, image: "assets/savana-africana.jpg", alt: "Girafas em uma savana africana" }
];

const destinationPhrases = {
  "paris": "EM PARIS, ATÉ O CÉU PARECE POSAR.",
  "china": "ALGUNS CAMINHOS ATRAVESSAM SÉCULOS.",
  "coliseu": "ROMA TRANSFORMA PASSADO EM CENÁRIO.",
  "dubai": "ONDE A CIDADE DECIDIU TOCAR O CÉU.",
  "egito": "DIANTE DO TEMPO, TODO MUNDO FICA PEQUENO.",
  "fuji": "UM SEGUNDO DE SILÊNCIO ANTES DO CLIQUE.",
  "hollywood": "AQUI, TODO VISITANTE GANHA UM PAPEL.",
  "italia": "NEM TUDO PRECISA ESTAR RETO PARA SER INESQUECÍVEL.",
  "jerusalem": "CAMADAS DE HISTÓRIA EM CADA DIREÇÃO.",
  "lisboa": "A LUZ CHEGA PRIMEIRO EM LISBOA.",
  "machu-picchu": "UMA CIDADE ESCONDIDA ACIMA DAS NUVENS.",
  "madrid": "A CIDADE É UMA PRAÇA CHEIA DE ENCONTROS.",
  "masp-sp": "SÃO PAULO TAMBÉM PARA PARA VER ARTE.",
  "moscou": "COR, GEOMETRIA E UM POUCO DE ESPANTO.",
  "nova-yorke": "TODO MUNDO CHEGA COM UMA HISTÓRIA.",
  "rio-de-janeiro": "A PAISAGEM FAZ QUESTÃO DE PARTICIPAR.",
  "savana-africana": "NO HORIZONTE, NINGUÉM TEM PRESSA."
};

const $ = selector => document.querySelector(selector);
const elements = {
  viewport: $("#mapViewport"), canvas: $("#mapCanvas"), pins: $("#pinsLayer"), photo: $("#destinationPhoto"),
  flash: $("#photoFlash"), index: $("#photoIndex"), name: $("#destinationName"), country: $("#destinationCountry"),
  code: $("#destinationCode"), phrase: $("#ticketPhrase"), status: $("#mapStatus"), enter: $("#enterButton"), dialog: $("#boothDialog"),
  instructions: $("#phoneInstructions"), phoneTitle: $("#phoneTitle"), scene: $("#phoneScene"), background: $("#phoneBackground"),
  sceneTimer: $("#sceneTimer"), sceneProgress: $("#sceneProgress"), popup: $("#countdownPopup"), end: $("#phoneEnd"), closeButton: $("#closeBoothButton"), idleTip: $("#idleTip"), tipText: $("#tipText")
};

let selected = null;
let sceneInterval = null;
let sceneTimeout = null;
let idleTimeout = null;
let tipTimeout = null;
let tipIndex = 0;

function formatCoordinate(value, positive, negative) {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
}

function project(lat, lon) {
  const xTable = [1, .9986, .9954, .99, .9822, .973, .96, .9427, .9216, .8962, .8679, .835, .7986, .7597, .7186, .6732, .6213, .5722, .5322];
  const yTable = [0, .062, .124, .186, .248, .31, .372, .434, .4958, .5571, .6176, .6769, .7346, .7903, .8435, .8936, .9394, .9761, 1];
  const position = Math.min(18, Math.abs(lat) / 5);
  const index = Math.min(17, Math.floor(position));
  const fraction = position - index;
  const xFactor = xTable[index] + (xTable[index + 1] - xTable[index]) * fraction;
  const yFactor = yTable[index] + (yTable[index + 1] - yTable[index]) * fraction;
  const centralMeridian = 11;
  const projectedLongitude = lon - centralMeridian;
  const projectedX = projectedLongitude * xFactor * .8487;
  const projectedY = Math.sign(lat) * yFactor * 91.296;
  return { x: ((projectedX + 180) / 360) * 100, y: ((91.296 - projectedY) / 182.592) * 100 };
}

function createPins() {
  const fragment = document.createDocumentFragment();
  destinations.forEach(destination => {
    const point = project(destination.lat, destination.lon);
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "map-pin";
    pin.dataset.id = destination.id;
    pin.style.left = `${point.x}%`;
    pin.style.top = `${point.y}%`;
    pin.setAttribute("aria-label", `${destination.name}, ${destination.country}`);
    pin.innerHTML = `<span class="pin-label">${destination.short || destination.name}</span>`;
    pin.addEventListener("click", event => {
      event.stopPropagation();
      selectDestination(destination);
    });
    fragment.append(pin);
  });
  elements.pins.append(fragment);
}

function selectDestination(destination) {
  if (!destination || destination.id === selected?.id) return;
  selected = destination;
  const index = destinations.indexOf(destination);
  elements.photo.classList.add("is-changing");
  elements.flash.classList.remove("flash");
  void elements.flash.offsetWidth;
  elements.flash.classList.add("flash");
  const preload = new Image();
  preload.onload = () => {
    elements.photo.src = destination.image;
    elements.photo.alt = destination.alt;
    requestAnimationFrame(() => elements.photo.classList.remove("is-changing"));
  };
  preload.src = destination.image;
  elements.index.textContent = `${String(index + 1).padStart(2, "0")} / ${destinations.length}`;
  elements.name.textContent = destination.name.toUpperCase();
  elements.country.textContent = `${destination.country.toUpperCase()} · ${formatCoordinate(destination.lat, "N", "S")}, ${formatCoordinate(destination.lon, "L", "O")}`;
  elements.code.textContent = destination.code;
  elements.phrase.textContent = destinationPhrases[destination.id];
  elements.status.textContent = `${destination.name.toUpperCase()} · CENÁRIO SELECIONADO`;
  document.querySelectorAll(".map-pin").forEach(pin => pin.classList.toggle("is-active", pin.dataset.id === destination.id));
}

const mapController = (() => {
  const state = { x: 0, y: 0, scale: 1, pointers: new Map(), gesture: null };
  const minScale = 1;
  const maxScale = 4.5;

  function apply(animate = false) {
    elements.canvas.classList.toggle("is-flying", animate);
    elements.canvas.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
    elements.canvas.style.setProperty("--pin-scale", 1 / state.scale);
    clearTimeout(apply.timer);
    if (animate) apply.timer = setTimeout(() => elements.canvas.classList.remove("is-flying"), 700);
  }

  function clamp() {
    const viewW = elements.viewport.clientWidth;
    const viewH = elements.viewport.clientHeight;
    const left = elements.canvas.offsetLeft;
    const top = elements.canvas.offsetTop;
    const margin = 90;
    state.x = Math.min(margin - left, Math.max(viewW - left - elements.canvas.offsetWidth * state.scale - margin, state.x));
    state.y = Math.min(margin - top, Math.max(viewH - top - elements.canvas.offsetHeight * state.scale - margin, state.y));
  }

  function zoomAt(nextScale, clientX, clientY, animate = false) {
    nextScale = Math.min(maxScale, Math.max(minScale, nextScale));
    const rect = elements.viewport.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const baseX = elements.canvas.offsetLeft;
    const baseY = elements.canvas.offsetTop;
    const ratio = nextScale / state.scale;
    state.x = px - baseX - (px - baseX - state.x) * ratio;
    state.y = py - baseY - (py - baseY - state.y) * ratio;
    state.scale = nextScale;
    clamp();
    apply(animate);
  }

  function reset(animate = true) {
    state.x = 0; state.y = 0; state.scale = 1;
    apply(animate);
    elements.status.textContent = `${destinations.length} LUGARES PARA DESCOBRIR`;
  }

  function pointerDown(event) {
    if (event.target.closest("button")) return;
    elements.viewport.setPointerCapture(event.pointerId);
    state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (state.pointers.size === 1) state.gesture = { type: "drag", startX: event.clientX, startY: event.clientY, x: state.x, y: state.y };
    else if (state.pointers.size === 2) {
      const points = [...state.pointers.values()];
      state.gesture = { type: "pinch", distance: Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y), scale: state.scale, x: state.x, y: state.y, midX: (points[0].x + points[1].x) / 2, midY: (points[0].y + points[1].y) / 2 };
    }
  }

  function pointerMove(event) {
    if (!state.pointers.has(event.pointerId)) return;
    state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (state.pointers.size === 1 && state.gesture?.type === "drag") {
      state.x = state.gesture.x + event.clientX - state.gesture.startX;
      state.y = state.gesture.y + event.clientY - state.gesture.startY;
      clamp(); apply();
    } else if (state.pointers.size >= 2 && state.gesture?.type === "pinch") {
      const points = [...state.pointers.values()].slice(0, 2);
      const next = Math.min(maxScale, Math.max(minScale, state.gesture.scale * Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) / state.gesture.distance));
      const rect = elements.viewport.getBoundingClientRect();
      const px = state.gesture.midX - rect.left;
      const py = state.gesture.midY - rect.top;
      const baseX = elements.canvas.offsetLeft;
      const baseY = elements.canvas.offsetTop;
      const ratio = next / state.gesture.scale;
      state.x = px - baseX - (px - baseX - state.gesture.x) * ratio;
      state.y = py - baseY - (py - baseY - state.gesture.y) * ratio;
      state.scale = next;
      clamp(); apply();
    }
  }

  function pointerUp(event) {
    state.pointers.delete(event.pointerId);
    if (state.pointers.size === 1) {
      const point = [...state.pointers.values()][0];
      state.gesture = { type: "drag", startX: point.x, startY: point.y, x: state.x, y: state.y };
    } else if (!state.pointers.size) state.gesture = null;
  }

  elements.viewport.addEventListener("pointerdown", pointerDown);
  elements.viewport.addEventListener("pointermove", pointerMove);
  elements.viewport.addEventListener("pointerup", pointerUp);
  elements.viewport.addEventListener("pointercancel", pointerUp);
  elements.viewport.addEventListener("wheel", event => { event.preventDefault(); zoomAt(state.scale * Math.exp(-event.deltaY * .0015), event.clientX, event.clientY); }, { passive: false });
  elements.viewport.addEventListener("dblclick", event => zoomAt(state.scale * 1.55, event.clientX, event.clientY, true));
  $("#zoomInButton").addEventListener("click", () => { const rect = elements.viewport.getBoundingClientRect(); zoomAt(state.scale * 1.35, rect.left + rect.width / 2, rect.top + rect.height / 2, true); });
  $("#zoomOutButton").addEventListener("click", () => { const rect = elements.viewport.getBoundingClientRect(); zoomAt(state.scale / 1.35, rect.left + rect.width / 2, rect.top + rect.height / 2, true); });
  $("#resetMapButton").addEventListener("click", () => reset());
  window.addEventListener("resize", () => { clamp(); apply(); });
  apply();
  return { reset };
})();

function openExperience() {
  clearSceneTimers();
  elements.phoneTitle.textContent = `SELFIE EM ${selected.name.toUpperCase()}`;
  elements.background.src = selected.image;
  elements.background.alt = selected.alt;
  elements.instructions.hidden = false;
  elements.scene.hidden = true;
  elements.popup.hidden = true;
  elements.end.hidden = true;
  elements.closeButton.hidden = false;
  elements.dialog.showModal();
}

function clearSceneTimers() {
  clearInterval(sceneInterval);
  clearTimeout(sceneTimeout);
}

function startPhoneScene() {
  elements.instructions.hidden = true;
  elements.end.hidden = true;
  elements.scene.hidden = true;
  elements.popup.hidden = false;
  elements.closeButton.hidden = true;
  sceneTimeout = setTimeout(showPhoneScene, 2400);
}

function showPhoneScene() {
  elements.popup.hidden = true;
  elements.scene.hidden = false;
  let remaining = 10;
  elements.sceneTimer.textContent = remaining;
  elements.sceneProgress.style.transition = "none";
  elements.sceneProgress.style.transform = "scaleX(1)";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    elements.sceneProgress.style.transition = "transform 10s linear";
    elements.sceneProgress.style.transform = "scaleX(0)";
  }));
  sceneInterval = setInterval(() => {
    remaining -= 1;
    elements.sceneTimer.textContent = Math.max(0, remaining);
    if (remaining <= 0) finishPhoneScene();
  }, 1000);
}

function finishPhoneScene() {
  clearSceneTimers();
  elements.scene.hidden = true;
  elements.popup.hidden = true;
  elements.end.hidden = false;
  elements.closeButton.hidden = false;
}

function closeExperience() {
  clearSceneTimers();
  elements.dialog.close();
  scheduleIdleTip();
}

const tips = ["TOQUE EM UM PIN PARA ESCOLHER O CENÁRIO.", "A SELFIE É FEITA COM O SEU PRÓPRIO CELULAR.", "USE DOIS DEDOS PARA APROXIMAR O MAPA."];
function scheduleIdleTip() {
  clearTimeout(idleTimeout);
  clearTimeout(tipTimeout);
  elements.idleTip.classList.remove("is-visible");
  if (elements.dialog.open) return;
  idleTimeout = setTimeout(() => {
    if (elements.dialog.open) return;
    elements.tipText.textContent = tips[tipIndex++ % tips.length];
    elements.idleTip.classList.add("is-visible");
    tipTimeout = setTimeout(scheduleIdleTip, 6000);
  }, 10000);
}

createPins();
selectDestination(destinations[0]);
elements.enter.addEventListener("click", openExperience);
$("#startPhoneSceneButton").addEventListener("click", startPhoneScene);
$("#closeBoothButton").addEventListener("click", closeExperience);
$("#restartButton").addEventListener("click", () => { closeExperience(); mapController.reset(true); });
elements.dialog.addEventListener("cancel", event => { event.preventDefault(); closeExperience(); });
$("#closeTipButton").addEventListener("click", scheduleIdleTip);
$("#fullscreenButton").addEventListener("click", async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  else await document.exitFullscreen();
});
for (const destination of destinations) { const image = new Image(); image.src = destination.image; }
for (const eventName of ["pointerdown", "wheel", "keydown"]) window.addEventListener(eventName, scheduleIdleTip, { passive: true });
scheduleIdleTip();
