import { DEFAULT_USER_ID, createStreamUrl, request } from "./http";

export const getSessions = (userId = DEFAULT_USER_ID) =>
  request("/sessions", {
    method: "GET",
    params: { user_id: userId },
  });

export const createSession = (payload = {}, userId = DEFAULT_USER_ID) =>
  request("/sessions", {
    method: "POST",
    body: {
      user_id: userId,
      ...payload,
    },
  });

export const updateSession = (sessionId, payload, userId = DEFAULT_USER_ID) =>
  request(`/sessions/${sessionId}`, {
    method: "PATCH",
    body: {
      ...payload,
      user_id: userId,
    },
  });

export const deleteSession = (sessionId, userId = DEFAULT_USER_ID) =>
  request(`/sessions/${sessionId}`, {
    method: "DELETE",
    params: { user_id: userId },
  });

export const getHistory = (sessionId, userId = DEFAULT_USER_ID) =>
  request(`/history/${sessionId}`, {
    method: "GET",
    params: { user_id: userId },
  });

export const stopSession = (sessionId, userId = DEFAULT_USER_ID) =>
  request(`/sessions/${sessionId}/stop`, {
    method: "POST",
    body: { user_id: userId },
  });

export const createChatJob = (payload, userId = DEFAULT_USER_ID) =>
  request("/chat", {
    method: "POST",
    body: {
      user_id: userId,
      ...payload,
    },
  });

export const getWorkspaceTree = (sessionId, userId = DEFAULT_USER_ID) =>
  request(`/workspace/${sessionId}/tree`, {
    method: "GET",
    params: { user_id: userId },
  });

export const uploadWorkspaceFiles = (
  sessionId,
  files,
  targetParent = "permanent",
  userId = DEFAULT_USER_ID
) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("files", file));
  formData.append("target_parent", targetParent);
  formData.append("user_id", userId);
  return request(`/workspace/${sessionId}/upload`, {
    method: "POST",
    body: formData,
  });
};

export const operateWorkspaceFs = (sessionId, payload, userId = DEFAULT_USER_ID) =>
  request(`/workspace/${sessionId}/fs`, {
    method: "POST",
    body: {
      user_id: userId,
      ...payload,
    },
  });

export const getWorkspaceSkills = (sessionId, userId = DEFAULT_USER_ID) =>
  request(`/workspace/${sessionId}/skills`, {
    method: "GET",
    params: { user_id: userId },
  });

export const readWorkspaceFile = (sessionId, path, userId = DEFAULT_USER_ID) =>
  request(`/workspace/${sessionId}/file`, {
    method: "GET",
    params: { path, user_id: userId },
  });

export const saveWorkspaceFile = (sessionId, payload, userId = DEFAULT_USER_ID) =>
  request(`/workspace/${sessionId}/file`, {
    method: "PUT",
    body: {
      user_id: userId,
      ...payload,
    },
  });

export const createChatStream = (jobId, sessionId, userId = DEFAULT_USER_ID) =>
  new EventSource(
    createStreamUrl(jobId, {
      session_id: sessionId,
      user_id: userId,
    })
  );
