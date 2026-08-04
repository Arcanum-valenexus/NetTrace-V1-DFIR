export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem('nettrace_access_token');
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem('nettrace_refresh_token');
  } catch {
    return null;
  }
};

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  try {
    localStorage.setItem('nettrace_access_token', accessToken);
    localStorage.setItem('nettrace_refresh_token', refreshToken);
  } catch (err) {
    console.error('Failed to store auth tokens in localStorage', err);
  }
};

export const clearAuthTokens = () => {
  try {
    localStorage.removeItem('nettrace_access_token');
    localStorage.removeItem('nettrace_refresh_token');
  } catch (err) {
    console.error('Failed to clear auth tokens', err);
  }
};

interface FetchOptions extends RequestInit {
  skipAuthToken?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

export async function apiClient<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuthToken = false, headers: customHeaders, body, ...restOptions } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: Record<string, string> = {
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (!(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAccessToken();
  if (token && !skipAuthToken) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response = await fetch(url, {
      ...restOptions,
      headers,
      body,
    });

    // Handle 401 Unauthorized - Attempt Token Refresh
    if (response.status === 401 && !skipAuthToken && getRefreshToken() && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = getRefreshToken();
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshEnvelope = await refreshRes.json();
            const tokenData = refreshEnvelope.data || refreshEnvelope;
            const newAccessToken = tokenData.access_token || tokenData.accessToken;
            const newRefreshToken = tokenData.refresh_token || tokenData.refreshToken || refreshToken;

            if (newAccessToken) {
              setAuthTokens(newAccessToken, newRefreshToken);
              onRefreshed(newAccessToken);
            } else {
              clearAuthTokens();
            }
          } else {
            clearAuthTokens();
          }
        } catch {
          clearAuthTokens();
        } finally {
          isRefreshing = false;
        }
      }

      // Retry request with new access token if available
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...restOptions,
          headers,
          body,
        });
      }
    }

    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && (data.detail || data.message || data.error)) ||
        `HTTP Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Unwrap ResponseEnvelope if present
    if (typeof data === 'object' && data !== null && 'success' in data && 'data' in data) {
      return data.data as T;
    }

    return data as T;
  } catch (error: any) {
    throw error;
  }
}
