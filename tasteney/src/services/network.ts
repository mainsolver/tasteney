export const ENDPOINTS = {
  web: 'https://tasteney.com/up',
  api: 'https://api.tasteney.com/up',
};

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
    return {
      isOnline,
      isOffline: !isOnline,
    };
  } catch {
    return {
      isOnline: false,
      isOffline: true,
    };
  }
}
