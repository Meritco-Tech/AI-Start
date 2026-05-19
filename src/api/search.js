import { request } from "./http";

const MAX_SEARCH_RESULTS = 5;

const cleanText = (value = "") =>
  String(value)
    .replace(/\s+/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .trim();

const truncateText = (value, maxLength = 260) => {
  const text = cleanText(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const normalizeUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://www.so.com${url}`;
  return url;
};

const dedupeResults = (results) => {
  const seen = new Set();
  return results
    .filter((result) => result.title && result.snippet)
    .filter((result) => {
      const key = `${result.title}|${result.url || result.snippet}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_SEARCH_RESULTS);
};

const flattenRelatedTopics = (topics = []) =>
  topics.flatMap((topic) => {
    if (Array.isArray(topic.Topics)) return flattenRelatedTopics(topic.Topics);
    return topic.Text
      ? [
          {
            title: topic.FirstURL
              ? topic.FirstURL.replace(/^https?:\/\//, "").split("/")[0]
              : "搜索结果",
            snippet: topic.Text,
            url: topic.FirstURL || "",
          },
        ]
      : [];
  });

const searchDuckDuckGo = async (query) => {
  const data = await request("/search/duckduckgo", {
    params: {
      q: query,
      format: "json",
      no_html: 1,
      no_redirect: 1,
      skip_disambig: 1,
    },
  });
  const primaryResult = data?.AbstractText
    ? [
        {
          title: data.Heading || "搜索摘要",
          snippet: data.AbstractText,
          url: data.AbstractURL || "",
        },
      ]
    : [];
  const resultItems = Array.isArray(data?.Results)
    ? data.Results.map((result) => ({
        title: result.Text || result.FirstURL || "搜索结果",
        snippet: result.Text || "",
        url: result.FirstURL || "",
      }))
    : [];
  const relatedResults = flattenRelatedTopics(data?.RelatedTopics);
  return dedupeResults([...primaryResult, ...resultItems, ...relatedResults]);
};

const pickResultSnippet = (container) => {
  const preferredSelectors = [
    ".res-desc",
    ".res-rich",
    ".summary",
    ".result-summary",
    ".cont",
    ".g-linkinfo",
    "p",
  ];
  const preferredText = preferredSelectors
    .map((selector) => cleanText(container.querySelector(selector)?.textContent))
    .find(Boolean);
  return truncateText(preferredText || container.textContent);
};

const parseSoSearchResults = (html, query) => {
  if (typeof DOMParser === "undefined" || !html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const results = [];
  const addressText = cleanText(
    doc.querySelector(".mh-map_new-address")?.textContent
  );

  if (addressText) {
    results.push({
      title: `${query} - 地图信息`,
      snippet: addressText,
      url: "https://www.so.com/s",
    });
  }

  doc.querySelectorAll("li.res-list, .res-list").forEach((container) => {
    const link = container.querySelector("h3 a, .res-title a, a[href]");
    const title = truncateText(link?.textContent, 90);
    const snippet = pickResultSnippet(container);
    if (!title || !snippet || /广告|推广/.test(title)) return;
    results.push({
      title,
      snippet,
      url: normalizeUrl(link?.getAttribute("href") || ""),
    });
  });

  return dedupeResults(results);
};

const searchSo = async (query) => {
  const html = await request("/search/so", {
    params: {
      q: query,
    },
    headers: {
      Accept: "text/html,application/xhtml+xml",
    },
  });
  return parseSoSearchResults(html, query);
};

export const searchWeb = async (query) => {
  let duckDuckGoError = null;
  try {
    const duckDuckGoResults = await searchDuckDuckGo(query);
    if (duckDuckGoResults.length) {
      return {
        query,
        source: "DuckDuckGo Instant Answer",
        results: duckDuckGoResults,
      };
    }
  } catch (error) {
    duckDuckGoError = error;
  }

  try {
    const soResults = await searchSo(query);
    return {
      query,
      source: "360 Search",
      results: soResults,
    };
  } catch (error) {
    throw duckDuckGoError || error;
  }
};
