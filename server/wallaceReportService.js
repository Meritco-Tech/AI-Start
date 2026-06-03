import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import mysql from "mysql2/promise";
import {
  getWallaceReportDatabaseConfig,
} from "./wallaceReportDatabaseConfig.js";
import { wallaceQuadrantAnalysis } from "./wallaceQuadrantReportData.js";

const DEFAULT_DATA_DIR =
  process.env.WALLACE_REPORT_DATA_DIR || "/Users/wentaoding/Downloads/database";

const SOURCE_DEFINITIONS = [
  {
    match: "1.1+1.2",
    module: "利润分析",
    title: "月度门店利润与渠道拆解",
    grain: "门店×月",
    metrics: ["1.1", "1.2"],
  },
  {
    match: "1.3",
    module: "利润分析",
    title: "渠道收入、订单量与客单价结构",
    grain: "门店×月×渠道",
    metrics: ["1.3"],
  },
  {
    match: "1.4+1.5+1.11",
    module: "利润分析",
    title: "区域利润率健康度",
    grain: "区域×月",
    metrics: ["1.4", "1.5", "1.11"],
  },
  {
    match: "1.6+1.9",
    module: "利润分析",
    title: "成本结构与渠道毛利率",
    grain: "门店×月",
    metrics: ["1.6", "1.9"],
  },
  {
    match: "1.10",
    module: "利润分析",
    title: "头部与尾部门店利润差距",
    grain: "区域×月",
    metrics: ["1.10"],
  },
  {
    match: "2.1+2.6",
    module: "定价分析",
    title: "各渠道均价与毛利率",
    grain: "门店×月",
    metrics: ["2.1", "2.6"],
  },
  {
    match: "2.2+2.3+2.4+2.5",
    module: "定价分析",
    title: "售价、折扣与价格带",
    grain: "门店×月",
    metrics: ["2.2", "2.3", "2.4", "2.5"],
  },
  {
    match: "3.1+3.3+3.4",
    module: "套餐分析",
    title: "套餐渗透率与均价对比",
    grain: "门店×月",
    metrics: ["3.1", "3.3", "3.4"],
  },
  {
    match: "3.2+3.9",
    module: "套餐分析",
    title: "套餐结构类型与渠道交叉",
    grain: "门店×月×套餐结构×渠道",
    metrics: ["3.2", "3.9"],
    largeTable: true,
  },
  {
    match: "3.5+3.7+3.8",
    module: "套餐分析",
    title: "套餐毛利率、理论毛利与达标率",
    grain: "区域×月",
    metrics: ["3.5", "3.7", "3.8"],
  },
  {
    match: "3.11",
    module: "套餐分析",
    title: "单品毛利率达标率",
    grain: "门店×月×套餐",
    metrics: ["3.11"],
    largeTable: true,
  },
  {
    match: "5.1+5.2+5.5+5.6",
    module: "异常低价诊断",
    title: "异常低价与退款综合诊断",
    grain: "门店×月",
    metrics: ["5.1", "5.2", "5.5", "5.6"],
  },
  {
    match: "6.16+6.17+6.18",
    module: "销售额分析",
    title: "堂食、外卖与团购收入占比",
    grain: "门店×月",
    metrics: ["6.16", "6.17", "6.18"],
  },
  {
    match: "6.19+6.20",
    module: "销售额分析",
    title: "新老客订单与消费额占比",
    grain: "门店×月",
    metrics: ["6.19", "6.20"],
  },
  {
    match: "6.21+6.22",
    module: "销售额分析",
    title: "会员订单与消费占比",
    grain: "门店×月",
    metrics: ["6.21", "6.22"],
  },
];

const FIELD_LABELS = {
  month: "月份",
  zone_name: "区域",
  store_id: "门店ID",
  store_name: "门店名称",
  total_profit: "总毛利额",
  total_rev: "总营收",
  profit_rate: "总毛利率",
  dinein_profit: "堂食毛利",
  dinein_rev: "堂食收入",
  group_profit: "团购毛利",
  group_rev: "团购收入",
  delivery_profit: "外卖毛利",
  delivery_rev: "外卖收入",
  instore_profit: "到店毛利",
  channel_3: "三级渠道",
  channel_2: "二级渠道",
  order_cnt: "订单量",
  revenue: "收入",
  avg_order_value: "客单价",
  low_price_rate: "异常低价率",
  low_price_cnt: "异常低价次数",
  total_cnt: "总次数",
  refund_rate: "退款率",
  zone_avg_rate: "区域平均毛利率",
  cv: "利润率离散度",
  below_national_ratio: "低于全国均值门店占比",
  store_cnt: "门店数",
  pattern: "区域类型",
  margin_pass_rate: "毛利率达标率",
  combo_cnt: "套餐数",
  member_order_rate: "会员订单占比",
  member_rev_rate: "会员消费占比",
  new_order_rate: "新客订单占比",
  new_rev_rate: "新客消费占比",
};

