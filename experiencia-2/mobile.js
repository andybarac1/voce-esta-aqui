const legacyDestinations = [
  { id: "paris", name: "Paris", country: "França", code: "PAR", image: "assets/destinations/paris.jpg" },
  { id: "china", name: "Muralha da China", country: "China", code: "PEK", image: "assets/china.jpg" },
  { id: "roma", name: "Roma", country: "Itália", code: "ROM", image: "assets/destinations/roma.jpg" },
  { id: "dubai", name: "Dubai", country: "Emirados Árabes", code: "DXB", image: "assets/dubai.jpg" },
  { id: "egito", name: "Pirâmides de Gizé", country: "Egito", code: "CAI", image: "assets/egito.jpg" },
  { id: "fuji", name: "Monte Fuji", country: "Japão", code: "FJI", image: "assets/fuji.jpg" },
  { id: "hollywood", name: "Hollywood", country: "Estados Unidos", code: "LAX", image: "assets/hollywood.jpg" },
  { id: "italia", name: "Torre de Pisa", country: "Itália", code: "PSA", image: "assets/italia.jpg" },
  { id: "jerusalem", name: "Jerusalém", country: "Israel", code: "JRS", image: "assets/jerusalem.jpg" },
  { id: "lisboa", name: "Lisboa", country: "Portugal", code: "LIS", image: "assets/destinations/lisboa.jpg" },
  { id: "machu-picchu", name: "Machu Picchu", country: "Peru", code: "CUZ", image: "assets/machu-picchu.jpg" },
  { id: "madrid", name: "Madri", country: "Espanha", code: "MAD", image: "assets/madrid.jpg" },
  { id: "masp-sp", name: "MASP", country: "São Paulo, Brasil", code: "SAO", image: "assets/masp-sp.jpg" },
  { id: "moscou", name: "Moscou", country: "Rússia", code: "MOW", image: "assets/moscou.jpg" },
  { id: "nova-yorke", name: "Nova York", country: "Estados Unidos", code: "NYC", image: "assets/destinations/nova-yorke.jpg" },
  { id: "rio-de-janeiro", name: "Rio de Janeiro", country: "Brasil", code: "RIO", image: "assets/destinations/rio-de-janeiro.jpg" },
  { id: "savana-africana", name: "Savana Africana", country: "Quênia", code: "NBO", image: "assets/savana-africana.jpg" }
];

const destinations = window.MPF_DESTINATIONS || legacyDestinations;

const $ = selector => document.querySelector(selector);
const steps = ["#sessionLoading", "#reasonStep", "#cameraStep", "#processingStep", "#editorStep", "#endStep", "#errorStep"];
const elements = {
  reasonStep: $("#reasonStep"), reason: $("#travelReason"), reasonCount: $("#reasonCount"), reasonContinue: $("#reasonContinue"),
  destinationImage: $("#mobileDestinationImage"), destinationName: $("#mobileDestinationName"), destinationCredit: $("#mobileDestinationCredit"), cameraDestinationImage: $("#cameraDestinationImage"), cameraDestinationCredit: $("#cameraDestinationCredit"),
  cameraInput: $("#cameraInput"), galleryInput: $("#galleryInput"), canvas: $("#resultCanvas"),
  share: $("#shareButton"), resetPortrait: $("#resetPortrait"), download: $("#downloadButton"), finish: $("#finishButton"), toast: $("#mobileToast")
};

