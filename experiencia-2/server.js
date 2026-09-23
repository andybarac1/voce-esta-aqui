const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const QRCode = require("qrcode");

const port = Number(process.env.PORT || 8081);
const host = process.env.HOST || "0.0.0.0";
const publicRoot = path.resolve(__dirname, "..");
const sessions = new Map();
const sessionLifetime = 1000 * 60 * 90;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function json(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", chunk => {
      raw += chunk;
      if (raw.length > 100_000) request.destroy();
    });
    request.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (error) { reject(error); }
    });
    request.on("error", reject);
  });
}

function getBaseUrl(request) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  const forwarded = request.headers["x-forwarded-proto"];
  const protocol = forwarded || "http";
  const requestHost = request.headers.host || `localhost:${port}`;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(requestHost)) {
    const privateAddresses = Object.values(os.networkInterfaces()).flat().filter(item => item && item.family === "IPv4" && !item.internal && /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(item.address));
    const address = privateAddresses.find(item => !item.address.endsWith(".1")) || privateAddresses[0];
    if (address) return `${protocol}://${address.address}:${port}`;
  }
  return `${protocol}://${requestHost}`;
}

async function handleApi(request, response, url) {
  if (request.method === "POST" && url.pathname === "/api/sessions") {
    const body = await readBody(request);
    if (!body.destinationId) return json(response, 400, { error: "Destino obrigatório." });
    const id = crypto.randomBytes(6).toString("hex");
    const mobileUrl = `${getBaseUrl(request)}/experiencia-2/mobile.html?session=${id}`;
    const session = {
      id,
      destinationId: String(body.destinationId),
      status: "waiting",
      createdAt: Date.now(),
      enteredAt: null,
      completedAt: null
    };
    sessions.set(id, session);
    const qrCode = await QRCode.toDataURL(mobileUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 520,
      color: { dark: "#171719", light: "#fffdf8" }
    });
    return json(response, 201, { session: { ...session, mobileUrl }, qrCode });
  }

  const match = url.pathname.match(/^\/api\/sessions\/([a-f0-9]{12})(?:\/(entered|completed))?$/);
  if (!match) return json(response, 404, { error: "Sessão não encontrada." });
  const session = sessions.get(match[1]);
  if (!session) return json(response, 404, { error: "Sessão expirada ou inexistente." });

  if (request.method === "GET" && !match[2]) return json(response, 200, { session });
  if (request.method === "POST" && match[2] === "entered") {
    session.status = "entered";
    session.enteredAt ||= Date.now();
    return json(response, 200, { session });
  }
  if (request.method === "POST" && match[2] === "completed") {
    session.status = "completed";
    session.completedAt = Date.now();
    return json(response, 200, { session });
  }
  return json(response, 405, { error: "Método não permitido." });
}

function serveStatic(response, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/experiencia-2") pathname = "/experiencia-2/";
  if (pathname.endsWith("/")) pathname += "index.html";
  const filePath = path.resolve(publicRoot, `.${pathname}`);
  if (!filePath.startsWith(publicRoot)) {
    response.writeHead(403);
    return response.end("Acesso negado");
  }
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return response.end("Arquivo não encontrado");
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": filePath.endsWith(".html") ? "no-store" : "public, max-age=300"
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) return await handleApi(request, response, url);
    serveStatic(response, url);
  } catch (error) {
    console.error(error);
    json(response, 500, { error: "Erro interno." });
  }
});

setInterval(() => {
  const cutoff = Date.now() - sessionLifetime;
  for (const [id, session] of sessions) if (session.createdAt < cutoff) sessions.delete(id);
}, 60_000).unref();

server.listen(port, host, () => {
  const addresses = Object.values(os.networkInterfaces()).flat().filter(item => item && item.family === "IPv4" && !item.internal);
  console.log(`Experiência 2: http://localhost:${port}/experiencia-2/`);
  for (const address of addresses) console.log(`TV e celular: http://${address.address}:${port}/experiencia-2/`);
});