const REPORT_TABLE_NAMES = {
  "1.1+1.2": "1.1+1.2 月度门店利润 & 渠道拆解",
  "1.4+1.5+1.11": "1.4+1.5+1.11 区域利润率分析",
  "3.5+3.7+3.8": "3.5+3.7+3.8 套餐毛利率分析(实际vs理论+TOP20+达标率)",
  "5.1+5.2+5.5+5.6": "5.1+5.2+5.5+5.6 异常低价综合",
};

const catalogCache = new Map();
const overviewCache = new Map();
const poolCache = new Map();

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
};

const numberValue = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const divide = (numerator, denominator) =>
  denominator ? numerator / denominator : 0;

const fileExists = async (filePath) => {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
};

const formatFileId = (fileName) =>
  fileName
    .replace(/\.csv$/i, "")
    .replace(/\s+/g, "-")
    .replace(/[()（）&+×]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const getSourceDefinition = (fileName) =>
  SOURCE_DEFINITIONS.find((definition) => fileName.includes(definition.match)) || {
    module: "未归类",
    title: fileName.replace(/\.csv$/i, ""),
    grain: "未知",
    metrics: [],
  };

const quoteId = (value) => `\`${String(value).replace(/`/g, "``")}\``;

const getTableName = (match) => {
  const tableName = REPORT_TABLE_NAMES[match];
  if (!tableName) {
    const error = new Error(`Missing Wallace report table mapping: ${match}`);
    error.statusCode = 500;
    throw error;
  }
  return tableName;
};

const getMysqlConfig = (options = {}) =>
  options.mysqlConfig || getWallaceReportDatabaseConfig(options.env || process.env);

const getMysqlCacheKey = (config) =>
  `${config.type}:${config.host}:${config.port}:${config.database}:${config.username}`;

const createMysqlPool = (config, env = process.env) => {
  const password = env[config.passwordEnv] || process.env[config.passwordEnv];
  if (!password) {
    const error = new Error(
      `Missing Wallace report database password environment variable: ${config.passwordEnv}`,
    );
    error.statusCode = 500;
    throw error;
  }

  return mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.username,
    password,
    database: config.database,
    charset: config.charset,
    waitForConnections: true,
    connectionLimit: 4,
    queueLimit: 0,
    connectTimeout: config.connectTimeoutSeconds * 1000,
    supportBigNumbers: true,
    dateStrings: true,
  });
};

const getMysqlPool = (options = {}) => {
  const config = getMysqlConfig(options);
  const cacheKey = getMysqlCacheKey(config);
  if (!poolCache.has(cacheKey)) {
    poolCache.set(cacheKey, createMysqlPool(config, options.env || process.env));
  }
  return poolCache.get(cacheKey);
};

const buildWhereClause = (filters, { includeMonth = true, includeZone = true } = {}) => {
  const clauses = [];
  const params = [];
  if (includeMonth && filters.month) {
    clauses.push("month = ?");
    params.push(filters.month);
  }
  if (includeZone && filters.zone) {
    clauses.push("zone_name = ?");
    params.push(filters.zone);
  }
  return {
    sql: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
};

const getDefinitionByTableName = (tableName) =>
  SOURCE_DEFINITIONS.find((definition) => tableName.includes(definition.match)) || {
    module: "未归类",
    title: tableName,
    grain: "未知",
    metrics: [],
  };

async function readCsv(filePath, onRow, options = {}) {
  const stream = createReadStream(filePath, { encoding: "utf8" });
  const reader = createInterface({ input: stream, crlfDelay: Infinity });
  let headers = null;
  let rowCount = 0;

  for await (const rawLine of reader) {
    const line = rawLine.replace(/^\uFEFF/, "");
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }
    if (!line) continue;

    rowCount += 1;
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    await onRow(row, headers, rowCount);
    if (options.limit && rowCount >= options.limit) {
      reader.close();
      break;
    }
  }

  return { headers: headers || [], rowCount };
}

