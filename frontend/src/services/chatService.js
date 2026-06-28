import API from '../api/api';

// ─── Unread badge counts ──────────────────────────────────────────────────────
export const getUnreadCounts = () => API.get('/chat/unread');

// ─── Team chat ────────────────────────────────────────────────────────────────
export const getTeamMessages = (teamId, after = 0) =>
  API.get(`/chat/team/${teamId}/messages`, { params: { after } });

export const sendTeamMessage = (teamId, content) =>
  API.post(`/chat/team/${teamId}/messages`, { content });

export const markTeamRead = (teamId, lastMessageId) =>
  API.put(`/chat/team/${teamId}/read`, { lastMessageId });

// ─── DM chat (draft-accept) ───────────────────────────────────────────────────
export const getDmMessages = (appId, after = 0) =>
  API.get(`/chat/dm/${appId}/messages`, { params: { after } });

export const sendDmMessage = (appId, content) =>
  API.post(`/chat/dm/${appId}/messages`, { content });

export const markDmRead = (appId, lastMessageId) =>
  API.put(`/chat/dm/${appId}/read`, { lastMessageId });
