import mysql from "mysql2/promise";
import { defaultWorkbenchConnection } from "../src/config/workbenchConnections.js";

const API_PREFIX = "/api/v1/workbench/database";
const SYSTEM_SCHEMAS = [
  "information_schema",
  "mysql",
  "performance_schema",
  "sys",
];
const FORBIDDEN_SQL = /\b(insert|update|delete|drop|alter|truncate|create|replace|rename|grant|revoke|call|load|lock|unlock|set)\b/i;
const READABLE_SQL = /^\s*(select|with|show|describe|desc|explain)\b/i;

const poolCache = new Map();
let runtimeEnv = process.env;

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error(`Invalid JSON body: ${error.message}`));
      }
    });
    req.on("error", reject);
  });

const getConnectionConfig = (connectionId) => {
  if (connectionId && connectionId !== defaultWorkbenchConnection.id) {
    const error = new Error(`Unknown workbench database connection: ${connectionId}`);
    error.statusCode = 404;
    throw error;
  }
  return defaultWorkbenchConnection;
};

const createPool = (config) => {
  const password =
    runtimeEnv[config.connection.passwordEnv] ||
    process.env[config.connection.passwordEnv];
  if (!password) {
    const error = new Error(
      `Missing database password environment variable: ${config.connection.passwordEnv}`,
    );
    error.statusCode = 500;
    throw error;
  }

  return mysql.createPool({
    host: config.connection.host,
    port: config.connection.port,
    user: config.connection.username,
    password,
    database: config.connection.database || undefined,
    charset: config.connection.charset,
    waitForConnections: true,
    connectionLimit: 4,
    queueLimit: 0,
    connectTimeout: config.connection.connectTimeoutSeconds * 1000,
    supportBigNumbers: true,
    dateStrings: true,
  });
};

const getPool = (config) => {
  if (!poolCache.has(config.id)) {
    poolCache.set(config.id, createPool(config));
  }
  return poolCache.get(config.id);
};

const normalizeLimit = (value, policy) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return policy.defaultLimit;
  return Math.min(parsed, policy.maxLimit);
};

const stripTrailingSemicolon = (sql) => sql.replace(/;\s*$/, "");

const enforceReadonlySql = (sql, policy) => {
  const trimmed = stripTrailingSemicolon(sql || "").trim();
  if (!trimmed) {
    const error = new Error("SQL is required.");
    error.statusCode = 400;
    throw error;
  }
  if (!READABLE_SQL.test(trimmed) || FORBIDDEN_SQL.test(trimmed)) {
    const error = new Error("Only read-only SQL statements are allowed.");
    error.statusCode = 400;
    throw error;
  }
  if (!policy.requireLimit || !/^\s*(select|with)\b/i.test(trimmed)) return trimmed;

  const explicitLimit = trimmed.match(/\blimit\s+(\d+)\b/i);
  if (explicitLimit) {
    const limited = normalizeLimit(explicitLimit[1], policy);
    return trimmed.replace(/\blimit\s+\d+\b/i, `LIMIT ${limited}`);
  }
  return `${trimmed} LIMIT ${policy.defaultLimit}`;
};

const getConnectionSummary = async (config) => {
  const pool = getPool(config);
  const [pingRows] = await pool.query(
    "SELECT VERSION() AS version, DATABASE() AS current_database",
  );
  const [schemaRows] = await pool.query(
    `SELECT schema_name AS schemaName
       FROM information_schema.SCHEMATA
      WHERE schema_name NOT IN (?)
      ORDER BY schema_name
      LIMIT 50`,
    [SYSTEM_SCHEMAS],
  );
  return {
    id: config.id,
    name: config.name,
    type: config.type,
    host: config.connection.host,
    port: config.connection.port,
    username: config.connection.username,
    version: pingRows[0]?.version || "",
    currentDatabase: pingRows[0]?.current_database || null,
    schemas: schemaRows.map((row) => row.schemaName || row.schema_name),
    executionPolicy: config.executionPolicy,
  };
};

const listTables = async (config, limitValue) => {
  const pool = getPool(config);
  const limit = normalizeLimit(limitValue, config.executionPolicy);
  const [rows] = await pool.query(
    `SELECT t.table_schema AS tableSchema,
            t.table_name AS tableName,
            t.table_type AS tableType,
            COALESCE(t.table_rows, 0) AS tableRows,
            t.update_time AS updateTime,
            COUNT(c.column_name) AS columnCount
       FROM information_schema.TABLES t
       LEFT JOIN information_schema.COLUMNS c
         ON c.table_schema = t.table_schema
        AND c.table_name = t.table_name
      WHERE t.table_schema NOT IN (?)
      GROUP BY t.table_schema, t.table_name, t.table_type, t.table_rows, t.update_time
      ORDER BY t.table_schema, t.table_name
      LIMIT ?`,
    [SYSTEM_SCHEMAS, limit],
  );
  return rows.map((row) => ({
    id: `${row.tableSchema || row.table_schema}.${row.tableName || row.table_name}`,
    schema: row.tableSchema || row.table_schema,
    name: row.tableName || row.table_name,
    label: row.tableName || row.table_name,
    type: row.tableType || row.table_type,
    rows: Number(row.tableRows || row.table_rows || 0),
    fields: Number(row.columnCount || row.column_count || 0),
    updatedAt: row.updateTime || row.update_time || null,
  }));
};