async function summarizeCsv(filePath, fileName) {
  const months = new Set();
  const zones = new Set();
  let headers = [];
  const definition = getSourceDefinition(fileName);
  const fileStats = await stat(filePath);
  const sampleLimit = definition.largeTable ? 2000 : undefined;

  const { rowCount } = await readCsv(filePath, (row, rowHeaders) => {
    headers = rowHeaders;
    if (row.month) months.add(row.month);
    if (row.zone_name) zones.add(row.zone_name);
  }, {
    limit: sampleLimit,
  });

  return {
    id: formatFileId(fileName),
    fileName,
    title: definition.title,
    module: definition.module,
    grain: definition.grain,
    metrics: definition.metrics,
    largeTable: Boolean(definition.largeTable),
    rows: definition.largeTable ? null : rowCount,
    sampledRows: definition.largeTable ? rowCount : undefined,
    sizeBytes: fileStats.size,
    months: [...months].sort(),
    zones: [...zones].sort(),
    columns: headers.map((name) => ({
      name,
      label: FIELD_LABELS[name] || name,
    })),
  };
}

async function summarizeMysqlTable(pool, schemaName, tableInfo) {
  const tableName = tableInfo.tableName || tableInfo.table_name;
  const definition = getDefinitionByTableName(tableName);
  const [columnRows] = await pool.query(
    `SELECT column_name AS columnName
       FROM information_schema.COLUMNS
      WHERE table_schema = ?
        AND table_name = ?
      ORDER BY ordinal_position`,
    [schemaName, tableName],
  );
  const columnNames = columnRows.map((row) => row.columnName || row.column_name);
  const shouldReadFilters = tableName === getTableName("1.1+1.2");
  const hasMonth = shouldReadFilters && columnNames.includes("month");
  const hasZone = shouldReadFilters && columnNames.includes("zone_name");
  const tableId = quoteId(tableName);
  const [monthRows] = hasMonth
    ? await pool.query(
        `SELECT DISTINCT month FROM ${tableId} WHERE month IS NOT NULL ORDER BY month`,
      )
    : [[]];
  const [zoneRows] = hasZone
    ? await pool.query(
        `SELECT DISTINCT zone_name AS zoneName
           FROM ${tableId}
          WHERE zone_name IS NOT NULL AND zone_name <> ''
          ORDER BY zone_name`,
      )
    : [[]];

  return {
    id: formatFileId(tableName),
    fileName: tableName,
    title: definition.title,
    module: definition.module,
    grain: definition.grain,
    metrics: definition.metrics,
    largeTable: Boolean(definition.largeTable),
    rows: definition.largeTable ? null : Number(tableInfo.tableRows || tableInfo.table_rows || 0),
    sampledRows: definition.largeTable
      ? Number(tableInfo.tableRows || tableInfo.table_rows || 0)
      : undefined,
    sizeBytes: Number(tableInfo.sizeBytes || tableInfo.size_bytes || 0),
    months: monthRows.map((row) => String(row.month || "")),
    zones: zoneRows.map((row) => row.zoneName || row.zone_name),
    columns: columnNames.map((name) => ({
      name,
      label: FIELD_LABELS[name] || name,
    })),
  };
}

async function getMysqlWallaceReportCatalog(options = {}) {
  const config = getMysqlConfig(options);
  const pool = getMysqlPool(options);
  const cacheKey = `mysql:${getMysqlCacheKey(config)}`;
  if (!options.forceRefresh && catalogCache.has(cacheKey)) {
    return catalogCache.get(cacheKey);
  }

  const [tableRows] = await pool.query(
    `SELECT table_name AS tableName,
            COALESCE(table_rows, 0) AS tableRows,
            COALESCE(data_length, 0) + COALESCE(index_length, 0) AS sizeBytes
       FROM information_schema.TABLES
      WHERE table_schema = ?
      ORDER BY table_name`,
    [config.database],
  );

  const tables = [];
  for (const tableInfo of tableRows) {
    tables.push(await summarizeMysqlTable(pool, config.database, tableInfo));
  }

  const months = [...new Set(tables.flatMap((table) => table.months))].sort();
  const zones = [...new Set(tables.flatMap((table) => table.zones))].sort();
  const modules = SOURCE_DEFINITIONS.reduce((acc, definition) => {
    acc[definition.module] = acc[definition.module] || {
      name: definition.module,
      metricCount: 0,
      tableCount: 0,
    };
    acc[definition.module].metricCount += definition.metrics.length;
    acc[definition.module].tableCount += tables.filter((table) =>
      table.metrics.some((metric) => definition.metrics.includes(metric)),
    ).length;
    return acc;
  }, {});

  const catalog = {
    dataSource: "mysql",
    dataDir: `${config.host}:${config.port}/${config.database}`,
    generatedAt: new Date().toISOString(),
    months,
    zones,
    modules: Object.values(modules),
    tables,
  };

  catalogCache.set(cacheKey, catalog);
  return catalog;
}

