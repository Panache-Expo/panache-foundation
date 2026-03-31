import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const LOCAL_API_PORT = Number(process.env.LOCAL_API_PORT || 8787);
const DEBUG_LOCAL_API = process.env.DEBUG_LOCAL_API === "true";

const loadEnvFile = (fileName) => {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const fileContent = readFileSync(filePath, "utf8");

  for (const rawLine of fileContent.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    const value = line.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

loadEnvFile(".env");
loadEnvFile(".env.local");

const { default: sendRegistrationEmailHandler } = await import(
  "../api/send-registration-email.js"
);
const { default: dashboardApplicationsHandler } = await import(
  "../api/dashboard-applications.js"
);

const parseBody = (rawBody) => {
  if (!rawBody) {
    return undefined;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
};

const createResponseAdapter = (res) => {
  let statusCode = 200;

  return {
    setHeader(name, value) {
      res.setHeader(name, value);
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      if (!res.headersSent) {
        res.statusCode = statusCode;
        res.setHeader("Content-Type", "application/json");
      }

      res.end(JSON.stringify(payload));
    },
  };
};

const logRequest = ({ method, pathname, statusCode, durationMs }) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${method} ${pathname} -> ${statusCode} (${durationMs}ms)`
  );
};

const logDebugRequest = ({ method, pathname, headers, body }) => {
  if (!DEBUG_LOCAL_API) {
    return;
  }

  console.log(`[local-api:debug] ${method} ${pathname}`);
  console.log("[local-api:debug] headers", headers);
  console.log("[local-api:debug] body", body);
};

const collectRequestBody = async (req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
};

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-dashboard-key");

  const startedAt = Date.now();
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    logRequest({
      method: req.method || "UNKNOWN",
      pathname: req.url || "/",
      statusCode: 204,
      durationMs: Date.now() - startedAt,
    });
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const rawBody =
    req.method === "POST" || req.method === "PATCH"
      ? await collectRequestBody(req)
      : "";

  req.body = parseBody(rawBody);
  logDebugRequest({
    method: req.method || "UNKNOWN",
    pathname: url.pathname,
    headers: req.headers,
    body: req.body,
  });
  const response = createResponseAdapter(res);

  try {
    if (url.pathname === "/api/send-registration-email") {
      await sendRegistrationEmailHandler(req, response);
      logRequest({
        method: req.method || "UNKNOWN",
        pathname: url.pathname,
        statusCode: res.statusCode || 200,
        durationMs: Date.now() - startedAt,
      });
      return;
    }

    if (url.pathname === "/api/dashboard-applications") {
      await dashboardApplicationsHandler(req, response);
      logRequest({
        method: req.method || "UNKNOWN",
        pathname: url.pathname,
        statusCode: res.statusCode || 200,
        durationMs: Date.now() - startedAt,
      });
      return;
    }
  } catch (error) {
    console.error(`[local-api:error] ${req.method || "UNKNOWN"} ${url.pathname}`, error);
    response.status(500).json({ message: "Local API server error." });
    logRequest({
      method: req.method || "UNKNOWN",
      pathname: url.pathname,
      statusCode: 500,
      durationMs: Date.now() - startedAt,
    });
    return;
  }

  response.status(404).json({ message: "Local API route not found." });
  logRequest({
    method: req.method || "UNKNOWN",
    pathname: url.pathname,
    statusCode: 404,
    durationMs: Date.now() - startedAt,
  });
});

server.listen(LOCAL_API_PORT, () => {
  console.log(`Local API server running on http://localhost:${LOCAL_API_PORT}`);
});

process.on("unhandledRejection", (reason) => {
  console.error("[local-api:unhandledRejection]", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[local-api:uncaughtException]", error);
});
