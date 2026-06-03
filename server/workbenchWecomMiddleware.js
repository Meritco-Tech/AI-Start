import { workbenchWecomConnection } from "../src/config/workbenchConnections.js";

const API_PREFIX = "/api/v1/workbench/wecom";
const WECOM_API_ORIGIN = "https://qyapi.weixin.qq.com";
const WECOM_SPACE_LIST_ENDPOINTS = [
  "/cgi-bin/wedrive/space/list",
  "/cgi-bin/wedrive/space_list",
];

const demoSpaces = [
  {
    id: "demo-wecom-space",
    name: "企业微信协作空间",
    type: "演示空间",
    fileCount: 4,
    updatedAt: "今天",
  },
];

const demoFiles = [
  {
    id: "wecom-doc-market-weekly",
    name: "市场研究周报",
    label: "文档",
    type: "document",
    owner: "市场研究",
    updatedAt: "12 分钟前",
    size: "18 页",
    status: "已同步",
    columns: [
      { name: "文件类型", type: "在线文档", key: "DOC" },
      { name: "负责人", type: "市场研究", key: "" },
      { name: "更新时间", type: "12 分钟前", key: "" },
      { name: "同步状态", type: "已同步", key: "" },
    ],
  },
  {
    id: "wecom-sheet-sales-pipeline",
    name: "客户经营数据看板",
    label: "表格",
    type: "spreadsheet",
    owner: "增长分析",
    updatedAt: "25 分钟前",
    size: "12 工作表",
    status: "已同步",
    columns: [
      { name: "文件类型", type: "在线表格", key: "SHEET" },
      { name: "工作表数量", type: "12", key: "" },
      { name: "负责人", type: "增长分析", key: "" },
      { name: "同步状态", type: "已同步", key: "" },
    ],
  },
  {
    id: "wecom-sheet-finance-index",
    name: "财务指标跟踪表",
    label: "表格",
    type: "spreadsheet",
    owner: "财务分析",
    updatedAt: "1 小时前",
    size: "8 工作表",
    status: "已同步",
    columns: [
      { name: "文件类型", type: "在线表格", key: "SHEET" },
      { name: "工作表数量", type: "8", key: "" },
      { name: "负责人", type: "财务分析", key: "" },
      { name: "同步状态", type: "已同步", key: "" },
    ],
  },
  {
    id: "wecom-doc-risk-playbook",
    name: "经营风险分析手册",
    label: "文档",
    type: "document",
    owner: "策略分析",
    updatedAt: "今天",
    size: "32 页",
    status: "已同步",
    columns: [
      { name: "文件类型", type: "在线文档", key: "DOC" },
      { name: "负责人", type: "策略分析", key: "" },
      { name: "更新时间", type: "今天", key: "" },
      { name: "同步状态", type: "已同步", key: "" },
    ],
  },
];

let runtimeEnv = process.env;
const tokenCache = new Map();

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const getConnectionConfig = (connectionId) => {
  if (connectionId && connectionId !== workbenchWecomConnection.id) {
    const error = new Error(`Unknown workbench WeCom connection: ${connectionId}`);
    error.statusCode = 404;
    throw error;
  }
  return workbenchWecomConnection;
};

const hasCredentials = (config) =>
  Boolean(
    runtimeEnv[config.credentialEnv.corpId] &&
      runtimeEnv[config.credentialEnv.secret],
  );

const getCredential = (config, key) =>
  runtimeEnv[config.credentialEnv[key]] || process.env[config.credentialEnv[key]];

const getDefaultSpaceId = () =>
  runtimeEnv.WORKBENCH_WECOM_DEFAULT_SPACE_ID ||
  process.env.WORKBENCH_WECOM_DEFAULT_SPACE_ID ||
  "";

const parseConfiguredSpaces = () => {
  const rawSpaces =
    runtimeEnv.WORKBENCH_WECOM_SPACES || process.env.WORKBENCH_WECOM_SPACES || "";
  const defaultSpaceId = getDefaultSpaceId();
  if (!rawSpaces.trim()) {
    return defaultSpaceId
      ? [
          {
            id: defaultSpaceId,
            name: `企业微信空间 ${defaultSpaceId}`,
            type: "默认空间",
            fileCount: 0,
            updatedAt: "已配置",
          },
        ]
      : [];
  }
  return rawSpaces
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [id, name] = item.split(":");
      return {
        id,
        name: name || id,
        type: "已配置空间",
        fileCount: 0,
        updatedAt: "已配置",
      };
    });
};