async function getCsvWallaceReportCatalog(options = {}) {
  const dataDir = options.dataDir || DEFAULT_DATA_DIR;
  const cacheKey = dataDir;
  if (!options.forceRefresh && catalogCache.has(cacheKey)) {
    return catalogCache.get(cacheKey);
  }

  const entries = await readdir(dataDir);
  const csvFiles = entries
    .filter((entry) => entry.toLowerCase().endsWith(".csv"))
    .sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));

  const tables = [];
  for (const fileName of csvFiles) {
    tables.push(await summarizeCsv(path.join(dataDir, fileName), fileName));
  }

  const months = [...new Set(tables.flatMap((table) => table.months))].sort();
  const zones = [...new Set(tables.flatMap((table) => table.zones))].sort();
  const modules = SOURCE_DEFINITIONS.reduce((acc, definition) => {
    acc[definition.module] = acc[definition.module] || {
      name: definition.module,
      metricCount: 0,
      tableCount: 0,
    };
    acc[definition.module].metricCount += definition.metrics.length;
    acc[definition.module].tableCount += tables.filter((table) =>
      table.metrics.some((metric) => definition.metrics.includes(metric)),
    ).length;
    return acc;
  }, {});

  const catalog = {
    dataDir,
    generatedAt: new Date().toISOString(),
    months,
    zones,
    modules: Object.values(modules),
    tables,
  };

  catalogCache.set(cacheKey, catalog);
  return catalog;
}

export async function getWallaceReportCatalog(options = {}) {
  if (options.dataDir) return getCsvWallaceReportCatalog(options);
  return getMysqlWallaceReportCatalog(options);
}

const shouldInclude = (row, filters) =>
  (!filters.month || row.month === filters.month) &&
  (!filters.zone || row.zone_name === filters.zone);

const aggregateProfit = async (dataDir, filters) => {
  const filePath = path.join(dataDir, "1.1+1.2 月度门店利润 & 渠道拆解.csv");
  const zoneMap = new Map();
  const monthlyMap = new Map();
  const stores = new Set();
  const channelMix = {
    dinein: { label: "堂食", revenue: 0, profit: 0 },
    delivery: { label: "外卖", revenue: 0, profit: 0 },
    group: { label: "团购", revenue: 0, profit: 0 },
  };
  const totals = {
    totalRevenue: 0,
    totalProfit: 0,
  };

  if (!(await fileExists(filePath))) {
    return {
      kpis: {
        ...totals,
        profitRate: 0,
        storeCount: 0,
      },
      zoneProfit: [],
      monthlyTrend: [],
      channelMix,
    };
  }

  await readCsv(filePath, (row) => {
    const revenue = numberValue(row.total_rev);
    const profit = numberValue(row.total_profit);

    if (!filters.zone || row.zone_name === filters.zone) {
      const month = row.month || "未知月份";
      const monthStats = monthlyMap.get(month) || {
        month,
        revenue: 0,
        profit: 0,
      };
      monthStats.revenue += revenue;
      monthStats.profit += profit;
      monthlyMap.set(month, monthStats);
    }

    if (!shouldInclude(row, filters)) return;

    totals.totalRevenue += revenue;
    totals.totalProfit += profit;
    stores.add(row.store_id);

    const zone = row.zone_name || "未标记区域";
    const zoneStats = zoneMap.get(zone) || {
      zone,
      revenue: 0,
      profit: 0,
      stores: new Set(),
    };
    zoneStats.revenue += revenue;
    zoneStats.profit += profit;
    zoneStats.stores.add(row.store_id);
    zoneMap.set(zone, zoneStats);

    channelMix.dinein.revenue += numberValue(row.dinein_rev);
    channelMix.dinein.profit += numberValue(row.dinein_profit);
    channelMix.delivery.revenue += numberValue(row.delivery_rev);
    channelMix.delivery.profit += numberValue(row.delivery_profit);
    channelMix.group.revenue += numberValue(row.group_rev);
    channelMix.group.profit += numberValue(row.group_profit);
  });

  const zoneProfit = [...zoneMap.values()]
    .map((item) => ({
      zone: item.zone,
      revenue: item.revenue,
      profit: item.profit,
      profitRate: divide(item.profit, item.revenue),
      storeCount: item.stores.size,
    }))
    .sort((left, right) => right.profitRate - left.profitRate);

  const monthlyTrend = [...monthlyMap.values()]
    .map((item) => ({
      month: item.month,
      revenue: item.revenue,
      profit: item.profit,
      profitRate: divide(item.profit, item.revenue),
    }))
    .sort((left, right) => left.month.localeCompare(right.month));

  return {
    kpis: {
      ...totals,
      profitRate: divide(totals.totalProfit, totals.totalRevenue),
      storeCount: stores.size,
    },
    zoneProfit,
    monthlyTrend,
    channelMix,
  };
};