const transferParams = new URLSearchParams(location.search);
const destinationId = transferParams.get("destination");
let destination = null;
let sourceCanvas = null;
let renderFrame = null;
let renderedBlob = null;
let personMaskCanvas = null;
let cutoutCanvas = null;
let modnetSession = null;
let segmentationEngine = "none";
let personSegmenter = null;
let pendingSegmentation = null;
const assetCache = new Map();
const defaultPortraitTransform = { x: 255, y: 230, scale: 1, rotation: 0 };
const portraitTransform = { ...defaultPortraitTransform };
const activePointers = new Map();
let gestureStart = null;

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
    window.MPFImageCredits?.apply(elements.destinationCredit, destination.id);
    window.MPFImageCredits?.apply(elements.cameraDestinationCredit, destination.id);
    await Promise.all([
      loadImage(destination.image),
      loadImage("assets/exhibition-logo-white.svg?v=2"),
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

function drawPortrait(context, image, x, y, width, height) {
  const baseScale = Math.min((width * .46) / image.width, (height * .68) / image.height);
  const scale = baseScale * portraitTransform.scale;
  context.save();
  context.translate(x + width / 2 + portraitTransform.x, y + height / 2 + portraitTransform.y);
  context.rotate(portraitTransform.rotation);
  context.scale(scale, scale);
  context.drawImage(image, -image.width / 2, -image.height / 2);
  context.restore();
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
  const scale = Math.min(1, 512 / Math.max(sourceWidth, sourceHeight));
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
  const inputTensor = new ort.Tensor("float32", input, [1, 3, modelHeight, modelWidth]);
  let result;
  try {
    result = await modnetSession.run({ [inputName]: inputTensor });
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
  } finally {
    inputTensor.dispose?.();
    if (result) Object.values(result).forEach(tensor => tensor.dispose?.());
  }
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

function drawImageCredit(context, destinationId) {
  const credit = window.MPFImageCredits?.find(destinationId);
  if (!credit) return;
  const label = `FOTO: ${credit.author} · ${credit.license}`;
  let fontSize = 17;
  context.save();
  context.font = `700 ${fontSize}px "Courier New", monospace`;
  while (context.measureText(label).width > 920 && fontSize > 11) {
    fontSize -= 1;
    context.font = `700 ${fontSize}px "Courier New", monospace`;
  }
  const width = Math.ceil(context.measureText(label).width) + 22;
  const x = 1112 - width;
  const y = 1092;
  context.fillStyle = "rgba(23,23,25,.78)";
  context.fillRect(x, y, width, fontSize + 17);
  context.fillStyle = "#ffffff";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(label, x + 11, y + 8);
  context.restore();
}

function drawBlackExhibitionLogo(context, image, x, y, size) {
  const logoCanvas = document.createElement("canvas");
  logoCanvas.width = size;
  logoCanvas.height = size;
  const logoContext = logoCanvas.getContext("2d");
  logoContext.drawImage(image, 0, 0, size, size);
  logoContext.globalCompositeOperation = "source-in";
  logoContext.fillStyle = "#171719";
  logoContext.fillRect(0, 0, size, size);
  context.drawImage(logoCanvas, x, y);
}

async function composePolaroid(updateBlob = true) {
  if (!sourceCanvas || !destination) return;
  if (updateBlob) renderedBlob = null;
  const context = elements.canvas.getContext("2d");
  const background = await loadImage(destination.image);
  const exhibitionLogo = await loadImage("assets/exhibition-logo-white.svg?v=2");
  const cutout = cutoutCanvas || createCutout(54);

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
  drawPortrait(context, cutout, 70, 70, 1060, 1060);
  context.restore();
  drawImageCredit(context, destination.id);

  context.fillStyle = "#171719";
  context.font = '400 64px "Reenie Beanie", "Courier New", monospace';
  wrapText(context, elements.reason.value.trim(), 84, 1195, 900, 58, 3);
  context.font = "700 21px Courier New, monospace";
  context.fillText(`${destination.name.toUpperCase()} · ${destination.country.toUpperCase()}`, 84, 1322);
  context.font = "700 20px Courier New, monospace";
  context.fillText("Curadoria João Kulcsár", 84, 1358);
  context.fillText("Visitação: terça a domingo, 10h às 20h", 84, 1386);
  context.fillText("Até 4 de abril de 2027", 84, 1412);
  context.font = "700 21px Courier New, monospace";
  context.fillText("CENTRO CULTURAL FIESP", 84, 1450);
  context.fillText("GALERIA DE FOTOS", 84, 1476);
  const logoSize = 300;
  const logoArea = { x: 760, y: 1130, width: 370, height: 370 };
  drawBlackExhibitionLogo(
    context,
    exhibitionLogo,
    logoArea.x + (logoArea.width - logoSize) / 2,
    logoArea.y + (logoArea.height - logoSize) / 2,
    logoSize
  );
  if (updateBlob) elements.canvas.toBlob(blob => { renderedBlob = blob; }, "image/jpeg", .94);
}

function resetPortraitTransform(render = true) {
  Object.assign(portraitTransform, defaultPortraitTransform);
  if (render) composePolaroid(true);
}

function canvasPoint(event) {
  const rect = elements.canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * elements.canvas.width / rect.width,
    y: (event.clientY - rect.top) * elements.canvas.height / rect.height
  };
}

function pointerPair() {
  return Array.from(activePointers.values()).slice(0, 2);
}

function captureGestureStart() {
  const points = pointerPair();
  if (!points.length) {
    gestureStart = null;
    return;
  }
  if (points.length === 1) {
    gestureStart = { mode: "move", point: { ...points[0] }, transform: { ...portraitTransform } };
    return;
  }
  const [first, second] = points;
  gestureStart = {
    mode: "transform",
    center: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
    distance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
    angle: Math.atan2(second.y - first.y, second.x - first.x),
    transform: { ...portraitTransform }
  };
}

function scheduleComposition() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => composePolaroid(false));
}

