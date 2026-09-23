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
  cameraInput: $("#cameraInput"), galleryInput: $("#galleryInput"), canvas: $("#resultCanvas"), contrast: $("#photoContrast"),
  share: $("#shareButton"), download: $("#downloadButton"), finish: $("#finishButton"), toast: $("#mobileToast")
};

const transferParams = new URLSearchParams(location.search);
const destinationId = transferParams.get("destination");
let destination = null;
let sourceCanvas = null;
let objectUrl = null;
let renderFrame = null;
let renderedBlob = null;
let personMaskCanvas = null;
let modnetSession = null;
let segmentationEngine = "none";
let personSegmenter = null;
let pendingSegmentation = null;
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

async function begin() {
  if (!destinationId) return showStep("#errorStep");
  try {
    destination = destinations.find(item => item.id === destinationId);
    if (!destination) throw new Error("Destino inválido");
    elements.destinationImage.src = destination.image;
    elements.cameraDestinationImage.src = destination.image;
    elements.destinationName.textContent = destination.name.toUpperCase();
    await Promise.all([
      loadImage(destination.image),
      loadImage("assets/magnum.png"),
      loadImage("assets/mpf.png"),
      document.fonts?.load('400 64px "Reenie Beanie"') || Promise.resolve()
    ]);
    await initSegmentationEngine();
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

async function initSegmentationEngine() {
  try {
    if (!window.ort) throw new Error("ONNX Runtime indisponível");
    const runtimeBase = new URL("experiencia-2/vendor/onnxruntime/", document.baseURI);
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
    ort.env.wasm.wasmPaths = runtimeBase.href;
    const modelUrl = new URL("experiencia-2/vendor/modnet/model_fp16.onnx", document.baseURI);
    modnetSession = await ort.InferenceSession.create(modelUrl.href, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all"
    });
    segmentationEngine = "modnet";
  } catch (error) {
    console.warn("MODNet indisponível; usando recorte de contingência.", error);
    initPersonSegmenter();
    await personSegmenter.initialize();
    segmentationEngine = "mediapipe";
  }
}

function initPersonSegmenter() {
  if (personSegmenter) return;
  if (!window.SelfieSegmentation) throw new Error("Segmentador de pessoa indisponível");
  const assetBase = new URL("experiencia-2/vendor/selfie-segmentation/", document.baseURI);
  personSegmenter = new SelfieSegmentation({ locateFile: file => new URL(file, assetBase).href });
  personSegmenter.setOptions({ modelSelection: 0, selfieMode: false });
  personSegmenter.onResults(results => {
    if (!pendingSegmentation) return;
    try {
      const mask = document.createElement("canvas");
      mask.width = sourceCanvas.width;
      mask.height = sourceCanvas.height;
      mask.getContext("2d").drawImage(results.segmentationMask, 0, 0, mask.width, mask.height);
      pendingSegmentation.resolve(mask);
    } catch (error) {
      pendingSegmentation.reject(error);
    } finally {
      pendingSegmentation = null;
    }
  });
}

function segmentPersonWithMediaPipe() {
  initPersonSegmenter();
  return new Promise((resolve, reject) => {
    pendingSegmentation = { resolve, reject };
    Promise.resolve(personSegmenter.send({ image: sourceCanvas })).catch(error => {
      if (pendingSegmentation) {
        pendingSegmentation = null;
        reject(error);
      }
    });
  });
}

async function segmentPersonWithModnet() {
  const sourceWidth = sourceCanvas.width;
  const sourceHeight = sourceCanvas.height;
  let scale = 512 / Math.min(sourceWidth, sourceHeight);
  if (Math.max(sourceWidth, sourceHeight) * scale > 896) scale = 896 / Math.max(sourceWidth, sourceHeight);
  const modelWidth = Math.max(32, Math.round(sourceWidth * scale / 32) * 32);
  const modelHeight = Math.max(32, Math.round(sourceHeight * scale / 32) * 32);
  const inputCanvas = document.createElement("canvas");
  inputCanvas.width = modelWidth;
  inputCanvas.height = modelHeight;
  const inputContext = inputCanvas.getContext("2d", { willReadFrequently: true });
  inputContext.imageSmoothingEnabled = true;
  inputContext.imageSmoothingQuality = "high";
  inputContext.drawImage(sourceCanvas, 0, 0, modelWidth, modelHeight);
  const rgba = inputContext.getImageData(0, 0, modelWidth, modelHeight).data;
  const planeSize = modelWidth * modelHeight;
  const input = new Float32Array(planeSize * 3);
  for (let pixel = 0; pixel < planeSize; pixel++) {
    const rgbaIndex = pixel * 4;
    input[pixel] = rgba[rgbaIndex] / 127.5 - 1;
    input[planeSize + pixel] = rgba[rgbaIndex + 1] / 127.5 - 1;
    input[planeSize * 2 + pixel] = rgba[rgbaIndex + 2] / 127.5 - 1;
  }
  const inputName = modnetSession.inputNames[0];
  const result = await modnetSession.run({
    [inputName]: new ort.Tensor("float32", input, [1, 3, modelHeight, modelWidth])
  });
  const matteTensor = result[modnetSession.outputNames[0]];
  const matteHeight = matteTensor.dims[matteTensor.dims.length - 2];
  const matteWidth = matteTensor.dims[matteTensor.dims.length - 1];
  const matteCanvas = document.createElement("canvas");
  matteCanvas.width = matteWidth;
  matteCanvas.height = matteHeight;
  const matteContext = matteCanvas.getContext("2d");
  const matteImage = matteContext.createImageData(matteWidth, matteHeight);
  for (let pixel = 0; pixel < matteWidth * matteHeight; pixel++) {
    const value = Math.round(Math.max(0, Math.min(1, matteTensor.data[pixel])) * 255);
    const index = pixel * 4;
    matteImage.data[index] = value;
    matteImage.data[index + 1] = value;
    matteImage.data[index + 2] = value;
    matteImage.data[index + 3] = 255;
  }
  matteContext.putImageData(matteImage, 0, 0);
  const mask = document.createElement("canvas");
  mask.width = sourceWidth;
  mask.height = sourceHeight;
  const maskContext = mask.getContext("2d");
  maskContext.imageSmoothingEnabled = true;
  maskContext.imageSmoothingQuality = "high";
  maskContext.drawImage(matteCanvas, 0, 0, sourceWidth, sourceHeight);
  return mask;
}

async function segmentPerson() {
  if (segmentationEngine === "modnet" && modnetSession) {
    try {
      return await segmentPersonWithModnet();
    } catch (error) {
      console.warn("Falha no MODNet; ativando recorte de contingência.", error);
      initPersonSegmenter();
      await personSegmenter.initialize();
      segmentationEngine = "mediapipe";
    }
  }
  return segmentPersonWithMediaPipe();
}

function createCutout(strength) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const context = sourceCanvas.getContext("2d", { willReadFrequently: true });
  const source = context.getImageData(0, 0, width, height);
  const output = new ImageData(new Uint8ClampedArray(source.data), width, height);
  if (strength <= 1 || !personMaskCanvas) {
    const original = document.createElement("canvas");
    original.width = width;
    original.height = height;
    original.getContext("2d").putImageData(output, 0, 0);
    return original;
  }

  const maskContext = personMaskCanvas.getContext("2d", { willReadFrequently: true });
  const mask = maskContext.getImageData(0, 0, width, height).data;
  let alphaMin = 255, alphaMax = 0, lightMin = 255, lightMax = 0;
  for (let index = 0; index < mask.length; index += 64) {
    const light = (mask[index] + mask[index + 1] + mask[index + 2]) / 3;
    alphaMin = Math.min(alphaMin, mask[index + 3]);
    alphaMax = Math.max(alphaMax, mask[index + 3]);
    lightMin = Math.min(lightMin, light);
    lightMax = Math.max(lightMax, light);
  }
  const useAlpha = alphaMax - alphaMin > lightMax - lightMin;
  const cutoff = segmentationEngine === "modnet"
    ? (strength / 105) * .08
    : .02 + (strength / 105) * .16;
  const feather = .06;
  for (let index = 0; index < output.data.length; index += 4) {
    const probability = useAlpha
      ? mask[index + 3] / 255
      : (mask[index] + mask[index + 1] + mask[index + 2]) / (3 * 255);
    const matte = segmentationEngine === "modnet"
      ? Math.pow(Math.max(0, Math.min(1, (probability - cutoff) / (1 - cutoff))), .9)
      : (() => {
          const ratio = Math.max(0, Math.min(1, (probability - cutoff + feather) / (feather * 2)));
          return ratio * ratio * (3 - 2 * ratio);
        })();
    output.data[index + 3] = Math.round(source.data[index + 3] * matte);
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
  renderedBlob = null;
  const context = elements.canvas.getContext("2d");
  const background = await loadImage(destination.image);
  const magnum = await loadImage("assets/magnum.png");
  const mpf = await loadImage("assets/mpf.png");
  const cutout = createCutout(54);

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
  context.filter = `contrast(${Number(elements.contrast.value)}%)`;
  drawCover(context, cutout, 70, 70, 1060, 1060);
  context.filter = "none";
  context.restore();

  context.fillStyle = "#171719";
  context.font = '400 64px "Reenie Beanie", "Courier New", monospace';
  wrapText(context, elements.reason.value.trim(), 84, 1195, 900, 58, 3);
  context.font = "700 21px Courier New, monospace";
  context.fillText(`${destination.name.toUpperCase()} · ${destination.country.toUpperCase()}`, 84, 1352);
  context.font = "700 17px Courier New, monospace";
  context.fillText("VOCÊ ESTÁ AQUI · 2026", 84, 1384);
  context.drawImage(magnum, 84, 1405, 72, 72);
  const mpfRatio = mpf.width / mpf.height;
  context.drawImage(mpf, 1200 - 84 - 96, 1420, 96, 96 / mpfRatio);
  elements.canvas.toBlob(blob => { renderedBlob = blob; }, "image/jpeg", .94);
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
    personMaskCanvas = null;
    personMaskCanvas = await segmentPerson();
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

async function photoFile() {
  const blob = renderedBlob || await canvasBlob();
  return new File([blob], `voce-esta-aqui-${destination.id}.jpg`, { type: "image/jpeg" });
}

function canShareFile(file) {
  return Boolean(navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] })));
}

