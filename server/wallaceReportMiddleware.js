import {
  getWallaceReportCatalog,
  getWallaceReportOverview,
  getWallaceTableSample,
} from "./wallaceReportService.js";
import { getWallaceReportDatabaseConfig } from "./wallaceReportDatabaseConfig.js";

const API_PREFIX = "/api/v1/wallace-reports";

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const getDataDir = (env) =>
  env.WALLACE_REPORT_DATA_DIR ||
  process.env.WALLACE_REPORT_DATA_DIR ||
  "/Users/wentaoding/Downloads/database";

const getServiceOptions = (env) => {
  if (env.WALLACE_REPORT_DATA_DIR || process.env.WALLACE_REPORT_DATA_DIR) {
    return { dataDir: getDataDir(env) };
  }
  return {
    env,
    mysqlConfig: getWallaceReportDatabaseConfig(env),
  };
};

const routeRequest = async (req, res, env) => {
  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;
  const serviceOptions = getServiceOptions(env);

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Only GET requests are supported." });
    return;
  }

  if (pathname === `${API_PREFIX}/catalog`) {
    sendJson(res, 200, await getWallaceReportCatalog(serviceOptions));
    return;
  }

  if (pathname === `${API_PREFIX}/overview`) {
    sendJson(
      res,
      200,
      await getWallaceReportOverview({
        ...serviceOptions,
        month: url.searchParams.get("month") || "",
        zone: url.searchParams.get("zone") || "",
      }),
    );
    return;
  }

  const sampleMatch = pathname.match(
    /^\/api\/v1\/wallace-reports\/tables\/([^/]+)\/sample$/,
  );
  if (sampleMatch) {
    sendJson(
      res,
      200,
      await getWallaceTableSample({
        ...serviceOptions,
        tableId: decodeURIComponent(sampleMatch[1]),
        limit: url.searchParams.get("limit"),
      }),
    );
    return;
  }

  sendJson(res, 404, { error: "Wallace report endpoint not found." });
};

export const wallaceReportMiddleware = (env = {}) => async (req, res, next) => {
  if (!req.url?.startsWith(API_PREFIX)) {
    next();
    return;
  }

  try {
    await routeRequest(req, res, env);
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      error: error.message || "Wallace report request failed.",
    });
  }
};
