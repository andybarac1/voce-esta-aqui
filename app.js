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

const $ = (selector, root = document) => root.querySelector(selector);
const elements = {
  viewport: $("#mapViewport"), canvas: $("#mapCanvas"), pins: $("#pinsLayer"), quickList: $("#quickList"),
  photo: $("#destinationPhoto"), flash: $("#photoFlash"), index: $("#photoIndex"), name: $("#destinationName"),
  country: $("#destinationCountry"), code: $("#destinationCode"), status: $("#mapStatus"), enter: $("#enterButton"),
  dialog: $("#boothDialog"), boothBackground: $("#boothBackground"), boothTitle: $("#boothTitle"), boothLocation: $("#boothLocation"),
  closeBooth: $("#closeBoothButton"), cameraButton: $("#cameraButton"), video: $("#cameraVideo"), upload: $("#photoUpload"),
  uploadedPreview: $("#uploadedPreview"), placeholder: $("#cameraPlaceholder"), shutter: $("#shutterButton"), countdown: $("#countdown"),
  resultView: $("#resultView"), resultCanvas: $("#resultCanvas"), retake: $("#retakeButton"), download: $("#downloadButton"),
  questionView: $("#questionView"), questionText: $("#questionText"), questionTimer: $("#questionTimer"),
  inspirationView: $("#inspirationView"), inspirationPhrase: $("#inspirationPhrase"), inspirationTimer: $("#inspirationTimer"),
  timerProgress: $("#timerProgress"), boothContent: $("#boothContent"), endView: $("#endView"),
  idleTip: $("#idleTip"), tipText: $("#tipText"), toast: $("#toast")
};

let selected = null;
let stream = null;
let photoSource = null;
let toastTimer = null;
let questionInterval = null;
let inspirationInterval = null;
let idleTimer = null;
let tipTimer = null;
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
  const projectedX = lon * xFactor;
  const projectedY = Math.sign(lat) * yFactor * 91.296;
  return { x: ((projectedX + 180) / 360) * 100, y: ((91.296 - projectedY) / 182.592) * 100 };
}

function createDestinationControls() {
  const pinFragment = document.createDocumentFragment();
  const listFragment = document.createDocumentFragment();
  destinations.forEach((destination, index) => {
    const point = project(destination.lat, destination.lon);
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "map-pin";
    pin.dataset.id = destination.id;
    pin.style.left = `${point.x}%`;
    pin.style.top = `${point.y}%`;
    pin.setAttribute("aria-label", `${destination.name}, ${destination.country}`);
    pin.title = `${destination.name} — ${destination.country}`;
    pin.innerHTML = `<span class="pin-label">${destination.short || destination.name}</span>`;
    pin.addEventListener("click", (event) => {
      event.stopPropagation();
      selectDestination(destination, true);
    });
    pinFragment.append(pin);

    const item = document.createElement("button");
    item.type = "button";
    item.className = "quick-item";
    item.dataset.id = destination.id;
    item.innerHTML = `<span>${String(index + 1).padStart(2, "0")} · ${destination.short || destination.name}</span><span>${destination.code.split(" / ")[0]}</span>`;
    item.addEventListener("click", () => selectDestination(destination, true));
    listFragment.append(item);
  });
  elements.pins.append(pinFragment);
  elements.quickList.append(listFragment);
}

