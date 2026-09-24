const coordinates = {
  amazonia: [-3.1, -60], bonito: [-21.13, -56.48], "chapada-diamantina": [-12.5, -41.4], "fernando-de-noronha": [-3.85, -32.42],
  "foz-do-iguacu": [-25.69, -54.44], jericoacoara: [-2.79, -40.51], "lencois-maranhenses": [-2.55, -43.12], maragogi: [-9.01, -35.22],
  pantanal: [-17.68, -57], "porto-de-galinhas": [-8.5, -35], "rio-de-janeiro": [-22.95, -43.21], salvador: [-12.97, -38.5],
  "alpes-suicos": [46.56, 8.56], atenas: [37.98, 23.73], barcelona: [41.39, 2.17], "buenos-aires": [-34.6, -58.38],
  cairo: [30.04, 31.24], cancun: [21.16, -86.85], lisboa: [38.72, -9.14], londres: [51.51, -.13],
  "machu-picchu": [-13.16, -72.55], maldivas: [3.2, 73.22], "nova-yorke": [40.69, -74.04], "orlando-miami": [25.76, -80.19],
  paris: [48.86, 2.29], pequim: [39.9, 116.4], roma: [41.9, 12.5], santorini: [36.39, 25.46], toquio: [35.68, 139.69], veneza: [45.44, 12.33]
};
const mapElements = {
  viewport: document.querySelector("#mapViewport"), canvas: document.querySelector("#mapCanvas"), pins: document.querySelector("#pinsLayer"),
  status: document.querySelector("#mapStatus"), flash: document.querySelector("#mapPhotoFlash")
};

function projectPoint(lat, lon) {
  const xTable = [1, .9986, .9954, .99, .9822, .973, .96, .9427, .9216, .8962, .8679, .835, .7986, .7597, .7186, .6732, .6213, .5722, .5322];
  const yTable = [0, .062, .124, .186, .248, .31, .372, .434, .4958, .5571, .6176, .6769, .7346, .7903, .8435, .8936, .9394, .9761, 1];
  const position = Math.min(18, Math.abs(lat) / 5);
  const index = Math.min(17, Math.floor(position));
  const fraction = position - index;
  const xFactor = xTable[index] + (xTable[index + 1] - xTable[index]) * fraction;
  const yFactor = yTable[index] + (yTable[index + 1] - yTable[index]) * fraction;
  return { x: (((lon - 11) * xFactor * 1.01 + 180) / 360) * 100, y: ((91.296 - Math.sign(lat) * yFactor * 92) / 182.592) * 100 };
}

function chooseMapDestination(destination) {
  selectDestination(destination);
  mapElements.flash.classList.remove("flash");
  void mapElements.flash.offsetWidth;
  mapElements.flash.classList.add("flash");
  mapElements.status.textContent = `${destination.name.toUpperCase()} · DESTINO SELECIONADO`;
  document.querySelectorAll(".map-pin, .other-destination-button").forEach(pin => pin.classList.toggle("is-active", pin.dataset.id === destination.id));
}

for (const destination of destinations) {
  if (destination.id === "outro-lugar") {
    const otherButton = document.createElement("button");
    otherButton.type = "button";
    otherButton.className = "other-destination-button";
    otherButton.dataset.id = destination.id;
    otherButton.innerHTML = `<span>✦</span> OUTRO LUGAR`;
    otherButton.addEventListener("click", event => { event.stopPropagation(); chooseMapDestination(destination); });
    mapElements.viewport.append(otherButton);
    continue;
  }
  const [lat, lon] = coordinates[destination.id];
  const point = projectPoint(lat, lon);
  const pin = document.createElement("button");
  pin.type = "button";
  pin.className = "map-pin";
  pin.dataset.id = destination.id;
  pin.style.left = `${point.x}%`;
  pin.style.top = `${point.y}%`;
  pin.setAttribute("aria-label", `${destination.name}, ${destination.country}`);
  pin.innerHTML = `<span class="pin-label">${destination.name}</span>`;
  pin.addEventListener("click", event => { event.stopPropagation(); chooseMapDestination(destination); });
  mapElements.pins.append(pin);
}

