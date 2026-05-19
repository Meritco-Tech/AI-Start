import { request } from "./http";

export const DEEPSEEK_MODELS = [
  { label: "deepseek-v4-flash", value: "deepseek-v4-flash" },
  { label: "deepseek-v4-pro", value: "deepseek-v4-pro" },
];

export const DEEPSEEK_REASONING_EFFORTS = [
  { label: "high", value: "high" },
  { label: "max", value: "max" },
];

const DEEPSEEK_PROXY_PATH =
  import.meta.env.VITE_DEEPSEEK_PROXY_PATH || "/deepseek/chat/completions";

export const createDeepSeekChatCompletion = (payload) =>
  request(DEEPSEEK_PROXY_PATH, {
    method: "POST",
    body: payload,
  });

const normalizeText = (value) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item?.text || item?.content || item))
      .filter(Boolean)
      .join("");
  }
  return "";
};

export const getDeepSeekReplyText = (response) => {
  if (typeof response === "string") return response;
  const choice = response?.choices?.[0] || {};
  const message = choice.message || {};
  const candidates = [
    message.content,
    message.answer,
    message.final_answer,
    choice.text,
    choice.content,
    response?.output_text,
    response?.answer,
    response?.final_answer,
    response?.text,
    response?.content,
    response?.output,
  ];
  return candidates.map(normalizeText).find(Boolean) || "";
};

export const getDeepSeekReasoningText = (response) => {
  if (!response || typeof response === "string") return "";
  const message = response?.choices?.[0]?.message || {};
  if (message.reasoning_content) return message.reasoning_content;
  if (message.reasoning) return message.reasoning;
  if (response?.reasoning_content) return response.reasoning_content;
  if (response?.reasoning) return response.reasoning;
  if (response?.thinking) return response.thinking;
  return "";
};
