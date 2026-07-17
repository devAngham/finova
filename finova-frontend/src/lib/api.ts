import axios from 'axios';

type ImportMetaEnv = {
  readonly VITE_API_URL?: string;
};

const API_URL =
  (import.meta as ImportMeta & { env?: ImportMetaEnv }).env?.VITE_API_URL ||
  'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject(error);
  },
);

export default api;