async function savePhoto() {
  const file = renderedBlob
    ? new File([renderedBlob], `voce-esta-aqui-${destination.id}.jpg`, { type: "image/jpeg" })
    : await photoFile();
  const isiOS = /iP(ad|hone|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isiOS && canShareFile(file)) {
    try {
      await navigator.share({ files: [file], title: "Salvar sua Polaroid" });
      toast("PARA GUARDAR EM FOTOS, ESCOLHA SALVAR IMAGEM.");
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  const blob = file;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `voce-esta-aqui-${destination.id}.jpg`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast("FOTO SALVA. VERIFIQUE A GALERIA OU A PASTA DE DOWNLOADS.");
}

async function sharePhoto() {
  const file = renderedBlob
    ? new File([renderedBlob], `voce-esta-aqui-${destination.id}.jpg`, { type: "image/jpeg" })
    : await photoFile();
  if (canShareFile(file)) {
    try {
      await navigator.share({ files: [file], title: "Você está aqui", text: `Minha viagem para ${destination.name}.` });
      toast("POLAROID COMPARTILHADA.");
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  await savePhoto();
  toast("A FOTO FOI SALVA. ABRA SUA REDE SOCIAL E SELECIONE-A.");
}

function finishExperience() {
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
elements.contrast.addEventListener("input", () => {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(composePolaroid);
});
elements.download.addEventListener("click", savePhoto);
elements.share.addEventListener("click", sharePhoto);
elements.finish.addEventListener("click", finishExperience);
window.addEventListener("beforeunload", () => { if (objectUrl) URL.revokeObjectURL(objectUrl); });

begin();