const getAccessToken = async (config) => {
  const corpId = getCredential(config, "corpId");
  const secret = getCredential(config, "secret");
  if (!corpId || !secret) {
    const error = new Error("Missing WeCom corp id or application secret.");
    error.statusCode = 500;
    throw error;
  }

  const cached = tokenCache.get(config.id);
  if (cached && cached.expiresAt > Date.now() + 60000) return cached.token;

  const tokenUrl = new URL("/cgi-bin/gettoken", WECOM_API_ORIGIN);
  tokenUrl.searchParams.set("corpid", corpId);
  tokenUrl.searchParams.set("corpsecret", secret);
  const response = await fetch(tokenUrl);
  const data = await response.json();
  if (!response.ok || data.errcode !== 0 || !data.access_token) {
    const error = new Error(data.errmsg || "WeCom access token request failed.");
    error.statusCode = response.ok ? 502 : response.status;
    throw error;
  }

  tokenCache.set(config.id, {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(Number(data.expires_in || 7200) - 120, 60) * 1000,
  });
  return data.access_token;
};

const normalizeWecomFileType = (file) => {
  const rawType = String(file.file_type || file.fileType || file.type || "");
  if (["4", "spreadsheet", "sheet", "xls", "xlsx"].includes(rawType)) {
    return { label: "表格", type: "spreadsheet", key: "SHEET" };
  }
  if (["3", "document", "doc", "docx"].includes(rawType)) {
    return { label: "文档", type: "document", key: "DOC" };
  }
  return { label: "文件", type: "file", key: "FILE" };
};

const formatWecomTime = (value) => {
  const timestamp = Number(value || 0);
  if (!timestamp) return "未知";
  return new Date(timestamp * 1000).toISOString().slice(0, 19).replace("T", " ");
};

const normalizeWecomFile = (file) => {
  const fileType = normalizeWecomFileType(file);
  const fileName = file.file_name || file.filename || file.name || "未命名文件";
  const updatedAt = formatWecomTime(file.update_time || file.modified_time || file.create_time);
  return {
    id: file.fileid || file.file_id || file.id || fileName,
    name: fileName,
    label: fileType.label,
    type: fileType.type,
    owner: file.creator || file.owner || file.userid || "企业微信",
    updatedAt,
    size: fileType.type === "spreadsheet" ? "在线表格" : "在线文档",
    status: "真实同步",
    columns: [
      { name: "文件类型", type: fileType.label, key: fileType.key },
      { name: "负责人", type: file.creator || file.owner || file.userid || "企业微信", key: "" },
      { name: "更新时间", type: updatedAt, key: "" },
      { name: "同步状态", type: "真实同步", key: "" },
    ],
  };
};

const normalizeWecomSpace = (space) => ({
  id: space.spaceid || space.space_id || space.id || space.name || "unknown-space",
  name: space.space_name || space.spacename || space.name || "未命名空间",
  type: space.space_type || space.type || "企业微信空间",
  fileCount: Number(space.file_count || space.fileCount || space.files || 0),
  updatedAt: formatWecomTime(space.update_time || space.modified_time || space.create_time),
});

const requestWecomJson = async (endpoint, accessToken, body = {}) => {
  const url = new URL(endpoint, WECOM_API_ORIGIN);
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    const parseError = new Error(`Invalid JSON response from WeCom: ${text.slice(0, 120)}`);
    parseError.statusCode = response.status || 502;
    throw parseError;
  }
  if (!response.ok || data.errcode !== 0) {
    const error = new Error(data.errmsg || "WeCom request failed.");
    error.statusCode = response.ok ? 502 : response.status;
    error.data = data;
    throw error;
  }
  return data;
};

const listRealSpaces = async (config) => {
  const accessToken = await getAccessToken(config);
  const errors = [];
  for (const endpoint of WECOM_SPACE_LIST_ENDPOINTS) {
    try {
      const data = await requestWecomJson(endpoint, accessToken, {
        start: 0,
        limit: 100,
      });
      const spaces = data.space_list || data.spaces || data.space_info || [];
      return (Array.isArray(spaces) ? spaces : [spaces]).map(normalizeWecomSpace);
    } catch (error) {
      errors.push(`${endpoint}: ${error.message}`);
    }
  }
  const error = new Error(errors.join("; "));
  error.statusCode = 502;
  throw error;
};

const listRealFiles = async (config, spaceId, fatherId = "") => {
  if (!spaceId) {
    const error = new Error("WeCom space id is required before listing files.");
    error.statusCode = 400;
    throw error;
  }
  const effectiveFatherId = fatherId || spaceId;
  const accessToken = await getAccessToken(config);
  const requestBody = {
    spaceid: spaceId,
    fatherid: effectiveFatherId,
    sort_type: 1,
    start: 0,
    limit: 100,
  };
  const data = await requestWecomJson("/cgi-bin/wedrive/file_list", accessToken, requestBody);
  const files = data.file_list || data.files || [];
  return {
    requestBody,
    files: files.map(normalizeWecomFile),
  };
};

