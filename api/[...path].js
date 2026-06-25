import { apiHandlers } from "../server/api/manifest.js";

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const getRoutePath = (req) => {
  const pathParam = req.query?.path;

  if (Array.isArray(pathParam)) {
    return pathParam.join("/");
  }

  if (typeof pathParam === "string" && pathParam) {
    return pathParam;
  }

  const url = new URL(
    req.url || "/",
    `http://${req.headers.host || "localhost"}`
  );

  return url.pathname.replace(/^\/api\/?/, "");
};

const removeRouteParamFromQuery = (req) => {
  if (!req.query || !Object.prototype.hasOwnProperty.call(req.query, "path")) {
    return;
  }

  const { path: _path, ...query } = req.query;
  req.query = query;
};

export default async function handler(req, res) {
  const routePath = getRoutePath(req).replace(/^\/+|\/+$/g, "");
  const routeHandler = apiHandlers[routePath];

  if (!routeHandler) {
    return sendJson(res, 404, { message: "API route not found." });
  }
  
  if (req.headers["authorization"] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  removeRouteParamFromQuery(req);
  return routeHandler(req, res);
}