function handlePointerDown(event) {
  const point = canvasPoint(event);
  if (point.x < 70 || point.x > 1130 || point.y < 70 || point.y > 1130) return;
  event.preventDefault();
  activePointers.set(event.pointerId, point);
  elements.canvas.setPointerCapture?.(event.pointerId);
  elements.canvas.classList.add("is-dragging");
  captureGestureStart();
}

function handlePointerMove(event) {
  if (!activePointers.has(event.pointerId) || !gestureStart) return;
  event.preventDefault();
  activePointers.set(event.pointerId, canvasPoint(event));
  const points = pointerPair();
  if (gestureStart.mode === "move" && points.length === 1) {
    portraitTransform.x = Math.max(-900, Math.min(900, gestureStart.transform.x + points[0].x - gestureStart.point.x));
    portraitTransform.y = Math.max(-900, Math.min(900, gestureStart.transform.y + points[0].y - gestureStart.point.y));
  } else if (gestureStart.mode === "transform" && points.length >= 2) {
    const [first, second] = points;
    const center = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
    const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
    const angle = Math.atan2(second.y - first.y, second.x - first.x);
    portraitTransform.x = Math.max(-900, Math.min(900, gestureStart.transform.x + center.x - gestureStart.center.x));
    portraitTransform.y = Math.max(-900, Math.min(900, gestureStart.transform.y + center.y - gestureStart.center.y));
    portraitTransform.scale = Math.max(.45, Math.min(2.8, gestureStart.transform.scale * distance / gestureStart.distance));
    portraitTransform.rotation = gestureStart.transform.rotation + angle - gestureStart.angle;
  }
  scheduleComposition();
}

function handlePointerEnd(event) {
  if (!activePointers.has(event.pointerId)) return;
  event.preventDefault();
  activePointers.delete(event.pointerId);
  if (elements.canvas.hasPointerCapture?.(event.pointerId)) elements.canvas.releasePointerCapture(event.pointerId);
  captureGestureStart();
  if (!activePointers.size) {
    elements.canvas.classList.remove("is-dragging");
    cancelAnimationFrame(renderFrame);
    composePolaroid(true);
  }
}

function readExifOrientation(bytes, markerOffset, segmentLength) {
  const segmentStart = markerOffset + 4;
  const segmentEnd = Math.min(bytes.length, markerOffset + 2 + segmentLength);
  if (segmentStart + 14 > segmentEnd) return null;
  if (bytes[segmentStart] !== 0x45 || bytes[segmentStart + 1] !== 0x78 ||
      bytes[segmentStart + 2] !== 0x69 || bytes[segmentStart + 3] !== 0x66 ||
      bytes[segmentStart + 4] !== 0 || bytes[segmentStart + 5] !== 0) return null;

  const tiffStart = segmentStart + 6;
  const littleEndian = bytes[tiffStart] === 0x49 && bytes[tiffStart + 1] === 0x49;
  const bigEndian = bytes[tiffStart] === 0x4d && bytes[tiffStart + 1] === 0x4d;
  if (!littleEndian && !bigEndian) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const readUint16 = offset => offset + 2 <= segmentEnd ? view.getUint16(offset, littleEndian) : null;
  const readUint32 = offset => offset + 4 <= segmentEnd ? view.getUint32(offset, littleEndian) : null;
  if (readUint16(tiffStart + 2) !== 0x2a) return null;
  const directoryOffset = readUint32(tiffStart + 4);
  if (directoryOffset === null) return null;
  const directoryStart = tiffStart + directoryOffset;
  const entryCount = readUint16(directoryStart);
  if (entryCount === null) return null;

  for (let index = 0; index < entryCount; index++) {
    const entryOffset = directoryStart + 2 + index * 12;
    if (entryOffset + 12 > segmentEnd) break;
    if (readUint16(entryOffset) !== 0x0112) continue;
    const orientation = readUint16(entryOffset + 8);
    return orientation >= 1 && orientation <= 8 ? orientation : null;
  }
  return null;
}