function selectDestination(destination, focusMap = false) {
  if (!destination || destination.id === selected.id && !focusMap) return;
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
  elements.status.textContent = `${destination.name.toUpperCase()} · TOQUE PARA ENTRAR`;
  document.querySelectorAll("[data-id]").forEach(node => node.classList.toggle("is-active", node.dataset.id === destination.id));
  const activeListItem = $(`.quick-item[data-id="${destination.id}"]`);
  activeListItem?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  if (focusMap) mapController.focus(destination);
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
    const scaledW = elements.canvas.offsetWidth * state.scale;
    const scaledH = elements.canvas.offsetHeight * state.scale;
    const margin = 90;
    state.x = Math.min(margin - left, Math.max(viewW - left - scaledW - margin, state.x));
    state.y = Math.min(margin - top, Math.max(viewH - top - scaledH - margin, state.y));
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

  function focus(destination) {
    const point = project(destination.lat, destination.lon);
    const targetScale = Math.max(1.7, Math.min(2.25, state.scale));
    const viewW = elements.viewport.clientWidth;
    const viewH = elements.viewport.clientHeight;
    const localX = elements.canvas.offsetWidth * point.x / 100;
    const localY = elements.canvas.offsetHeight * point.y / 100;
    state.scale = targetScale;
    state.x = viewW * .48 - elements.canvas.offsetLeft - localX * targetScale;
    state.y = viewH * .48 - elements.canvas.offsetTop - localY * targetScale;
    clamp();
    apply(true);
  }

  function pointerDown(event) {
    if (event.target.closest("button")) return;
    elements.viewport.setPointerCapture(event.pointerId);
    state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (state.pointers.size === 1) {
      state.gesture = { type: "drag", startX: event.clientX, startY: event.clientY, x: state.x, y: state.y };
    } else if (state.pointers.size === 2) {
      const points = [...state.pointers.values()];
      const dx = points[1].x - points[0].x;
      const dy = points[1].y - points[0].y;
      state.gesture = {
        type: "pinch", distance: Math.hypot(dx, dy), scale: state.scale, x: state.x, y: state.y,
        midX: (points[0].x + points[1].x) / 2, midY: (points[0].y + points[1].y) / 2
      };
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
      const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
      const next = Math.min(maxScale, Math.max(minScale, state.gesture.scale * distance / state.gesture.distance));
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
      const remaining = [...state.pointers.values()][0];
      state.gesture = { type: "drag", startX: remaining.x, startY: remaining.y, x: state.x, y: state.y };
    } else if (!state.pointers.size) state.gesture = null;
  }

  elements.viewport.addEventListener("pointerdown", pointerDown);
  elements.viewport.addEventListener("pointermove", pointerMove);
  elements.viewport.addEventListener("pointerup", pointerUp);
  elements.viewport.addEventListener("pointercancel", pointerUp);
  elements.viewport.addEventListener("wheel", event => {
    event.preventDefault();
    zoomAt(state.scale * Math.exp(-event.deltaY * .0015), event.clientX, event.clientY);
  }, { passive: false });
  elements.viewport.addEventListener("dblclick", event => zoomAt(state.scale * 1.55, event.clientX, event.clientY, true));
  elements.viewport.addEventListener("keydown", event => {
    const increment = 46;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "0"].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowLeft") state.x += increment;
    if (event.key === "ArrowRight") state.x -= increment;
    if (event.key === "ArrowUp") state.y += increment;
    if (event.key === "ArrowDown") state.y -= increment;
    if (event.key === "+" || event.key === "=") zoomAt(state.scale * 1.3, innerWidth / 2, innerHeight / 2, true);
    if (event.key === "-") zoomAt(state.scale / 1.3, innerWidth / 2, innerHeight / 2, true);
    if (event.key === "0") return reset();
    clamp(); apply();
  });
  window.addEventListener("resize", () => { clamp(); apply(); });
  $("#zoomInButton").addEventListener("click", () => {
    const rect = elements.viewport.getBoundingClientRect();
    zoomAt(state.scale * 1.35, rect.left + rect.width / 2, rect.top + rect.height / 2, true);
  });
  $("#zoomOutButton").addEventListener("click", () => {
    const rect = elements.viewport.getBoundingClientRect();
    zoomAt(state.scale / 1.35, rect.left + rect.width / 2, rect.top + rect.height / 2, true);
  });
  $("#resetMapButton").addEventListener("click", () => reset());
  apply();
  return { reset, focus };
})();

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2800);
}

const tips = [
  "TOQUE EM UM PIN PARA DESCOBRIR O DESTINO.",
  "USE DOIS DEDOS PARA APROXIMAR O MAPA.",
  "ARRASTE O MAPA PARA EXPLORAR OUTROS LUGARES.",
  "DEPOIS DE ESCOLHER, TOQUE EM ‘ENTRAR NESTE LUGAR’."
];

function scheduleIdleTip() {
  clearTimeout(idleTimer);
  clearTimeout(tipTimer);
  elements.idleTip.classList.remove("is-visible");
  if (elements.dialog.open) return;
  idleTimer = setTimeout(() => {
    if (elements.dialog.open) return;
    elements.tipText.textContent = tips[tipIndex++ % tips.length];
    elements.idleTip.classList.add("is-visible");
    tipTimer = setTimeout(() => {
      elements.idleTip.classList.remove("is-visible");
      scheduleIdleTip();
    }, 6000);
  }, 10000);
}

function openBooth() {
  clearTimeout(idleTimer);
  clearTimeout(tipTimer);
  elements.idleTip.classList.remove("is-visible");
  elements.boothBackground.src = selected.image;
  elements.boothTitle.textContent = selected.name.toUpperCase();
  elements.boothLocation.textContent = `${selected.name.toUpperCase()}, ${selected.country.toUpperCase()}`;
  elements.questionText.textContent = `COMO VOCÊ POSARIA EM ${selected.name.toUpperCase()}?`;
  elements.inspirationPhrase.textContent = destinationPhrases[selected.id];
  elements.resultView.hidden = true;
  elements.endView.hidden = true;
  elements.inspirationView.hidden = true;
  elements.boothContent.hidden = true;
  elements.questionView.hidden = false;
  if (typeof elements.dialog.showModal === "function") elements.dialog.showModal();
  else elements.dialog.setAttribute("open", "");
  startQuestionTimer();
}

