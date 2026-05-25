import { request } from "./http";

export const connectWorkbenchDatabase = (connectionId) =>
  request("/workbench/database/connect", {
    method: "POST",
    params: { connection_id: connectionId },
  });

export const listWorkbenchTables = (connectionId, limit) =>
  request("/workbench/database/tables", {
    method: "GET",
    params: { connection_id: connectionId, limit },
  });

export const getWorkbenchTableSchema = (connectionId, table) =>
  request(
    `/workbench/database/tables/${encodeURIComponent(table.name)}/schema`,
    {
      method: "GET",
      params: {
        connection_id: connectionId,
        schema: table.schema,
      },
    },
  );

export const runReadonlyWorkbenchQuery = (connectionId, sql) =>
  request("/workbench/database/query", {
    method: "POST",
    params: { connection_id: connectionId },
    body: { sql },
  });
