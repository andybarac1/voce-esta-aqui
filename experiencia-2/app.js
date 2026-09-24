const legacyDestinations = [
  { id: "paris", name: "Paris", country: "França", flag: "fr", code: "PAR", image: "assets/paris.jpg", alt: "Torre Eiffel em Paris", fact: "EM PARIS, ATÉ O CÉU PARECE POSAR." },
  { id: "china", name: "Muralha da China", country: "China", flag: "cn", code: "PEK", image: "assets/china.jpg", alt: "Grande Muralha da China", fact: "UMA PAISAGEM QUE ATRAVESSA SÉCULOS E HORIZONTES." },
  { id: "coliseu", name: "Coliseu", country: "Itália", flag: "it", code: "ROM", image: "assets/coliseu.jpg", alt: "Coliseu em Roma", fact: "EM ROMA, CADA PEDRA GUARDA UMA HISTÓRIA." },
  { id: "dubai", name: "Dubai", country: "Emirados Árabes", flag: "ae", code: "DXB", image: "assets/dubai.jpg", alt: "Skyline de Dubai", fact: "O FUTURO GANHA FORMA NO MEIO DO DESERTO." },
  { id: "egito", name: "Pirâmides de Gizé", country: "Egito", flag: "eg", code: "CAI", image: "assets/egito.jpg", alt: "Pirâmides de Gizé", fact: "UMA VIAGEM DE VOLTA A QUATRO MIL ANOS DE HISTÓRIA." },
  { id: "fuji", name: "Monte Fuji", country: "Japão", flag: "jp", code: "FJI", image: "assets/fuji.jpg", alt: "Monte Fuji", fact: "O FUJI TRANSFORMA SILÊNCIO EM PAISAGEM." },
  { id: "hollywood", name: "Hollywood", country: "Estados Unidos", flag: "us", code: "LAX", image: "assets/hollywood.jpg", alt: "Letreiro de Hollywood", fact: "AQUI, TODO VIAJANTE PODE SER PROTAGONISTA." },
  { id: "italia", name: "Torre de Pisa", country: "Itália", flag: "it", code: "PSA", image: "assets/italia.jpg", alt: "Torre de Pisa", fact: "UMA PERSPECTIVA INCLINADA SOBRE A ITÁLIA." },
  { id: "jerusalem", name: "Jerusalém", country: "Israel", flag: "il", code: "JRS", image: "assets/jerusalem.jpg", alt: "Jerusalém", fact: "CAMINHOS ANTIGOS SE ENCONTRAM EM CADA ESQUINA." },
  { id: "lisboa", name: "Lisboa", country: "Portugal", flag: "pt", code: "LIS", image: "assets/lisboa.jpg", alt: "Lisboa", fact: "LUZ, AZULEJOS E SETE COLINAS À SUA ESPERA." },
  { id: "machu-picchu", name: "Machu Picchu", country: "Peru", flag: "pe", code: "CUZ", image: "assets/machu-picchu.jpg", alt: "Machu Picchu", fact: "UMA CIDADE NAS NUVENS, A 2.430 METROS DE ALTITUDE." },
  { id: "madrid", name: "Madri", country: "Espanha", flag: "es", code: "MAD", image: "assets/madrid.jpg", alt: "Madri", fact: "ARTE E VIDA OCUPAM AS RUAS DE MADRI." },
  { id: "masp-sp", name: "MASP", country: "São Paulo, Brasil", flag: "br", code: "SAO", image: "assets/masp-sp.jpg", alt: "MASP em São Paulo", fact: "UM VÃO LIVRE PARA TODAS AS HISTÓRIAS." },
  { id: "moscou", name: "Moscou", country: "Rússia", flag: "ru", code: "MOW", image: "assets/moscou.jpg", alt: "Moscou", fact: "CORES E CÚPULAS MARCAM O CORAÇÃO DE MOSCOU." },
  { id: "nova-yorke", name: "Nova York", country: "Estados Unidos", flag: "us", code: "NYC", image: "assets/nova-yorke.jpg", alt: "Estátua da Liberdade", fact: "UMA CIDADE FEITA DE CHEGADAS E RECOMEÇOS." },
  { id: "rio-de-janeiro", name: "Rio de Janeiro", country: "Brasil", flag: "br", code: "RIO", image: "assets/rio-de-janeiro.jpg", alt: "Cristo Redentor", fact: "NO RIO, A PAISAGEM FAZ QUESTÃO DE PARTICIPAR." },
  { id: "savana-africana", name: "Savana Africana", country: "Quênia", flag: "ke", code: "NBO", image: "assets/savana-africana.jpg", alt: "Savana africana", fact: "O HORIZONTE É TÃO LIVRE QUANTO A VIDA SELVAGEM." }
];