const aggregateRiskSignals = async (dataDir, filters) => {
  const filePath = path.join(dataDir, "5.1+5.2+5.5+5.6 异常低价综合.csv");
  const zoneMap = new Map();
  let lowPriceCount = 0;
  let totalCount = 0;
  let refundRateNumerator = 0;

  if (!(await fileExists(filePath))) {
    return {
      lowPriceRate: 0,
      refundRate: 0,
      riskSignals: [],
    };
  }

  await readCsv(filePath, (row) => {
    if (!shouldInclude(row, filters)) return;
    const low = numberValue(row.low_price_cnt);
    const total = numberValue(row.total_cnt);
    lowPriceCount += low;
    totalCount += total;
    refundRateNumerator += numberValue(row.refund_rate) * total;

    const zone = row.zone_name || "未标记区域";
    const stats = zoneMap.get(zone) || {
      zone,
      lowPriceCount: 0,
      totalCount: 0,
      refundRateNumerator: 0,
    };
    stats.lowPriceCount += low;
    stats.totalCount += total;
    stats.refundRateNumerator += numberValue(row.refund_rate) * total;
    zoneMap.set(zone, stats);
  });

  return {
    lowPriceRate: divide(lowPriceCount, totalCount),
    refundRate: divide(refundRateNumerator, totalCount),
    riskSignals: [...zoneMap.values()]
      .map((item) => ({
        zone: item.zone,
        lowPriceRate: divide(item.lowPriceCount, item.totalCount),
        refundRate: divide(item.refundRateNumerator, item.totalCount),
        lowPriceCount: item.lowPriceCount,
        totalCount: item.totalCount,
      }))
      .sort((left, right) => right.lowPriceRate - left.lowPriceRate),
  };
};

const aggregateZoneHealth = async (dataDir, filters) => {
  const filePath = path.join(dataDir, "1.4+1.5+1.11 区域利润率分析.csv");
  const rows = [];

  if (!(await fileExists(filePath))) return rows;

  await readCsv(filePath, (row) => {
    if (!shouldInclude(row, filters)) return;
    rows.push({
      month: row.month,
      zone: row.zone_name,
      zoneAvgRate: numberValue(row.zone_avg_rate),
      cv: numberValue(row.cv),
      belowNationalRatio: numberValue(row.below_national_ratio),
      storeCount: numberValue(row.store_cnt),
      pattern: row.pattern || "未标记",
    });
  });

  return rows.sort((left, right) => right.belowNationalRatio - left.belowNationalRatio);
};

const aggregateComboMargins = async (dataDir, filters) => {
  const filePath = path.join(
    dataDir,
    "3.5+3.7+3.8 套餐毛利率分析(实际vs理论+TOP20+达标率).csv",
  );
  const rows = [];

  if (!(await fileExists(filePath))) return rows;

  await readCsv(filePath, (row) => {
    if (!shouldInclude(row, filters)) return;
    rows.push({
      month: row.month,
      zone: row.zone_name,
      actualMargin: numberValue(row.avg_actual_margin),
      theoreticalMargin: numberValue(row.avg_theoretical_margin),
      marginErosion: numberValue(row.avg_margin_erosion),
      passRate: numberValue(row.margin_pass_rate),
      comboCount: numberValue(row.combo_cnt),
    });
  });

  return rows.sort((left, right) => right.passRate - left.passRate);
};

