export const API_BASE_URL = 'https://api.tasteney.com';

export const ENDPOINTS = {
  web: 'https://tasteney.com/up',
  api: `${API_BASE_URL}/up`,
  connection: `${API_BASE_URL}/api/v1/connection`,
  register: `${API_BASE_URL}/api/v1/auth/register`,
  login: `${API_BASE_URL}/api/v1/auth/login`,
  me: `${API_BASE_URL}/api/v1/auth/me`,
  logout: `${API_BASE_URL}/api/v1/auth/logout`,
  news: `${API_BASE_URL}/api/v1/news`,
  latestNews: `${API_BASE_URL}/api/v1/news/latest`,
};

export interface ConnectionStatus {
  isOnline: boolean | null;
  lastCheckedAt: Date | null;
}

type ConnectionListener = (status: ConnectionStatus) => void;

let currentConnectionStatus: ConnectionStatus = {
  isOnline: null,
  lastCheckedAt: null,
};

const listeners = new Set<ConnectionListener>();

export function getConnectionStatus(): ConnectionStatus {
  return currentConnectionStatus;
}

export function subscribeConnectionStatus(listener: ConnectionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function updateConnectionStatus(isOnline: boolean) {
  currentConnectionStatus = {
    isOnline,
    lastCheckedAt: new Date(),
  };
  listeners.forEach((listener) => {
    try {
      listener(currentConnectionStatus);
    } catch (e) {
      console.error('Error in connection listener:', e);
    }
  });
}

export async function pingConnection(timeoutMs: number = 4000): Promise<boolean> {
  const isOnline = await checkEndpoint(ENDPOINTS.connection, timeoutMs);
  updateConnectionStatus(isOnline);
  return isOnline;
}

export async function checkEndpoint(url: string, timeoutMs: number = 4000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

export async function checkServerConnectivity(): Promise<{ isOnline: boolean; isOffline: boolean }> {
  try {
    const [webResult, apiResult] = await Promise.all([
      checkEndpoint(ENDPOINTS.web),
      checkEndpoint(ENDPOINTS.api),
    ]);

    const isOnline = webResult || apiResult;
    updateConnectionStatus(isOnline);
    return {
      isOnline,
      isOffline: !isOnline,
    };
  } catch {
    updateConnectionStatus(false);
    return {
      isOnline: false,
      isOffline: true,
    };
  }
}
