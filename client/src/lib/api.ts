const API_BASE = "";

let sessionToken: string | null = null;

export function setSessionToken(token: string) {
  sessionToken = token;
  localStorage.setItem("sessionToken", token);
}

export function getSessionToken(): string | null {
  if (!sessionToken) {
    sessionToken = localStorage.getItem("sessionToken");
  }
  return sessionToken;
}

export function clearSession() {
  sessionToken = null;
  localStorage.removeItem("sessionToken");
  localStorage.removeItem("currentUser");
}

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getSessionToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      window.location.reload();
    }
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: { username: string; password: string; inviteCode: string }) =>
    apiCall("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { username: string; password: string; inviteCode: string }) =>
    apiCall("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => apiCall("/api/auth/logout", { method: "POST" }),

  // Users
  searchUsers: (query: string) => apiCall(`/api/users/search?q=${encodeURIComponent(query)}`),

  getCurrentUser: () => apiCall("/api/users/me"),

  // Chats
  getChats: () => apiCall("/api/chats"),

  createChat: (data: { isGroup: boolean; name?: string; inviteCode?: string }) =>
    apiCall("/api/chats", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createDirectChat: (userId: string) =>
    apiCall("/api/chats/direct", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  joinChat: (chatId: string, inviteCode: string) =>
    apiCall(`/api/chats/${chatId}/join`, {
      method: "POST",
      body: JSON.stringify({ inviteCode }),
    }),

  getMessages: (chatId: string) => apiCall(`/api/chats/${chatId}/messages`),

  // File upload
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getSessionToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json();
  },
};