const getTableSchema = async (config, schemaName, tableName) => {
  const pool = getPool(config);
  const [columnRows] = await pool.query(
    `SELECT column_name AS columnName,
            column_type AS columnType,
            data_type AS dataType,
            is_nullable AS isNullable,
            column_key AS columnKey,
            column_default AS columnDefault,
            column_comment AS columnComment,
            ordinal_position AS ordinalPosition
       FROM information_schema.COLUMNS
      WHERE table_schema = ?
        AND table_name = ?
      ORDER BY ordinal_position`,
    [schemaName, tableName],
  );
  const [foreignRows] = await pool.query(
    `SELECT column_name AS columnName,
            referenced_table_schema AS referencedTableSchema,
            referenced_table_name AS referencedTableName,
            referenced_column_name AS referencedColumnName
       FROM information_schema.KEY_COLUMN_USAGE
      WHERE table_schema = ?
        AND table_name = ?
        AND referenced_table_name IS NOT NULL`,
    [schemaName, tableName],
  );
  const foreignKeyColumns = new Set(
    foreignRows.map((row) => row.columnName || row.column_name),
  );

  return {
    id: `${schemaName}.${tableName}`,
    schema: schemaName,
    name: tableName,
    columns: columnRows.map((row) => ({
      name: row.columnName || row.column_name,
      type: row.columnType || row.column_type || row.dataType || row.data_type,
      key:
        (row.columnKey || row.column_key) === "PRI"
          ? "PK"
          : foreignKeyColumns.has(row.columnName || row.column_name)
            ? "FK"
            : row.columnKey || row.column_key
              ? "IDX"
              : "",
      nullable: (row.isNullable || row.is_nullable) === "YES",
      default: row.columnDefault ?? row.column_default,
      comment: row.columnComment || row.column_comment,
      position: row.ordinalPosition || row.ordinal_position,
    })),
    foreignKeys: foreignRows.map((row) => ({
      column: row.columnName || row.column_name,
      referencedSchema: row.referencedTableSchema || row.referenced_table_schema,
      referencedTable: row.referencedTableName || row.referenced_table_name,
      referencedColumn: row.referencedColumnName || row.referenced_column_name,
    })),
  };
};

const runQuery = async (config, sql) => {
  const pool = getPool(config);
  const safeSql = enforceReadonlySql(sql, config.executionPolicy);
  const [rows, fields] = await pool.query(safeSql);
  return {
    sql: safeSql,
    fields: Array.isArray(fields)
      ? fields.map((field) => ({
          name: field.name,
          table: field.table,
          database: field.db,
        }))
      : [],
    rows: Array.isArray(rows) ? rows : [],
  };
};

const parseSchemaAndTable = (url, prefix) => {
  const parts = url.pathname.slice(prefix.length).split("/").filter(Boolean);
  const rawName = parts[1] ? decodeURIComponent(parts[1]) : "";
  if (!rawName) {
    const error = new Error("Table name is required.");
    error.statusCode = 400;
    throw error;
  }
  const schema = url.searchParams.get("schema");
  if (schema) return { schemaName: schema, tableName: rawName };
  const [schemaName, ...tableParts] = rawName.split(".");
  if (tableParts.length) {
    return { schemaName, tableName: tableParts.join(".") };
  }
  const error = new Error("Table schema is required.");
  error.statusCode = 400;
  throw error;
};

export const workbenchDatabaseMiddleware = (env = process.env) => {
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
        defaultWorkbenchConnection.id;
      const config = getConnectionConfig(connectionId);

      if (req.method === "POST" && path === `${API_PREFIX}/connect`) {
        sendJson(res, 200, await getConnectionSummary(config));
        return;
      }

      if (req.method === "GET" && path === `${API_PREFIX}/tables`) {
        sendJson(res, 200, {
          connectionId: config.id,
          tables: await listTables(config, url.searchParams.get("limit")),
        });
        return;
      }

      if (req.method === "GET" && path.endsWith("/schema")) {
        const { schemaName, tableName } = parseSchemaAndTable(url, API_PREFIX);
        sendJson(res, 200, await getTableSchema(config, schemaName, tableName));
        return;
      }

      if (req.method === "POST" && path === `${API_PREFIX}/query`) {
        const body = await readBody(req);
        sendJson(res, 200, await runQuery(config, body.sql));
        return;
      }

      sendJson(res, 404, { message: "Workbench database endpoint not found." });
    } catch (error) {
      sendJson(res, error.statusCode || 500, {
        message: error.message || "Workbench database request failed.",
      });
    }
  };
};
