import { request } from "./http";

export const getWallaceReportCatalog = () =>
  request("/wallace-reports/catalog", {
    method: "GET",
  });

export const getWallaceReportOverview = ({ month, zone } = {}) =>
  request("/wallace-reports/overview", {
    method: "GET",
    params: { month, zone },
  });

export const getWallaceTableSample = (tableId, limit = 20) =>
  request(`/wallace-reports/tables/${encodeURIComponent(tableId)}/sample`, {
    method: "GET",
    params: { limit },
  });