function clearExperienceTimers() {
  clearInterval(questionInterval);
  clearInterval(inspirationInterval);
  questionInterval = null;
  inspirationInterval = null;
}

function startQuestionTimer() {
  clearExperienceTimers();
  let remaining = 8;
  elements.questionTimer.textContent = remaining;
  questionInterval = setInterval(() => {
    remaining -= 1;
    elements.questionTimer.textContent = Math.max(0, remaining);
    if (remaining <= 0) startInspiration();
  }, 1000);
}

function startInspiration() {
  clearExperienceTimers();
  elements.questionView.hidden = true;
  elements.boothContent.hidden = true;
  elements.inspirationView.hidden = false;
  let remaining = 10;
  elements.inspirationTimer.textContent = remaining;
  elements.timerProgress.style.transition = "none";
  elements.timerProgress.style.transform = "scaleX(1)";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    elements.timerProgress.style.transition = "transform 10s linear";
    elements.timerProgress.style.transform = "scaleX(0)";
  }));
  inspirationInterval = setInterval(() => {
    remaining -= 1;
    elements.inspirationTimer.textContent = Math.max(0, remaining);
    if (remaining <= 0) startCameraPhase();
  }, 1000);
}

function startCameraPhase() {
  clearExperienceTimers();
  elements.inspirationView.hidden = true;
  elements.boothContent.hidden = false;
  showToast("VOCÊ TERÁ 3 SEGUNDOS DEPOIS DE TOCAR NO BOTÃO.");
  startCamera();
}

function stopCamera() {
  stream?.getTracks().forEach(track => track.stop());
  stream = null;
  elements.video.srcObject = null;
}

function closeBooth() {
  clearExperienceTimers();
  stopCamera();
  photoSource = null;
  elements.video.style.display = "none";
  elements.uploadedPreview.style.display = "none";
  elements.placeholder.style.display = "grid";
  elements.shutter.disabled = true;
  elements.cameraButton.textContent = "ATIVAR CÂMERA";
  elements.dialog.close();
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("CÂMERA INDISPONÍVEL. USE ENVIAR FOTO.");
    return;
  }
  try {
    stopCamera();
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
    elements.video.srcObject = stream;
    await elements.video.play();
    elements.video.style.display = "block";
    elements.uploadedPreview.style.display = "none";
    elements.placeholder.style.display = "none";
    elements.cameraButton.textContent = "CÂMERA ATIVA";
    elements.shutter.disabled = false;
    photoSource = elements.video;
  } catch (error) {
    console.error(error);
    showToast("NÃO FOI POSSÍVEL ABRIR A CÂMERA. USE ENVIAR FOTO.");
  }
}

function loadUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    stopCamera();
    elements.uploadedPreview.onload = () => {
      photoSource = elements.uploadedPreview;
      elements.video.style.display = "none";
      elements.uploadedPreview.style.display = "block";
      elements.placeholder.style.display = "none";
      elements.shutter.disabled = false;
      elements.cameraButton.textContent = "ATIVAR CÂMERA";
    };
    elements.uploadedPreview.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function drawCover(ctx, image, x, y, width, height, mirror = false) {
  const sourceWidth = image.videoWidth || image.naturalWidth || image.width;
  const sourceHeight = image.videoHeight || image.naturalHeight || image.height;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = width / height;
  let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;
  if (sourceRatio > targetRatio) { sw = sourceHeight * targetRatio; sx = (sourceWidth - sw) / 2; }
  else { sh = sourceWidth / targetRatio; sy = (sourceHeight - sh) / 2; }
  ctx.save();
  if (mirror) { ctx.translate(x + width, y); ctx.scale(-1, 1); ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height); }
  else ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
  ctx.restore();
}