const aggregateMysqlProfit = async (pool, filters) => {
  const tableName = quoteId(getTableName("1.1+1.2"));
  const where = buildWhereClause(filters);
  const trendWhere = buildWhereClause(filters, { includeMonth: false });
  const [totalRows] = await pool.query(
    `SELECT COALESCE(SUM(total_rev), 0) AS totalRevenue,
            COALESCE(SUM(total_profit), 0) AS totalProfit,
            COUNT(DISTINCT store_id) AS storeCount
       FROM ${tableName}${where.sql}`,
    where.params,
  );
  const [zoneRows] = await pool.query(
    `SELECT zone_name AS zone,
            COALESCE(SUM(total_rev), 0) AS revenue,
            COALESCE(SUM(total_profit), 0) AS profit,
            COUNT(DISTINCT store_id) AS storeCount
       FROM ${tableName}${where.sql}
      GROUP BY zone_name
      ORDER BY CASE WHEN COALESCE(SUM(total_rev), 0) = 0 THEN 0 ELSE SUM(total_profit) / SUM(total_rev) END DESC`,
    where.params,
  );
  const [trendRows] = await pool.query(
    `SELECT month,
            COALESCE(SUM(total_rev), 0) AS revenue,
            COALESCE(SUM(total_profit), 0) AS profit
       FROM ${tableName}${trendWhere.sql}
      GROUP BY month
      ORDER BY month`,
    trendWhere.params,
  );
  const [channelRows] = await pool.query(
    `SELECT COALESCE(SUM(dinein_rev), 0) AS dineinRevenue,
            COALESCE(SUM(dinein_profit), 0) AS dineinProfit,
            COALESCE(SUM(delivery_rev), 0) AS deliveryRevenue,
            COALESCE(SUM(delivery_profit), 0) AS deliveryProfit,
            COALESCE(SUM(group_rev), 0) AS groupRevenue,
            COALESCE(SUM(group_profit), 0) AS groupProfit
       FROM ${tableName}${where.sql}`,
    where.params,
  );

  const totals = totalRows[0] || {};
  const channels = channelRows[0] || {};
  return {
    kpis: {
      totalRevenue: Number(totals.totalRevenue || 0),
      totalProfit: Number(totals.totalProfit || 0),
      profitRate: divide(Number(totals.totalProfit || 0), Number(totals.totalRevenue || 0)),
      storeCount: Number(totals.storeCount || 0),
    },
    zoneProfit: zoneRows.map((item) => ({
      zone: item.zone || "未标记区域",
      revenue: Number(item.revenue || 0),
      profit: Number(item.profit || 0),
      profitRate: divide(Number(item.profit || 0), Number(item.revenue || 0)),
      storeCount: Number(item.storeCount || 0),
    })),
    monthlyTrend: trendRows.map((item) => ({
      month: item.month,
      revenue: Number(item.revenue || 0),
      profit: Number(item.profit || 0),
      profitRate: divide(Number(item.profit || 0), Number(item.revenue || 0)),
    })),
    channelMix: {
      dinein: {
        label: "堂食",
        revenue: Number(channels.dineinRevenue || 0),
        profit: Number(channels.dineinProfit || 0),
      },
      delivery: {
        label: "外卖",
        revenue: Number(channels.deliveryRevenue || 0),
        profit: Number(channels.deliveryProfit || 0),
      },
      group: {
        label: "团购",
        revenue: Number(channels.groupRevenue || 0),
        profit: Number(channels.groupProfit || 0),
      },
    },
  };
};