const destinations = window.MPF_DESTINATIONS || legacyDestinations;

const $ = selector => document.querySelector(selector);
const elements = {
  splash: $("#openingSplash"), galleryScreen: $("#galleryScreen"), image: $("#galleryImage"), title: $("#galleryTitle"),
  country: $("#galleryCountry"), counter: $("#galleryCounter"), rail: $("#thumbnailRail"), ticketCode: $("#ticketCode"),
  ticketName: $("#ticketName"), ticketFact: $("#ticketFact"), choose: $("#chooseButton"), qrScreen: $("#qrScreen"),
  qrBackground: $("#qrBackground"), qrDestination: $("#qrDestination"), qrImage: $("#qrImage"), qrStatus: $("#qrStatus"),
  qrBack: $("#qrBackButton"), thanks: $("#tvThanks"), toast: $("#toast")
};

let selected = destinations[0];
let activeTransfer = null;
let qrTimer = null;
let thanksTimer = null;

function showOpening() {
  elements.splash.hidden = false;
  elements.splash.classList.remove("is-leaving");
  void elements.splash.offsetWidth;
}

function dismissOpening() {
  if (elements.splash.classList.contains("is-leaving")) return;
  elements.splash.classList.add("is-leaving");
  setTimeout(() => { elements.splash.hidden = true; }, 850);
}

function createGallery() {
  const fragment = document.createDocumentFragment();
  destinations.forEach((destination, index) => {
    const button = document.createElement("button");
    button.className = "gallery-thumb";
    button.type = "button";
    button.dataset.id = destination.id;
    button.setAttribute("aria-label", `${destination.name}, ${destination.country}`);
    button.innerHTML = `<img src="${destination.image}" alt=""><span>${String(index + 1).padStart(2, "0")}</span>`;
    button.addEventListener("click", () => selectDestination(destination));
    fragment.append(button);
  });
  elements.rail.append(fragment);
}

function flagImage(destination) {
  const iso = ({ Brasil: "br", Suíça: "ch", Grécia: "gr", Espanha: "es", Argentina: "ar", Egito: "eg", México: "mx", Portugal: "pt", "Reino Unido": "gb", Peru: "pe", Maldivas: "mv", "Estados Unidos": "us", França: "fr", China: "cn", Itália: "it", Japão: "jp" })[destination.country];
  if (!iso) { const symbol = document.createElement("span"); symbol.className = "country-flag country-flag--emoji"; symbol.textContent = "✦"; return symbol; }
  const image = document.createElement("img");
  image.className = "country-flag";
  image.src = `assets/flags/${iso}.svg`;
  image.alt = `Bandeira de ${destination.country}`;
  return image;
}

