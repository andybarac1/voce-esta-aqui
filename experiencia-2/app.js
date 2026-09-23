const destinations = [
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

const $ = selector => document.querySelector(selector);
const elements = {
  splash: $("#openingSplash"), galleryScreen: $("#galleryScreen"), image: $("#galleryImage"), title: $("#galleryTitle"),
  country: $("#galleryCountry"), counter: $("#galleryCounter"), rail: $("#thumbnailRail"), ticketCode: $("#ticketCode"),
  ticketName: $("#ticketName"), ticketFact: $("#ticketFact"), choose: $("#chooseButton"), qrScreen: $("#qrScreen"),
  qrBackground: $("#qrBackground"), qrDestination: $("#qrDestination"), qrImage: $("#qrImage"), qrStatus: $("#qrStatus"),
  qrBack: $("#qrBackButton"), thanks: $("#tvThanks"), toast: $("#toast")
};

let selected = destinations[0];
let activeSession = null;
let pollTimer = null;

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
  const image = document.createElement("img");
  image.className = "country-flag";
  image.src = `assets/flags/${destination.flag}.svg`;
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

async function createSession() {
  elements.choose.disabled = true;
  elements.choose.querySelector("span").textContent = "PREPARANDO O EMBARQUE…";
  try {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationId: selected.id })
    });
    if (!response.ok) throw new Error("Não foi possível criar a sessão.");
    activeSession = await response.json();
    elements.qrBackground.src = selected.image;
    elements.qrDestination.textContent = selected.name.toUpperCase();
    elements.qrImage.src = activeSession.qrCode;
    elements.qrStatus.innerHTML = "<span></span> AGUARDANDO O EMBARQUE";
    elements.galleryScreen.hidden = true;
    elements.thanks.hidden = true;
    elements.qrScreen.hidden = false;
    startPolling();
  } catch (error) {
    showToast("INICIE A EXPERIÊNCIA PELO SERVIDOR DA APLICAÇÃO 2.");
    console.error(error);
  } finally {
    elements.choose.disabled = false;
    elements.choose.querySelector("span").textContent = "VIAJAR PARA ESTE LUGAR";
  }
}

function startPolling() {
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    if (!activeSession) return;
    try {
      const response = await fetch(`/api/sessions/${activeSession.session.id}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Sessão indisponível");
      const data = await response.json();
      if (data.session.status === "entered" || data.session.status === "completed") showTvThanks();
    } catch (error) {
      console.warn(error);
    }
  }, 900);
}

function showTvThanks() {
  clearInterval(pollTimer);
  pollTimer = null;
  elements.qrScreen.hidden = true;
  elements.thanks.hidden = false;
  setTimeout(resetTv, 6500);
}

function resetTv() {
  clearInterval(pollTimer);
  pollTimer = null;
  activeSession = null;
  elements.thanks.hidden = true;
  elements.qrScreen.hidden = true;
  elements.galleryScreen.hidden = false;
  selectDestination(destinations[0]);
  showOpening();
}

function backToGallery() {
  clearInterval(pollTimer);
  pollTimer = null;
  activeSession = null;
  elements.qrScreen.hidden = true;
  elements.galleryScreen.hidden = false;
}

createGallery();
selectDestination(destinations[0]);
showOpening();
elements.splash.addEventListener("click", dismissOpening);
elements.choose.addEventListener("click", createSession);
elements.qrBack.addEventListener("click", backToGallery);
$("#fullscreenButton").addEventListener("click", async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  else await document.exitFullscreen();
});
for (const destination of destinations) { const image = new Image(); image.src = destination.image; }