const aggregateMysqlRiskSignals = async (pool, filters) => {
  const tableName = quoteId(getTableName("5.1+5.2+5.5+5.6"));
  const where = buildWhereClause(filters);
  const [totalRows] = await pool.query(
    `SELECT COALESCE(SUM(low_price_cnt), 0) AS lowPriceCount,
            COALESCE(SUM(total_cnt), 0) AS totalCount,
            COALESCE(SUM(refund_rate * total_cnt), 0) AS refundRateNumerator
       FROM ${tableName}${where.sql}`,
    where.params,
  );
  const [zoneRows] = await pool.query(
    `SELECT zone_name AS zone,
            COALESCE(SUM(low_price_cnt), 0) AS lowPriceCount,
            COALESCE(SUM(total_cnt), 0) AS totalCount,
            COALESCE(SUM(refund_rate * total_cnt), 0) AS refundRateNumerator
       FROM ${tableName}${where.sql}
      GROUP BY zone_name
      ORDER BY CASE WHEN COALESCE(SUM(total_cnt), 0) = 0 THEN 0 ELSE SUM(low_price_cnt) / SUM(total_cnt) END DESC`,
    where.params,
  );
  const totals = totalRows[0] || {};
  return {
    lowPriceRate: divide(
      Number(totals.lowPriceCount || 0),
      Number(totals.totalCount || 0),
    ),
    refundRate: divide(
      Number(totals.refundRateNumerator || 0),
      Number(totals.totalCount || 0),
    ),
    riskSignals: zoneRows.map((item) => ({
      zone: item.zone || "未标记区域",
      lowPriceRate: divide(Number(item.lowPriceCount || 0), Number(item.totalCount || 0)),
      refundRate: divide(
        Number(item.refundRateNumerator || 0),
        Number(item.totalCount || 0),
      ),
      lowPriceCount: Number(item.lowPriceCount || 0),
      totalCount: Number(item.totalCount || 0),
    })),
  };
};

const aggregateMysqlZoneHealth = async (pool, filters) => {
  const tableName = quoteId(getTableName("1.4+1.5+1.11"));
  const where = buildWhereClause(filters);
  const [rows] = await pool.query(
    `SELECT month,
            zone_name AS zone,
            zone_avg_rate AS zoneAvgRate,
            cv,
            below_national_ratio AS belowNationalRatio,
            store_cnt AS storeCount,
            pattern
       FROM ${tableName}${where.sql}
      ORDER BY below_national_ratio DESC`,
    where.params,
  );
  return rows.map((row) => ({
    month: row.month,
    zone: row.zone,
    zoneAvgRate: Number(row.zoneAvgRate || 0),
    cv: Number(row.cv || 0),
    belowNationalRatio: Number(row.belowNationalRatio || 0),
    storeCount: Number(row.storeCount || 0),
    pattern: row.pattern || "未标记",
  }));
};

const aggregateMysqlComboMargins = async (pool, filters) => {
  const tableName = quoteId(getTableName("3.5+3.7+3.8"));
  const where = buildWhereClause(filters);
  const [rows] = await pool.query(
    `SELECT month,
            zone_name AS zone,
            avg_actual_margin AS actualMargin,
            avg_theoretical_margin AS theoreticalMargin,
            avg_margin_erosion AS marginErosion,
            margin_pass_rate AS passRate,
            combo_cnt AS comboCount
       FROM ${tableName}${where.sql}
      ORDER BY margin_pass_rate DESC`,
    where.params,
  );
  return rows.map((row) => ({
    month: row.month,
    zone: row.zone,
    actualMargin: Number(row.actualMargin || 0),
    theoreticalMargin: Number(row.theoreticalMargin || 0),
    marginErosion: Number(row.marginErosion || 0),
    passRate: Number(row.passRate || 0),
    comboCount: Number(row.comboCount || 0),
  }));
};

async function getCsvWallaceReportOverview(options = {}) {
  const dataDir = options.dataDir || DEFAULT_DATA_DIR;
  const filters = {
    month: options.month || "",
    zone: options.zone || "",
  };
  const cacheKey = `${dataDir}:${filters.month}:${filters.zone}`;
  if (!options.forceRefresh && overviewCache.has(cacheKey)) {
    return overviewCache.get(cacheKey);
  }

  const catalog = await getWallaceReportCatalog({
    dataDir,
    forceRefresh: options.forceRefresh,
  });
  const profit = await aggregateProfit(dataDir, filters);
  const risk = await aggregateRiskSignals(dataDir, filters);
  const zoneHealth = await aggregateZoneHealth(dataDir, filters);
  const comboMargins = await aggregateComboMargins(dataDir, filters);

  const overview = {
    filters: {
      month: filters.month || catalog.months.at(-1) || "",
      zone: filters.zone,
    },
    catalogSummary: {
      tableCount: catalog.tables.length,
      metricCount: catalog.modules.reduce(
        (sum, moduleItem) => sum + moduleItem.metricCount,
        0,
      ),
      largeTableCount: catalog.tables.filter((table) => table.largeTable).length,
      months: catalog.months,
      zones: catalog.zones,
    },
    kpis: {
      ...profit.kpis,
      lowPriceRate: risk.lowPriceRate,
      refundRate: risk.refundRate,
    },
    monthlyTrend: profit.monthlyTrend,
    zoneProfit: profit.zoneProfit,
    channelMix: profit.channelMix,
    riskSignals: risk.riskSignals,
    zoneHealth,
    comboMargins,
    quadrantAnalysis: wallaceQuadrantAnalysis,
    tables: catalog.tables,
  };

  overviewCache.set(cacheKey, overview);
  return overview;
}

