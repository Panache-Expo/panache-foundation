import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const apiDir = path.join(repoRoot, "api");
const port = Number(process.env.PORT || 8787);

const loadEnvFile = (filename) => {
  const filePath = path.join(repoRoot, filename);
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
};

loadEnvFile(".env");
loadEnvFile(".env.local");

const sendJson = (res, statusCode, payload) => {
  if (!res.headersSent) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  res.end(JSON.stringify(payload));
};

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-dashboard-key, x-dashboard-access-key"
  );
};

const parseBody = async (req) =>
  await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const rawBody = Buffer.concat(chunks).toString("utf8");
      if (!rawBody) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        resolve(rawBody);
      }
    });
    req.on("error", reject);
  });

const buildQueryObject = (url) => {
  const query = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (query[key] === undefined) {
      query[key] = value;
    } else if (Array.isArray(query[key])) {
      query[key].push(value);
    } else {
      query[key] = [query[key], value];
    }
  }
  return query;
};

const resolveHandlerModulePath = (pathname) => {
  if (!pathname.startsWith("/api/")) {
    return null;
  }

  const routeName = pathname.slice("/api/".length);
  if (!routeName || routeName.includes("/")) {
    return null;
  }

  const candidate = path.join(apiDir, `${routeName}.js`);
  return existsSync(candidate) ? candidate : null;
};

const logRequest = (req, pathname, statusCode, startedAt) => {
  const duration = Date.now() - startedAt;
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${pathname} -> ${statusCode} (${duration}ms)`
  );
};

const server = createServer(async (req, res) => {
  const startedAt = Date.now();
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const handlerPath = resolveHandlerModulePath(url.pathname);

  setCorsHeaders(req, res);

  res.on("finish", () => {
    logRequest(req, url.pathname, res.statusCode, startedAt);
  });

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (!handlerPath) {
    sendJson(res, 404, { message: "API route not found." });
    return;
  }

  try {
    const body = await parseBody(req);
    const moduleUrl = pathToFileURL(handlerPath).href;
    const imported = await import(moduleUrl);
    const handler = imported.default;

    if (typeof handler !== "function") {
      sendJson(res, 500, { message: "API handler is invalid." });
      return;
    }

    req.body = body;
    req.query = buildQueryObject(url);

    res.status = function status(code) {
      this.statusCode = code;
      return this;
    };

    res.json = function json(payload) {
      sendJson(this, this.statusCode || 200, payload);
      return this;
    };

    await handler(req, res);

    if (!res.writableEnded) {
      res.end();
    }
  } catch (error) {
    console.error("[local-api:error]", error);
    if (!res.writableEnded) {
      sendJson(res, 500, { message: "Local API server error." });
    }
  }
});

server.listen(port, () => {
  console.log(`Local API server running on http://localhost:${port}`);
});

process.on("unhandledRejection", (error) => {
  console.error("[local-api:unhandledRejection]", error);
});

process.on("uncaughtException", (error) => {
  console.error("[local-api:uncaughtException]", error);
});