async function capture() {
  if (!photoSource) return;
  elements.shutter.disabled = true;
  for (const count of [3, 2, 1]) {
    elements.countdown.textContent = count;
    await new Promise(resolve => setTimeout(resolve, 650));
  }
  elements.countdown.textContent = "";
  await renderSouvenir();
  elements.resultView.hidden = false;
  elements.shutter.disabled = false;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function renderSouvenir() {
  const canvas = elements.resultCanvas;
  const ctx = canvas.getContext("2d");
  const background = await loadImage(selected.image);
  drawCover(ctx, background, 0, 0, canvas.width, canvas.height);

  const shade = ctx.createLinearGradient(0, 0, canvas.width, 0);
  shade.addColorStop(0, "rgba(0,0,0,.66)"); shade.addColorStop(.55, "rgba(0,0,0,.05)"); shade.addColorStop(1, "rgba(0,0,0,.35)");
  ctx.fillStyle = shade; ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(1045, 165); ctx.rotate(-.025);
  ctx.fillStyle = "#f7f1e7"; ctx.fillRect(-25, -25, 470, 660);
  ctx.strokeStyle = "#171719"; ctx.lineWidth = 5; ctx.strokeRect(-25, -25, 470, 660);
  drawCover(ctx, photoSource, 0, 0, 420, 560, photoSource === elements.video);
  ctx.fillStyle = "#171719"; ctx.font = "700 28px 'Courier New'"; ctx.fillText("VOCÊ ESTEVE AQUI.", 0, 605);
  ctx.restore();

  ctx.fillStyle = "#fffdf8";
  ctx.font = "700 27px 'Courier New'"; ctx.fillText("MARTIN PARR · EXPERIÊNCIA 01", 82, 92);
  ctx.font = "700 98px 'Courier New'";
  const words = selected.name.toUpperCase().split(" ");
  let line = "", lineY = 250;
  words.forEach(word => {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > 800 && line) { ctx.fillText(line.trim(), 78, lineY); line = `${word} `; lineY += 102; }
    else line = test;
  });
  ctx.fillText(line.trim(), 78, lineY);

  ctx.fillStyle = "#ff6a13"; ctx.fillRect(0, 925, 1600, 275);
  ctx.strokeStyle = "#171719"; ctx.lineWidth = 5; ctx.setLineDash([18, 14]); ctx.beginPath(); ctx.moveTo(0, 925); ctx.lineTo(1600, 925); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#171719"; ctx.font = "700 34px 'Courier New'"; ctx.fillText("VOCÊ ESTÁ AQUI", 82, 1005);
  ctx.font = "700 22px 'Courier New'"; ctx.fillText(`${selected.country.toUpperCase()}  /  ${selected.code}`, 82, 1060);
  ctx.fillText(`${formatCoordinate(selected.lat, "N", "S")}  ·  ${formatCoordinate(selected.lon, "L", "O")}`, 82, 1110);
  ctx.textAlign = "right"; ctx.font = "700 24px 'Courier New'"; ctx.fillText("MAGNUM PHOTOS  ×  MPF", 1510, 1090); ctx.textAlign = "left";
}

function downloadSouvenir() {
  elements.resultCanvas.toBlob(blob => {
    const link = document.createElement("a");
    link.download = `voce-esta-aqui-${selected.id}.jpg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast("LEMBRANÇA SALVA!");
    setTimeout(() => {
      elements.resultView.hidden = true;
      elements.endView.hidden = false;
    }, 900);
  }, "image/jpeg", .92);
}

function restartExperience() {
  clearExperienceTimers();
  stopCamera();
  photoSource = null;
  elements.endView.hidden = true;
  elements.resultView.hidden = true;
  elements.video.style.display = "none";
  elements.uploadedPreview.style.display = "none";
  elements.placeholder.style.display = "grid";
  elements.shutter.disabled = true;
  elements.cameraButton.textContent = "ATIVAR CÂMERA";
  elements.dialog.close();
  mapController.reset(true);
  scheduleIdleTip();
}

createDestinationControls();
selectDestination(destinations[0]);
elements.enter.addEventListener("click", openBooth);
elements.closeBooth.addEventListener("click", closeBooth);
elements.dialog.addEventListener("cancel", event => { event.preventDefault(); closeBooth(); });
elements.cameraButton.addEventListener("click", startCamera);
$("#startInspirationButton").addEventListener("click", startInspiration);
elements.upload.addEventListener("change", event => loadUpload(event.target.files[0]));
elements.shutter.addEventListener("click", capture);
elements.retake.addEventListener("click", () => { elements.resultView.hidden = true; });
elements.download.addEventListener("click", downloadSouvenir);
$("#restartButton").addEventListener("click", restartExperience);
$("#closeTipButton").addEventListener("click", scheduleIdleTip);
$("#fullscreenButton").addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch { showToast("TELA CHEIA INDISPONÍVEL NESTE NAVEGADOR."); }
});

for (const destination of destinations) { const image = new Image(); image.src = destination.image; }
for (const eventName of ["pointerdown", "wheel", "keydown"]) {
  window.addEventListener(eventName, scheduleIdleTip, { passive: true });
}
scheduleIdleTip();