async function getMysqlWallaceReportOverview(options = {}) {
  const config = getMysqlConfig(options);
  const filters = {
    month: options.month || "",
    zone: options.zone || "",
  };
  const cacheKey = `mysql:${getMysqlCacheKey(config)}:${filters.month}:${filters.zone}`;
  if (!options.forceRefresh && overviewCache.has(cacheKey)) {
    return overviewCache.get(cacheKey);
  }

  const pool = getMysqlPool(options);
  const catalog = await getMysqlWallaceReportCatalog(options);
  const profit = await aggregateMysqlProfit(pool, filters);
  const risk = await aggregateMysqlRiskSignals(pool, filters);
  const zoneHealth = await aggregateMysqlZoneHealth(pool, filters);
  const comboMargins = await aggregateMysqlComboMargins(pool, filters);

  const overview = {
    filters: {
      month: filters.month || catalog.months.at(-1) || "",
      zone: filters.zone,
    },
    catalogSummary: {
      tableCount: catalog.tables.length,
      metricCount: catalog.modules.reduce(
        (sum, moduleItem) => sum + moduleItem.metricCount,
        0,
      ),
      largeTableCount: catalog.tables.filter((table) => table.largeTable).length,
      months: catalog.months,
      zones: catalog.zones,
    },
    kpis: {
      ...profit.kpis,
      lowPriceRate: risk.lowPriceRate,
      refundRate: risk.refundRate,
    },
    monthlyTrend: profit.monthlyTrend,
    zoneProfit: profit.zoneProfit,
    channelMix: profit.channelMix,
    riskSignals: risk.riskSignals,
    zoneHealth,
    comboMargins,
    quadrantAnalysis: wallaceQuadrantAnalysis,
    tables: catalog.tables,
  };

  overviewCache.set(cacheKey, overview);
  return overview;
}

export async function getWallaceReportOverview(options = {}) {
  if (options.dataDir) return getCsvWallaceReportOverview(options);
  return getMysqlWallaceReportOverview(options);
}

export async function getWallaceTableSample(options = {}) {
  if (!options.dataDir) return getMysqlWallaceTableSample(options);

  const dataDir = options.dataDir || DEFAULT_DATA_DIR;
  const catalog = await getWallaceReportCatalog({ dataDir });
  const table = catalog.tables.find(
    (item) => item.id === options.tableId || item.fileName === options.tableId,
  );
  if (!table) {
    const error = new Error(`Unknown Wallace report table: ${options.tableId}`);
    error.statusCode = 404;
    throw error;
  }

  const rows = [];
  await readCsv(
    path.join(dataDir, table.fileName),
    (row) => {
      rows.push(row);
    },
    { limit: Math.min(Number(options.limit) || 20, 100) },
  );

  return {
    table,
    rows,
  };
}

async function getMysqlWallaceTableSample(options = {}) {
  const pool = getMysqlPool(options);
  const catalog = await getMysqlWallaceReportCatalog(options);
  const table = catalog.tables.find(
    (item) => item.id === options.tableId || item.fileName === options.tableId,
  );
  if (!table) {
    const error = new Error(`Unknown Wallace report table: ${options.tableId}`);
    error.statusCode = 404;
    throw error;
  }

  const limit = Math.min(Number(options.limit) || 20, 100);
  const [rows] = await pool.query(
    `SELECT * FROM ${quoteId(table.fileName)} LIMIT ?`,
    [limit],
  );

  return {
    table,
    rows,
  };
}
