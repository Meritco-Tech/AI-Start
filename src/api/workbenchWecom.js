import { request } from "./http";

export const connectWorkbenchWecom = (connectionId) =>
  request("/workbench/wecom/connect", {
    method: "POST",
    params: { connection_id: connectionId },
  });

export const listWorkbenchWecomFiles = (connectionId, spaceId, fatherId) =>
  request("/workbench/wecom/files", {
    method: "GET",
    params: {
      connection_id: connectionId,
      space_id: spaceId,
      father_id: fatherId,
    },
  });
