const destinations = [
  { id: "paris", name: "Paris", country: "França", code: "PAR", image: "assets/paris.jpg" },
  { id: "china", name: "Muralha da China", country: "China", code: "PEK", image: "assets/china.jpg" },
  { id: "coliseu", name: "Coliseu", country: "Itália", code: "ROM", image: "assets/coliseu.jpg" },
  { id: "dubai", name: "Dubai", country: "Emirados Árabes", code: "DXB", image: "assets/dubai.jpg" },
  { id: "egito", name: "Pirâmides de Gizé", country: "Egito", code: "CAI", image: "assets/egito.jpg" },
  { id: "fuji", name: "Monte Fuji", country: "Japão", code: "FJI", image: "assets/fuji.jpg" },
  { id: "hollywood", name: "Hollywood", country: "Estados Unidos", code: "LAX", image: "assets/hollywood.jpg" },
  { id: "italia", name: "Torre de Pisa", country: "Itália", code: "PSA", image: "assets/italia.jpg" },
  { id: "jerusalem", name: "Jerusalém", country: "Israel", code: "JRS", image: "assets/jerusalem.jpg" },
  { id: "lisboa", name: "Lisboa", country: "Portugal", code: "LIS", image: "assets/lisboa.jpg" },
  { id: "machu-picchu", name: "Machu Picchu", country: "Peru", code: "CUZ", image: "assets/machu-picchu.jpg" },
  { id: "madrid", name: "Madri", country: "Espanha", code: "MAD", image: "assets/madrid.jpg" },
  { id: "masp-sp", name: "MASP", country: "São Paulo, Brasil", code: "SAO", image: "assets/masp-sp.jpg" },
  { id: "moscou", name: "Moscou", country: "Rússia", code: "MOW", image: "assets/moscou.jpg" },
  { id: "nova-yorke", name: "Nova York", country: "Estados Unidos", code: "NYC", image: "assets/nova-yorke.jpg" },
  { id: "rio-de-janeiro", name: "Rio de Janeiro", country: "Brasil", code: "RIO", image: "assets/rio-de-janeiro.jpg" },
  { id: "savana-africana", name: "Savana Africana", country: "Quênia", code: "NBO", image: "assets/savana-africana.jpg" }
];

const $ = selector => document.querySelector(selector);
const steps = ["#sessionLoading", "#reasonStep", "#cameraStep", "#processingStep", "#editorStep", "#endStep", "#errorStep"];
const elements = {
  reasonStep: $("#reasonStep"), reason: $("#travelReason"), reasonCount: $("#reasonCount"), reasonContinue: $("#reasonContinue"),
  destinationImage: $("#mobileDestinationImage"), destinationName: $("#mobileDestinationName"), cameraDestinationImage: $("#cameraDestinationImage"),
  cameraInput: $("#cameraInput"), galleryInput: $("#galleryInput"), canvas: $("#resultCanvas"), strength: $("#cutoutStrength"),
  download: $("#downloadButton"), finish: $("#finishButton"), toast: $("#mobileToast")
};

const sessionId = new URLSearchParams(location.search).get("session");
let session = null;
let destination = null;
let sourceCanvas = null;
let objectUrl = null;
let renderFrame = null;
const assetCache = new Map();

function showStep(selector) {
  for (const step of steps) $(step).hidden = step !== selector;
  window.scrollTo({ top: 0, behavior: "auto" });
}

function toast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => elements.toast.classList.remove("is-visible"), 3600);
}

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Falha na sessão");
  return response.json();
}

async function begin() {
  if (!sessionId) return showStep("#errorStep");
  try {
    const data = await request(`/api/sessions/${sessionId}`, { cache: "no-store" });
    session = data.session;
    destination = destinations.find(item => item.id === session.destinationId);
    if (!destination) throw new Error("Destino inválido");
    elements.destinationImage.src = destination.image;
    elements.cameraDestinationImage.src = destination.image;
    elements.destinationName.textContent = destination.name.toUpperCase();
    await request(`/api/sessions/${sessionId}/entered`, { method: "POST" });
    await Promise.all([loadImage(destination.image), loadImage("assets/magnum.png"), loadImage("assets/mpf.png")]);
    showStep("#reasonStep");
  } catch (error) {
    console.error(error);
    showStep("#errorStep");
  }
}

function loadImage(url) {
  if (assetCache.has(url)) return assetCache.get(url);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
  assetCache.set(url, promise);
  return promise;
}

function drawCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function averageCorner(data, width, height, startX, startY, size) {
  let red = 0, green = 0, blue = 0, count = 0;
  for (let y = startY; y < Math.min(height, startY + size); y += 2) {
    for (let x = startX; x < Math.min(width, startX + size); x += 2) {
      const index = (y * width + x) * 4;
      red += data[index]; green += data[index + 1]; blue += data[index + 2]; count++;
    }
  }
  return [red / count, green / count, blue / count];
}

