import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://eco-almaty-576239332238.asia-northeast1.run.app';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/refresh' &&
      originalRequest.url !== '/logout' &&
      originalRequest.url !== '/login'
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        const res = await api.post('/refresh', { refresh_token: refreshToken });
        const { access_token, refresh_token: newRefresh } = res.data;

        localStorage.setItem('token', access_token);
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      }  catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export const getAvatarUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};