const getSpaces = async (config) => {
  const configuredSpaces = parseConfiguredSpaces();
  if (configuredSpaces.length) {
    return {
      mode: "configured",
      spaces: configuredSpaces,
      message: "Loaded spaces from WORKBENCH_WECOM_SPACES.",
    };
  }

  if (!hasCredentials(config)) {
    return {
      mode: "demo",
      spaces: demoSpaces,
      message: "WeCom credentials are not configured.",
    };
  }

  try {
    const spaces = await listRealSpaces(config);
    return {
      mode: "api-connected",
      spaces,
      message: spaces.length
        ? "Loaded spaces from WeCom API."
        : "WeCom API connected, but no accessible spaces were returned.",
    };
  } catch (error) {
    return {
      mode: "api-connected-with-demo-fallback",
      spaces: demoSpaces,
      message: `WeCom does not expose a usable space-list response here. Configure WORKBENCH_WECOM_SPACES with known space ids. Detail: ${error.message}`,
    };
  }
};

const getFiles = async (config, spaceId, fatherId) => {
  const effectiveSpaceId = spaceId || getDefaultSpaceId();
  if (!hasCredentials(config)) {
    return {
      mode: "demo",
      files: demoFiles,
      message: "WeCom credentials are not configured.",
    };
  }

  try {
    const result = await listRealFiles(config, effectiveSpaceId, fatherId);
    return {
      mode: "api-connected",
      files: result.files,
      spaceId: effectiveSpaceId,
      requestBody: result.requestBody,
      message: result.files.length
        ? "Loaded files from WeCom API."
        : "WeCom API connected, but no document or spreadsheet files were returned.",
    };
  } catch (error) {
    const requestBody = effectiveSpaceId
      ? {
          spaceid: effectiveSpaceId,
          fatherid: fatherId || effectiveSpaceId,
          sort_type: 1,
          start: 0,
          limit: 100,
        }
      : null;
    return {
      mode: "api-connected-with-demo-fallback",
      files: demoFiles,
      spaceId: effectiveSpaceId,
      requestBody,
      message: `Real WeCom file listing is unavailable: ${error.message}`,
    };
  }
};

const getConnectionSummary = async (config) => {
  const configured = hasCredentials(config);
  let tokenStatus = "missing";
  let message = "WeCom credentials are not configured.";
  if (configured) {
    try {
      await getAccessToken(config);
      tokenStatus = "connected";
      message = "WeCom application token connected.";
    } catch (error) {
      tokenStatus = "failed";
      message = error.message;
    }
  }
  return {
    id: config.id,
    name: config.name,
    type: config.type,
    description: config.description,
    credentialStatus: configured ? "configured" : "missing",
    tokenStatus,
    mode: tokenStatus === "connected" ? "api-connected" : "demo",
    message,
    files: demoFiles.length,
    documents: demoFiles.filter((file) => file.type === "document").length,
    spreadsheets: demoFiles.filter((file) => file.type === "spreadsheet").length,
  };
};

export const workbenchWecomMiddleware = (env = process.env) => {
  runtimeEnv = env;
  return async (req, res, next) => {
    if (!req.url?.startsWith(API_PREFIX)) {
      next();
      return;
    }

    try {
      const url = new URL(req.url, "http://localhost");
      const path = url.pathname;
      const connectionId =
        url.searchParams.get("connection_id") ||
        url.searchParams.get("connectionId") ||
        workbenchWecomConnection.id;
      const config = getConnectionConfig(connectionId);

      if (req.method === "POST" && path === `${API_PREFIX}/connect`) {
        sendJson(res, 200, await getConnectionSummary(config));
        return;
      }

      if (req.method === "GET" && path === `${API_PREFIX}/files`) {
        const result = await getFiles(
          config,
          url.searchParams.get("space_id") || url.searchParams.get("spaceid"),
          url.searchParams.get("father_id") || url.searchParams.get("fatherid") || "",
        );
        sendJson(res, 200, {
          connectionId: config.id,
          ...result,
        });
        return;
      }

      if (req.method === "GET" && path === `${API_PREFIX}/spaces`) {
        const result = await getSpaces(config);
        sendJson(res, 200, {
          connectionId: config.id,
          ...result,
        });
        return;
      }

      sendJson(res, 404, { message: "Workbench WeCom endpoint not found." });
    } catch (error) {
      sendJson(res, error.statusCode || 500, {
        message: error.message || "Workbench WeCom request failed.",
      });
    }
  };
};