const mapController = (() => {
  const state = { x: 0, y: 0, scale: 1, pointers: new Map(), gesture: null };
  const minScale = 1, maxScale = 4.5;
  function apply(animate = false) {
    mapElements.canvas.classList.toggle("is-flying", animate);
    mapElements.canvas.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
    mapElements.canvas.style.setProperty("--pin-scale", 1 / state.scale);
    clearTimeout(apply.timer);
    if (animate) apply.timer = setTimeout(() => mapElements.canvas.classList.remove("is-flying"), 700);
  }
  function clamp() {
    const viewW = mapElements.viewport.clientWidth, viewH = mapElements.viewport.clientHeight;
    const left = mapElements.canvas.offsetLeft, top = mapElements.canvas.offsetTop, margin = 90;
    state.x = Math.min(margin - left, Math.max(viewW - left - mapElements.canvas.offsetWidth * state.scale - margin, state.x));
    state.y = Math.min(margin - top, Math.max(viewH - top - mapElements.canvas.offsetHeight * state.scale - margin, state.y));
  }
  function zoomAt(nextScale, clientX, clientY, animate = false) {
    nextScale = Math.min(maxScale, Math.max(minScale, nextScale));
    const rect = mapElements.viewport.getBoundingClientRect(), px = clientX - rect.left, py = clientY - rect.top;
    const baseX = mapElements.canvas.offsetLeft, baseY = mapElements.canvas.offsetTop, ratio = nextScale / state.scale;
    state.x = px - baseX - (px - baseX - state.x) * ratio;
    state.y = py - baseY - (py - baseY - state.y) * ratio;
    state.scale = nextScale; clamp(); apply(animate);
  }
  function reset(animate = true) { state.x = 0; state.y = 0; state.scale = 1; apply(animate); mapElements.status.textContent = `${destinations.length} LUGARES PARA DESCOBRIR`; }
  function pointerDown(event) {
    if (event.target.closest("button")) return;
    mapElements.viewport.setPointerCapture(event.pointerId);
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
      state.x = state.gesture.x + event.clientX - state.gesture.startX; state.y = state.gesture.y + event.clientY - state.gesture.startY; clamp(); apply();
    } else if (state.pointers.size >= 2 && state.gesture?.type === "pinch") {
      const points = [...state.pointers.values()].slice(0, 2);
      const next = Math.min(maxScale, Math.max(minScale, state.gesture.scale * Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) / state.gesture.distance));
      const rect = mapElements.viewport.getBoundingClientRect(), px = state.gesture.midX - rect.left, py = state.gesture.midY - rect.top;
      const baseX = mapElements.canvas.offsetLeft, baseY = mapElements.canvas.offsetTop, ratio = next / state.gesture.scale;
      state.x = px - baseX - (px - baseX - state.gesture.x) * ratio; state.y = py - baseY - (py - baseY - state.gesture.y) * ratio; state.scale = next; clamp(); apply();
    }
  }
  function pointerUp(event) {
    state.pointers.delete(event.pointerId);
    if (state.pointers.size === 1) { const point = [...state.pointers.values()][0]; state.gesture = { type: "drag", startX: point.x, startY: point.y, x: state.x, y: state.y }; }
    else if (!state.pointers.size) state.gesture = null;
  }
  mapElements.viewport.addEventListener("pointerdown", pointerDown);
  mapElements.viewport.addEventListener("pointermove", pointerMove);
  mapElements.viewport.addEventListener("pointerup", pointerUp);
  mapElements.viewport.addEventListener("pointercancel", pointerUp);
  mapElements.viewport.addEventListener("wheel", event => { event.preventDefault(); zoomAt(state.scale * Math.exp(-event.deltaY * .0015), event.clientX, event.clientY); }, { passive: false });
  mapElements.viewport.addEventListener("dblclick", event => zoomAt(state.scale * 1.55, event.clientX, event.clientY, true));
  document.querySelector("#zoomInButton").addEventListener("click", () => { const rect = mapElements.viewport.getBoundingClientRect(); zoomAt(state.scale * 1.35, rect.left + rect.width / 2, rect.top + rect.height / 2, true); });
  document.querySelector("#zoomOutButton").addEventListener("click", () => { const rect = mapElements.viewport.getBoundingClientRect(); zoomAt(state.scale / 1.35, rect.left + rect.width / 2, rect.top + rect.height / 2, true); });
  document.querySelector("#resetMapButton").addEventListener("click", () => reset());
  window.addEventListener("resize", () => { clamp(); apply(); });
  apply(); return { reset };
})();

chooseMapDestination(destinations[0]);