function selectDestination(destination) {
  selected = destination;
  const index = destinations.indexOf(destination);
  elements.image.classList.add("is-changing");
  const preload = new Image();
  preload.onload = () => {
    elements.image.src = destination.image;
    elements.image.alt = destination.alt;
    requestAnimationFrame(() => elements.image.classList.remove("is-changing"));
  };
  preload.src = destination.image;
  elements.title.textContent = destination.name.toUpperCase();
  elements.country.replaceChildren(document.createTextNode(`${destination.country.toUpperCase()} `), flagImage(destination));
  elements.counter.textContent = `${String(index + 1).padStart(2, "0")} / ${destinations.length}`;
  elements.ticketCode.replaceChildren(document.createTextNode(`${destination.code} / `), flagImage(destination));
  elements.ticketName.textContent = destination.name.toUpperCase();
  elements.ticketFact.textContent = destination.fact;
  document.querySelectorAll(".gallery-thumb").forEach(button => button.classList.toggle("is-active", button.dataset.id === destination.id));
  const active = $(`.gallery-thumb[data-id="${destination.id}"]`);
  active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove("is-visible"), 3500);
}

function createTripId() {
  if (window.crypto?.getRandomValues) {
    const bytes = window.crypto.getRandomValues(new Uint8Array(6));
    return [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function createTransfer() {
  elements.choose.disabled = true;
  elements.choose.querySelector("span").textContent = "PREPARANDO O EMBARQUE…";
  try {
    const mobilePath = document.body.dataset.mobilePath || "experiencia-2/mobile.html";
    const mobileUrl = new URL(mobilePath, document.baseURI);
    mobileUrl.searchParams.set("destination", selected.id);
    mobileUrl.searchParams.set("trip", createTripId());
    const code = qrcode(0, "M");
    code.addData(mobileUrl.href);
    code.make();
    activeTransfer = { destinationId: selected.id, mobileUrl: mobileUrl.href };
    elements.qrBackground.src = selected.image;
    elements.qrDestination.textContent = selected.name.toUpperCase();
    elements.qrImage.src = code.createDataURL(8, 4);
    elements.galleryScreen.hidden = true;
    elements.thanks.hidden = true;
    elements.qrScreen.hidden = false;
    startQrCountdown();
  } catch (error) {
    showToast("NÃO FOI POSSÍVEL GERAR O QR CODE. TENTE NOVAMENTE.");
    console.error(error);
  } finally {
    elements.choose.disabled = false;
    elements.choose.querySelector("span").textContent = "VIAJAR PARA ESTE LUGAR";
  }
}

function updateQrStatus(remaining) {
  elements.qrStatus.replaceChildren();
  const dot = document.createElement("span");
  elements.qrStatus.append(dot, document.createTextNode(` QR DISPONÍVEL POR ${remaining}S`));
}

function startQrCountdown() {
  clearInterval(qrTimer);
  let remaining = 25;
  updateQrStatus(remaining);
  qrTimer = setInterval(() => {
    remaining -= 1;
    updateQrStatus(Math.max(0, remaining));
    if (remaining <= 0) showTvThanks();
  }, 1000);
}

function showTvThanks() {
  clearInterval(qrTimer);
  qrTimer = null;
  elements.qrScreen.hidden = true;
  elements.thanks.hidden = false;
  clearTimeout(thanksTimer);
  thanksTimer = setTimeout(resetTv, 6500);
}

function resetTv() {
  clearInterval(qrTimer);
  clearTimeout(thanksTimer);
  qrTimer = null;
  thanksTimer = null;
  activeTransfer = null;
  elements.thanks.hidden = true;
  elements.qrScreen.hidden = true;
  elements.galleryScreen.hidden = false;
  selectDestination(destinations[0]);
  showOpening();
}

function backToGallery() {
  clearInterval(qrTimer);
  qrTimer = null;
  activeTransfer = null;
  elements.qrScreen.hidden = true;
  elements.galleryScreen.hidden = false;
}

createGallery();
selectDestination(destinations[0]);
showOpening();
elements.splash.addEventListener("click", dismissOpening);
elements.choose.addEventListener("click", createTransfer);
elements.qrBack.addEventListener("click", backToGallery);
$("#fullscreenButton").addEventListener("click", async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  else await document.exitFullscreen();
});
for (const destination of destinations) { const image = new Image(); image.src = destination.image; }