async function readImageDimensions(file) {
  const bytes = new Uint8Array(await file.slice(0, 524288).arrayBuffer());
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let orientation = 1;
    let offset = 2;
    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
      const length = (bytes[offset + 2] << 8) + bytes[offset + 3];
      if (length < 2 || offset + length + 2 > bytes.length) break;
      if (marker === 0xe1) {
        const exifOrientation = readExifOrientation(bytes, offset, length);
        if (exifOrientation) orientation = exifOrientation;
      }
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        const encodedHeight = (bytes[offset + 5] << 8) + bytes[offset + 6];
        const encodedWidth = (bytes[offset + 7] << 8) + bytes[offset + 8];
        const swapsAxes = orientation >= 5 && orientation <= 8;
        return swapsAxes
          ? { width: encodedHeight, height: encodedWidth }
          : { width: encodedWidth, height: encodedHeight };
      }
      offset += length + 2;
    }
  }
  return null;
}

async function decodePhotoWithImageElement(file, maxDimension) {
  const temporaryUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const candidate = new Image();
      candidate.onload = () => resolve(candidate);
      candidate.onerror = reject;
      candidate.src = temporaryUrl;
    });
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    image.src = "";
    return canvas;
  } finally {
    URL.revokeObjectURL(temporaryUrl);
  }
}

async function decodePhotoToCanvas(file, maxDimension = 900) {
  const dimensions = await readImageDimensions(file).catch(() => null);
  if (dimensions && window.createImageBitmap) {
    let bitmap = null;
    try {
      const scale = Math.min(1, maxDimension / Math.max(dimensions.width, dimensions.height));
      bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
        resizeWidth: Math.max(1, Math.round(dimensions.width * scale)),
        resizeHeight: Math.max(1, Math.round(dimensions.height * scale)),
        resizeQuality: "high"
      });
      const expectedRatio = dimensions.width / dimensions.height;
      const decodedRatio = bitmap.width / bitmap.height;
      if (Math.abs(expectedRatio - decodedRatio) / expectedRatio > .02) {
        throw new Error("A orientação da foto não foi preservada pelo navegador.");
      }
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d").drawImage(bitmap, 0, 0);
      return canvas;
    } catch (error) {
      console.warn("Redimensionamento otimizado indisponível; usando decodificação compatível.", error);
    } finally {
      bitmap?.close?.();
    }
  }
  return decodePhotoWithImageElement(file, maxDimension);
}

async function handlePhoto(file) {
  if (!file || !file.type.startsWith("image/")) return toast("ESCOLHA UMA IMAGEM VÁLIDA.");
  showStep("#processingStep");
  try {
    sourceCanvas = await decodePhotoToCanvas(file);
    personMaskCanvas = null;
    cutoutCanvas = null;
    personMaskCanvas = await segmentPerson();
    cutoutCanvas = createCutout(54);
    resetPortraitTransform(false);
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
      await navigator.share({ files: [file], title: "Salvar minha lembrança" });
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
      toast("LEMBRANÇA COMPARTILHADA.");
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
elements.download.addEventListener("click", savePhoto);
elements.share.addEventListener("click", sharePhoto);
elements.resetPortrait.addEventListener("click", () => resetPortraitTransform(true));
elements.canvas.addEventListener("pointerdown", handlePointerDown);
elements.canvas.addEventListener("pointermove", handlePointerMove);
elements.canvas.addEventListener("pointerup", handlePointerEnd);
elements.canvas.addEventListener("pointercancel", handlePointerEnd);
elements.finish.addEventListener("click", finishExperience);
begin();
