const coordinates = {
  paris: [48.8584, 2.2945], china: [40.4319, 116.5704], coliseu: [41.8902, 12.4922], dubai: [25.2048, 55.2708],
  egito: [29.9792, 31.1342], fuji: [35.3606, 138.7274], hollywood: [34.1341, -118.3215], italia: [43.7229, 10.3966],
  jerusalem: [31.7683, 35.2137], lisboa: [38.7223, -9.1393], "machu-picchu": [-13.1631, -72.545], madrid: [40.4168, -3.7038],
  "masp-sp": [-23.5614, -46.6559], moscou: [55.7558, 37.6173], "nova-yorke": [40.6892, -74.0445], "rio-de-janeiro": [-22.9519, -43.2105], "savana-africana": [-1.2921, 36.8219]
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
  document.querySelectorAll(".map-pin").forEach(pin => pin.classList.toggle("is-active", pin.dataset.id === destination.id));
}

for (const destination of destinations) {
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
