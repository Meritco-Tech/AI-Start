const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api/v1";

export const DEFAULT_USER_ID = import.meta.env.VITE_USER_ID || "10001";
export const API_BASE_URL = `${API_ORIGIN}${API_PREFIX}`;

const buildUrl = (path, params = {}) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

const parseResponse = async (response) => {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  return response.text();
};

export const request = async (path, options = {}) => {
  const { params, body, headers, ...rest } = options;
  const isFormData = body instanceof FormData;
  const response = await fetch(buildUrl(path, params), {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined || isFormData ? body : JSON.stringify(body),
  });
  const data = await parseResponse(response);
  if (!response.ok) {
    const message = data?.error || data?.message || response.statusText || "请求失败";
    throw new Error(message);
  }
  return data;
};

export const createStreamUrl = (jobId, params = {}) =>
  buildUrl(`/stream/${jobId}`, params);