function createCutout(threshold) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const context = sourceCanvas.getContext("2d", { willReadFrequently: true });
  const source = context.getImageData(0, 0, width, height);
  const output = new ImageData(new Uint8ClampedArray(source.data), width, height);
  const sampleSize = Math.max(8, Math.round(Math.min(width, height) * .055));
  const samples = [
    averageCorner(source.data, width, height, 0, 0, sampleSize),
    averageCorner(source.data, width, height, width - sampleSize, 0, sampleSize),
    averageCorner(source.data, width, height, 0, height - sampleSize, sampleSize),
    averageCorner(source.data, width, height, width - sampleSize, height - sampleSize, sampleSize)
  ];
  const feather = 58;
  for (let index = 0; index < output.data.length; index += 4) {
    const red = source.data[index], green = source.data[index + 1], blue = source.data[index + 2];
    let distance = Infinity;
    for (const sample of samples) {
      const current = Math.hypot(red - sample[0], green - sample[1], blue - sample[2]);
      distance = Math.min(distance, current);
    }
    const ratio = Math.max(0, Math.min(1, (distance - threshold) / feather));
    const smooth = ratio * ratio * (3 - 2 * ratio);
    output.data[index + 3] = Math.round(source.data[index + 3] * smooth);
  }
  const cutout = document.createElement("canvas");
  cutout.width = width;
  cutout.height = height;
  cutout.getContext("2d").putImageData(output, 0, 0);
  return cutout;
}

function wrapText(context, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = text.trim().split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((value, index) => context.fillText(value, x, y + index * lineHeight));
  return Math.min(lines.length, maxLines);
}

async function composePolaroid() {
  if (!sourceCanvas || !destination) return;
  const context = elements.canvas.getContext("2d");
  const background = await loadImage(destination.image);
  const magnum = await loadImage("assets/magnum.png");
  const mpf = await loadImage("assets/mpf.png");
  const cutout = createCutout(Number(elements.strength.value));

  context.clearRect(0, 0, 1200, 1500);
  context.fillStyle = "#f7f1e7";
  context.fillRect(0, 0, 1200, 1500);
  context.save();
  context.beginPath();
  context.rect(70, 70, 1060, 1060);
  context.clip();
  drawCover(context, background, 70, 70, 1060, 1060);
  const shade = context.createLinearGradient(0, 70, 0, 1130);
  shade.addColorStop(0, "rgba(23,23,25,0)");
  shade.addColorStop(1, "rgba(23,23,25,.18)");
  context.fillStyle = shade;
  context.fillRect(70, 70, 1060, 1060);
  drawCover(context, cutout, 70, 70, 1060, 1060);
  context.restore();

  context.fillStyle = "#171719";
  context.font = "700 42px Courier New, monospace";
  const lineCount = wrapText(context, elements.reason.value.trim(), 84, 1208, 820, 50, 3);
  context.font = "700 21px Courier New, monospace";
  context.fillText(`${destination.name.toUpperCase()} · ${destination.country.toUpperCase()}`, 84, 1225 + lineCount * 50);
  context.font = "700 17px Courier New, monospace";
  context.fillText("VOCÊ ESTÁ AQUI · 2026", 84, 1260 + lineCount * 50);
  context.drawImage(magnum, 84, 1370, 88, 88);
  const mpfRatio = mpf.width / mpf.height;
  context.drawImage(mpf, 1200 - 84 - 115, 1386, 115, 115 / mpfRatio);
}

async function handlePhoto(file) {
  if (!file || !file.type.startsWith("image/")) return toast("ESCOLHA UMA IMAGEM VÁLIDA.");
  showStep("#processingStep");
  try {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    const image = await loadImage(objectUrl);
    const maxDimension = 1000;
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    sourceCanvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    sourceCanvas.getContext("2d").drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);
    await composePolaroid();
    showStep("#editorStep");
  } catch (error) {
    console.error(error);
    toast("NÃO FOI POSSÍVEL PROCESSAR ESTA FOTO.");
    showStep("#cameraStep");
  }
}

function canvasBlob() {
  return new Promise(resolve => elements.canvas.toBlob(resolve, "image/jpeg", .94));
}

async function downloadPhoto() {
  const blob = await canvasBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `voce-esta-aqui-${destination.id}.jpg`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast("FOTO BAIXADA. ELA ESTÁ NA GALERIA DO SEU CELULAR.");
}

async function sharePhoto(platform) {
  const blob = await canvasBlob();
  const file = new File([blob], `voce-esta-aqui-${destination.id}.jpg`, { type: "image/jpeg" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Você está aqui", text: `Minha viagem para ${destination.name}.` });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  await downloadPhoto();
  const urls = { instagram: "https://www.instagram.com/", facebook: "https://www.facebook.com/", tiktok: "https://www.tiktok.com/upload" };
  window.open(urls[platform], "_blank", "noopener");
  toast("A FOTO FOI BAIXADA. SELECIONE-A NO APLICATIVO DA REDE SOCIAL.");
}

async function finishExperience() {
  try { await request(`/api/sessions/${sessionId}/completed`, { method: "POST" }); }
  catch (error) { console.warn(error); }
  showStep("#endStep");
}

elements.reason.addEventListener("input", () => {
  const length = elements.reason.value.trim().length;
  elements.reasonCount.textContent = `${elements.reason.value.length} / 90`;
  elements.reasonContinue.disabled = length < 3;
});
elements.reasonContinue.addEventListener("click", () => showStep("#cameraStep"));
elements.cameraInput.addEventListener("change", event => handlePhoto(event.target.files[0]));
elements.galleryInput.addEventListener("change", event => handlePhoto(event.target.files[0]));
elements.strength.addEventListener("input", () => {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(composePolaroid);
});
elements.download.addEventListener("click", downloadPhoto);
document.querySelectorAll("[data-share]").forEach(button => button.addEventListener("click", () => sharePhoto(button.dataset.share)));
elements.finish.addEventListener("click", finishExperience);
window.addEventListener("beforeunload", () => { if (objectUrl) URL.revokeObjectURL(objectUrl); });

begin();
