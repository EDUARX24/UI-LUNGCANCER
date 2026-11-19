import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// In-memory token management
let inMemoryAccessToken: string | null = null;
let inMemoryCsrfToken: string | null = null;

export const setAuthTokens = (accessToken: string | null, csrfToken?: string | null) => {
  inMemoryAccessToken = accessToken;
  if (accessToken) {
    sessionStorage.setItem("access_token", accessToken);
  } else {
    sessionStorage.removeItem("access_token");
  }

  if (csrfToken !== undefined) {
    inMemoryCsrfToken = csrfToken;
    if (csrfToken) {
      sessionStorage.setItem("csrf_token", csrfToken);
    } else {
      sessionStorage.removeItem("csrf_token");
    }
  }
};

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken || sessionStorage.getItem("access_token");
};

export const getCsrfToken = (): string | null => {
  return inMemoryCsrfToken || sessionStorage.getItem("csrf_token");
};

// Base API Client
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 20000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Mutex & queue for concurrent 401 token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer token and CSRF when available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Attach CSRF token on refresh endpoint
    if (config.url?.includes("/auth/refresh")) {
      const csrf = getCsrfToken();
      if (csrf && !config.headers["X-CSRF-Token"]) {
        config.headers["X-CSRF-Token"] = csrf;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Silent Refresh Mutex
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Ignore 401s originating from /login, /refresh, or /logout to avoid infinite loops or refreshing on logout
    if (
      !originalRequest ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout") ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const csrfToken = getCsrfToken();
        const refreshResponse = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
          }
        );

        const newAccessToken = refreshResponse.data?.access_token;
        const newCsrfToken = refreshResponse.data?.csrf_token;

        if (newAccessToken) {
          setAuthTokens(newAccessToken, newCsrfToken);
          processQueue(null, newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error("No access token returned in refresh response");
        }
      } catch (refreshErr) {
        processQueue(refreshErr instanceof Error ? refreshErr : new Error("Token refresh failed"), null);
        setAuthTokens(null, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
